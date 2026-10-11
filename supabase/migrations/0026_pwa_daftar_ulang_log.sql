-- 1) Batas cek status: maks. 20 percobaan per jam per perangkat (kunci = hash IP dari server).
create table cek_log (kunci text not null, waktu timestamptz not null default now());
create index on cek_log (kunci, waktu);
alter table cek_log enable row level security;
revoke all on cek_log from anon, authenticated;

-- 2) Daftar ulang: pengaturan per sekolah dan isian per pendaftar.
alter table sekolah add column daftar_ulang jsonb not null default '{"aktif": false}'
  check (jsonb_typeof(daftar_ulang) = 'object');
grant update (daftar_ulang) on sekolah to authenticated;
alter table pendaftar add column daftar_ulang jsonb;
alter table pendaftar add column daftar_ulang_pada timestamptz;

-- Hasil cek status. Dipanggil server (service_role) agar batas percobaan tidak bisa dilewati.
create or replace function cek_status_aman(p_slug text, p_nomor text, p_kunci text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare hasil jsonb;
begin
  delete from cek_log where waktu < now() - interval '1 day';
  if (select count(*) from cek_log where kunci = p_kunci and waktu > now() - interval '1 hour') >= 20 then
    raise exception 'terlalu_banyak';
  end if;
  insert into cek_log (kunci) values (left(p_kunci, 64));
  select jsonb_build_object(
    'nomor', p.nomor, 'nama_anak', p.nama_anak,
    'status', case when tunda then 'Baru' else p.status end,
    'catatan', case when tunda then null else p.catatan end,
    'umumkan_pada', case when tunda then s.umumkan_pada end,
    'sekolah', s.nama, 'logo_path', s.logo_path, 'jalur', j.nama, 'syarat_berkas', coalesce(to_jsonb(j.syarat_berkas), '[]'),
    'berkas', coalesce((select jsonb_agg(b.jenis) from berkas b where b.pendaftar_id = p.id), '[]'),
    'daftar_ulang', case when not tunda and p.status = 'Diterima' and coalesce((s.daftar_ulang->>'aktif')::boolean, false)
      then s.daftar_ulang end,
    'daftar_ulang_pada', p.daftar_ulang_pada)
  into hasil
  from pendaftar p join sekolah s on s.id = p.sekolah_id left join jalur j on j.id = p.jalur_id
    cross join lateral (select s.umumkan_pada is not null and now() < s.umumkan_pada as tunda) t
  where s.slug = p_slug and p.nomor = upper(trim(p_nomor));
  return hasil;
end $$;
revoke all on function cek_status_aman(text, text, text) from public, anon, authenticated;
grant execute on function cek_status_aman(text, text, text) to service_role;
-- versi tanpa batas tidak lagi boleh dipanggil langsung dari browser
revoke execute on function cek_status_nomor(text, text) from anon, authenticated;
revoke execute on function cek_status(text, text, date) from anon, authenticated;

-- Simpan isian daftar ulang (dipanggil server memakai service_role).
create or replace function kirim_daftar_ulang(p_slug text, p_nomor text, p_tgl date, p_isian jsonb) returns void
language plpgsql security definer set search_path = public as $$
declare p pendaftar%rowtype; s sekolah%rowtype;
begin
  select p2.* into p from pendaftar p2 join sekolah s2 on s2.id = p2.sekolah_id
    where s2.slug = p_slug and p2.nomor = upper(trim(p_nomor)) and p2.tanggal_lahir = p_tgl;
  if not found then raise exception 'pendaftar_tidak_ditemukan'; end if;
  select * into s from sekolah where id = p.sekolah_id;
  if p.status <> 'Diterima' or (s.umumkan_pada is not null and now() < s.umumkan_pada)
     or not coalesce((s.daftar_ulang->>'aktif')::boolean, false) then raise exception 'daftar_ulang_tutup'; end if;
  if (s.daftar_ulang->>'tenggat') is not null and now() > (s.daftar_ulang->>'tenggat')::timestamptz then
    raise exception 'daftar_ulang_tutup'; end if;
  if jsonb_typeof(p_isian) <> 'object' or length(p_isian::text) > 5000 then raise exception 'isian_tidak_valid'; end if;
  update pendaftar set daftar_ulang = p_isian, daftar_ulang_pada = now() where id = p.id;
end $$;
revoke all on function kirim_daftar_ulang(text, text, date, jsonb) from public, anon, authenticated;
grant execute on function kirim_daftar_ulang(text, text, date, jsonb) to service_role;

-- Berkas daftar ulang boleh diunggah oleh pendaftar yang diterima.
create or replace function siapkan_berkas(p_slug text, p_nomor text, p_tgl date, p_jenis text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare p pendaftar%rowtype; s sekolah%rowtype; j jalur%rowtype; boleh boolean;
begin
  select p2.* into p from pendaftar p2 join sekolah s2 on s2.id = p2.sekolah_id
    where s2.slug = p_slug and p2.nomor = upper(trim(p_nomor)) and p2.tanggal_lahir = p_tgl;
  if not found then raise exception 'pendaftar_tidak_ditemukan'; end if;
  select * into s from sekolah where id = p.sekolah_id;
  if langganan_status(s.id) not in ('trial','aktif') then raise exception 'pendaftaran_ditutup'; end if;
  select * into j from jalur where id = p.jalur_id;
  boleh := found and p_jenis = any (j.syarat_berkas);
  if not boleh and p.status = 'Diterima' and coalesce((s.daftar_ulang->>'aktif')::boolean, false)
     and (s.umumkan_pada is null or now() >= s.umumkan_pada) then
    boleh := s.daftar_ulang->'berkas' ? p_jenis;
  end if;
  if not boleh then raise exception 'jenis_berkas_tidak_valid'; end if;
  return jsonb_build_object('sekolah_id', s.id, 'pendaftar_id', p.id, 'format', s.format_berkas);
end $$;

-- 3) Notifikasi HP admin.
create table push_langganan (
  id uuid primary key default gen_random_uuid(),
  sekolah_id uuid not null references sekolah on delete cascade,
  endpoint text not null unique check (char_length(endpoint) <= 1000),
  p256dh text not null check (char_length(p256dh) <= 200),
  auth text not null check (char_length(auth) <= 100),
  dibuat_pada timestamptz not null default now()
);
create index on push_langganan (sekolah_id);
alter table push_langganan enable row level security;
revoke all on push_langganan from anon, authenticated;
grant select, delete on push_langganan to authenticated;
grant insert (sekolah_id, endpoint, p256dh, auth) on push_langganan to authenticated;
create policy baca on push_langganan for select to authenticated using (sekolah_id = sekolah_saya());
create policy tambah on push_langganan for insert to authenticated with check (sekolah_id = sekolah_saya());
create policy hapus on push_langganan for delete to authenticated using (sekolah_id = sekolah_saya());

-- 4) Catatan error aplikasi (hanya service_role).
create table galat_log (
  id bigint generated always as identity primary key,
  sumber text not null check (sumber in ('server', 'browser')),
  pesan text not null check (char_length(pesan) <= 500),
  url text check (char_length(url) <= 500),
  detail text check (char_length(detail) <= 4000),
  waktu timestamptz not null default now()
);
create index on galat_log (waktu desc);
alter table galat_log enable row level security;
revoke all on galat_log from anon, authenticated;
