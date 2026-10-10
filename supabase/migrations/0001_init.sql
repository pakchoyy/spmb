-- Gerbang (SPMB multi-sekolah): skema awal, RLS, dan fungsi.
-- Prinsip: anon tidak boleh menyentuh tabel; hanya memanggil fungsi di bawah.

create extension if not exists pgcrypto;
alter default privileges in schema public revoke execute on functions from public;

-- ───────── Tabel ─────────
create table pengaturan (
  id int primary key default 1 check (id = 1),
  lynk_url text,
  harga_paket int,
  komisi_nominal int not null default 7000,
  batas_pencairan int not null default 25000
);
insert into pengaturan default values;

create table sekolah (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique
    check (slug ~ '^[a-z0-9](?:[a-z0-9-]{1,38})[a-z0-9]$'
           and slug not in ('admin','masuk','daftar','aktivasi','super','api')),
  nama text not null,
  npsn text,
  alamat text,
  logo_path text,
  warna_aksen text not null default '#2449d8' check (warna_aksen ~ '^#[0-9a-fA-F]{6}$'),
  banner_path text,
  keunggulan text[] not null default '{}' check (cardinality(keunggulan) <= 5),
  format_berkas text[] not null default '{pdf,jpg,png}',
  kontak_wa text,
  peta_url text,
  instagram text,
  slug_dikunci boolean not null default false,
  nonaktif boolean not null default false,       -- diatur pemilik
  kode_ajakan text not null unique default upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 8)),
  diajak_oleh text,                              -- kode ajakan sekolah pengajak
  dibuat_pada timestamptz not null default now()
);
create table slug_lama (
  slug text primary key,
  sekolah_id uuid not null references sekolah on delete cascade
);

create table admin_sekolah (
  user_id uuid primary key references auth.users on delete cascade,
  sekolah_id uuid not null unique references sekolah on delete cascade,  -- satu admin per sekolah
  email text not null unique
);

create table langganan (
  sekolah_id uuid primary key references sekolah on delete cascade,
  trial_until timestamptz not null default now() + interval '7 days',
  active_until timestamptz,
  dibatalkan boolean not null default false
);

create table kode_aktivasi (
  kode text primary key,
  sekolah_id uuid not null references sekolah on delete cascade,
  email text not null,
  dibuat_pada timestamptz not null default now(),
  dipakai_pada timestamptz
);
create table log_langganan (
  id bigserial primary key,
  sekolah_id uuid references sekolah on delete set null,
  peristiwa text not null,
  detail jsonb,
  waktu timestamptz not null default now()
);

create table jalur (
  id uuid primary key default gen_random_uuid(),
  sekolah_id uuid not null references sekolah on delete cascade,
  nama text not null check (nama in ('Domisili','Afirmasi','Prestasi','Mutasi')),
  aktif boolean not null default true,
  kuota int check (kuota >= 0),
  buka timestamptz,
  tutup timestamptz,
  syarat_berkas text[] not null default '{}',
  unique (sekolah_id, nama)
);
create table form_field (
  id uuid primary key default gen_random_uuid(),
  sekolah_id uuid not null references sekolah on delete cascade,
  label text not null,
  tipe text not null check (tipe in ('teks','angka','tanggal','pilihan','paragraf')),
  opsi text[],
  wajib boolean not null default true,
  urutan int not null default 0
);
create table pendaftar (
  id uuid primary key default gen_random_uuid(),
  sekolah_id uuid not null references sekolah on delete cascade,
  nomor text not null,
  jalur_id uuid references jalur on delete set null,
  nama_anak text not null,
  tanggal_lahir date not null,
  isian jsonb not null default '{}',
  status text not null default 'Baru' check (status in ('Baru','Diterima','Cadangan','Ditolak')),
  catatan text,
  perangkat text,
  dibuat_pada timestamptz not null default now(),
  unique (sekolah_id, nomor)
);
create index on pendaftar (sekolah_id, status);
create table berkas (
  id uuid primary key default gen_random_uuid(),
  pendaftar_id uuid not null references pendaftar on delete cascade,
  sekolah_id uuid not null references sekolah on delete cascade,
  jenis text not null,
  path text not null,
  ukuran int not null check (ukuran <= 2097152)
);
create table galeri (
  id uuid primary key default gen_random_uuid(),
  sekolah_id uuid not null references sekolah on delete cascade,
  path text not null,
  urutan int not null default 0
);

-- ───────── Status langganan (waktu server) ─────────
create function langganan_status(p_sekolah uuid) returns text
language sql stable security definer set search_path = public as $$
  select case
    when s.nonaktif or l.dibatalkan then 'nonaktif'
    when l.active_until is not null and now() <= l.active_until then 'aktif'
    when l.active_until is null and now() <= l.trial_until then 'trial'
    when now() <= greatest(l.trial_until, coalesce(l.active_until, l.trial_until)) + interval '3 days' then 'tenggang'
    else 'nonaktif' end
  from sekolah s join langganan l on l.sekolah_id = s.id
  where s.id = p_sekolah
$$;

create function sekolah_saya() returns uuid
language sql stable security definer set search_path = public as $$
  select sekolah_id from admin_sekolah where user_id = auth.uid()
$$;

create function bisa_tulis(p_sekolah uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select p_sekolah = sekolah_saya() and langganan_status(p_sekolah) in ('trial','aktif')
$$;

-- ───────── RLS ─────────
alter table pengaturan enable row level security;
alter table sekolah enable row level security;
alter table slug_lama enable row level security;
alter table admin_sekolah enable row level security;
alter table langganan enable row level security;
alter table kode_aktivasi enable row level security;
alter table log_langganan enable row level security;
alter table jalur enable row level security;
alter table form_field enable row level security;
alter table pendaftar enable row level security;
alter table berkas enable row level security;
alter table galeri enable row level security;

revoke all on all tables in schema public from anon, authenticated;
revoke all on all functions in schema public from public, anon, authenticated;

-- admin membaca data sekolahnya sendiri (tenggang tetap bisa baca)
grant select on sekolah, admin_sekolah, langganan, jalur, form_field, pendaftar, berkas, galeri to authenticated;
grant update (nama, npsn, alamat, logo_path, warna_aksen, banner_path, keunggulan,
              format_berkas, kontak_wa, peta_url, instagram, slug_dikunci) on sekolah to authenticated;
grant insert, update, delete on jalur, form_field, galeri to authenticated;
grant update (status, catatan) on pendaftar to authenticated;
grant delete on pendaftar to authenticated;

create policy baca_sekolah on sekolah for select to authenticated using (id = sekolah_saya());
create policy ubah_sekolah on sekolah for update to authenticated
  using (bisa_tulis(id)) with check (id = sekolah_saya());
create policy baca_admin on admin_sekolah for select to authenticated using (user_id = auth.uid());
create policy baca_langganan on langganan for select to authenticated using (sekolah_id = sekolah_saya());

do $$ declare t text; begin
  foreach t in array array['jalur','form_field','galeri'] loop
    execute format('create policy baca on %I for select to authenticated using (sekolah_id = sekolah_saya())', t);
    execute format('create policy tulis on %I for all to authenticated using (bisa_tulis(sekolah_id)) with check (bisa_tulis(sekolah_id))', t);
  end loop;
end $$;
create policy baca on pendaftar for select to authenticated using (sekolah_id = sekolah_saya());
create policy ubah on pendaftar for update to authenticated using (bisa_tulis(sekolah_id)) with check (sekolah_id = sekolah_saya());
create policy hapus on pendaftar for delete to authenticated using (bisa_tulis(sekolah_id));
create policy baca on berkas for select to authenticated using (sekolah_id = sekolah_saya());
-- pengaturan, kode_aktivasi, log_langganan, slug_lama: tanpa policy = hanya service_role.

-- ───────── Fungsi publik (anon) ─────────
create function cek_slug(p_slug text) returns boolean
language sql stable security definer set search_path = public as $$
  select p_slug ~ '^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$'
     and p_slug not in ('admin','masuk','daftar','aktivasi','super','api')
     and not exists (select 1 from sekolah where slug = p_slug)
     and not exists (select 1 from slug_lama where slug = p_slug)
$$;

create function sekolah_publik(p_slug text) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'slug', s.slug, 'nama', s.nama, 'alamat', s.alamat, 'logo_path', s.logo_path,
    'warna_aksen', s.warna_aksen, 'banner_path', s.banner_path, 'keunggulan', s.keunggulan,
    'format_berkas', s.format_berkas, 'kontak_wa', s.kontak_wa, 'peta_url', s.peta_url,
    'instagram', s.instagram, 'status', langganan_status(s.id),
    'jalur', coalesce((select jsonb_agg(to_jsonb(j) - 'sekolah_id') from jalur j where j.sekolah_id = s.id and j.aktif), '[]'),
    'form', coalesce((select jsonb_agg(to_jsonb(f) - 'sekolah_id' order by f.urutan) from form_field f where f.sekolah_id = s.id), '[]'),
    'galeri', coalesce((select jsonb_agg(g.path order by g.urutan) from galeri g where g.sekolah_id = s.id), '[]'))
  from sekolah s where s.slug = p_slug
$$;

-- slug lama -> slug baru (QR yang sudah tercetak tetap hidup)
create function slug_pengalihan(p_slug text) returns text
language sql stable security definer set search_path = public as $$
  select s.slug from slug_lama l join sekolah s on s.id = l.sekolah_id where l.slug = p_slug
$$;

create function daftar_pendaftar(
  p_slug text, p_jalur uuid, p_nama_anak text, p_tgl_lahir date,
  p_isian jsonb, p_perangkat text
) returns text
language plpgsql security definer set search_path = public as $$
declare s sekolah%rowtype; nomor text; j jalur%rowtype;
begin
  select * into s from sekolah where slug = p_slug;
  if not found or langganan_status(s.id) not in ('trial','aktif') then
    raise exception 'pendaftaran_ditutup';
  end if;
  if p_perangkat is not null and (select count(*) from pendaftar
      where sekolah_id = s.id and perangkat = p_perangkat and dibuat_pada > now() - interval '1 hour') >= 5 then
    raise exception 'terlalu_banyak';
  end if;
  if p_jalur is not null then
    select * into j from jalur where id = p_jalur and sekolah_id = s.id and aktif;
    if not found then raise exception 'jalur_tidak_valid'; end if;
    if (j.buka is not null and now() < j.buka) or (j.tutup is not null and now() > j.tutup) then
      raise exception 'jalur_tutup'; end if;
    if j.kuota is not null and (select count(*) from pendaftar where jalur_id = j.id) >= j.kuota then
      raise exception 'kuota_penuh'; end if;
  end if;
  nomor := to_char(now(), 'YY') || '-' || upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 6));
  insert into pendaftar (sekolah_id, nomor, jalur_id, nama_anak, tanggal_lahir, isian, perangkat)
    values (s.id, nomor, p_jalur, left(p_nama_anak, 100), p_tgl_lahir, coalesce(p_isian,'{}'), left(p_perangkat, 64));
  return nomor;
end $$;

create function cek_status(p_slug text, p_nomor text, p_tgl_lahir date) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object('nomor', p.nomor, 'nama_anak', p.nama_anak, 'status', p.status, 'catatan', p.catatan)
  from pendaftar p join sekolah s on s.id = p.sekolah_id
  where s.slug = p_slug and p.nomor = upper(p_nomor) and p.tanggal_lahir = p_tgl_lahir
$$;

grant execute on function cek_slug(text), sekolah_publik(text), slug_pengalihan(text),
  daftar_pendaftar(text,uuid,text,date,jsonb,text), cek_status(text,text,date) to anon, authenticated;

-- ───────── Fungsi admin (authenticated) ─────────
-- Dipanggil setelah konfirmasi email; membuat sekolah + langganan trial 7 hari.
create function buat_sekolah(p_slug text, p_nama text, p_npsn text, p_kode_ref text) returns uuid
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); sid uuid; em text;
begin
  if uid is null then raise exception 'belum_masuk'; end if;
  if exists (select 1 from admin_sekolah where user_id = uid) then raise exception 'sudah_punya_sekolah'; end if;
  if not cek_slug(p_slug) then raise exception 'slug_tidak_tersedia'; end if;
  select email into em from auth.users where id = uid;
  insert into sekolah (slug, nama, npsn, diajak_oleh)
    values (p_slug, left(p_nama,150), nullif(p_npsn,''),
            (select kode_ajakan from sekolah where kode_ajakan = upper(nullif(p_kode_ref,''))))
    returning id into sid;
  insert into langganan (sekolah_id) values (sid);
  insert into admin_sekolah (user_id, sekolah_id, email) values (uid, sid, lower(em));
  return sid;
end $$;

create function gunakan_kode(p_kode text) returns timestamptz
language plpgsql security definer set search_path = public as $$
declare sid uuid := sekolah_saya(); k kode_aktivasi%rowtype; base timestamptz; baru timestamptz;
begin
  if sid is null then raise exception 'belum_masuk'; end if;
  select * into k from kode_aktivasi where kode = upper(trim(p_kode)) and sekolah_id = sid for update;
  if not found or k.dipakai_pada is not null then raise exception 'kode_tidak_valid'; end if;
  update kode_aktivasi set dipakai_pada = now() where kode = k.kode;
  -- perpanjangan menambah 1 tahun dari tanggal berakhir, sisa hari tidak hangus
  select greatest(coalesce(active_until, now()), now()) into base from langganan where sekolah_id = sid;
  update langganan set active_until = base + interval '1 year', dibatalkan = false
    where sekolah_id = sid returning active_until into baru;
  insert into log_langganan (sekolah_id, peristiwa, detail) values (sid, 'kode_dipakai', jsonb_build_object('kode', k.kode));
  return baru;
end $$;

create function status_saya() returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object('status', langganan_status(sekolah_id), 'trial_until', trial_until, 'active_until', active_until)
  from langganan where sekolah_id = sekolah_saya()
$$;

grant execute on function buat_sekolah(text,text,text,text), gunakan_kode(text), status_saya(),
  langganan_status(uuid), sekolah_saya(), bisa_tulis(uuid) to authenticated;

-- ───────── Fungsi khusus server (service_role) ─────────
-- Hanya email admin terdaftar yang mendapat kode; maksimal 3 permintaan/email/hari.
create function minta_kode_aktivasi(p_email text) returns text
language plpgsql security definer set search_path = public as $$
declare sid uuid; v text; alfabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; i int;
begin
  select sekolah_id into sid from admin_sekolah where email = lower(trim(p_email));
  if sid is null then return null; end if;
  if (select count(*) from kode_aktivasi where email = lower(trim(p_email)) and dibuat_pada > now() - interval '1 day') >= 3 then
    raise exception 'batas_harian';
  end if;
  loop
    v := 'SPMB-';
    for i in 1..5 loop v := v || substr(alfabet, 1 + get_byte(gen_random_bytes(1), 0) % 31, 1); end loop;
    exit when not exists (select 1 from kode_aktivasi where kode = v);
  end loop;
  insert into kode_aktivasi (kode, sekolah_id, email) values (v, sid, lower(trim(p_email)));
  insert into log_langganan (sekolah_id, peristiwa, detail) values (sid, 'kode_dibuat', jsonb_build_object('kode', v));
  return v;
end $$;
revoke all on function minta_kode_aktivasi(text) from public, anon, authenticated;
grant execute on function minta_kode_aktivasi(text) to service_role;
