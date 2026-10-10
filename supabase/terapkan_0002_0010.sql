-- Gabungan migrasi 0002, 0004–0010 untuk ditempel sekali di SQL Editor Supabase.
-- 0001 dan 0003 sudah terpasang. Dibuat otomatis dari folder migrations/; jangan diedit tangan.

-- ===== 0002_berkas_dan_persetujuan.sql =====
-- Form orang tua: persetujuan privasi, bucket berkas privat, dan fungsi upload.

alter table pendaftar add column setuju_privasi_pada timestamptz;

-- bucket privat, batas 2 MB dikunci di sisi storage
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('berkas', 'berkas', false, 2097152, array['application/pdf','image/jpeg','image/png'])
on conflict (id) do update set public = false, file_size_limit = 2097152,
  allowed_mime_types = excluded.allowed_mime_types;

-- daftar_pendaftar: tambah persetujuan privasi (wajib)
drop function daftar_pendaftar(text,uuid,text,date,jsonb,text);
create function daftar_pendaftar(
  p_slug text, p_jalur uuid, p_nama_anak text, p_tgl_lahir date,
  p_isian jsonb, p_perangkat text, p_setuju boolean
) returns text
language plpgsql security definer set search_path = public as $$
declare s sekolah%rowtype; nomor text; j jalur%rowtype;
begin
  if not coalesce(p_setuju, false) then raise exception 'perlu_persetujuan'; end if;
  if p_tgl_lahir > current_date or p_tgl_lahir < current_date - interval '30 years' then
    raise exception 'tanggal_lahir_tidak_valid'; end if;
  select * into s from sekolah where slug = p_slug;
  if not found or langganan_status(s.id) not in ('trial','aktif') then
    raise exception 'pendaftaran_ditutup';
  end if;
  if p_perangkat is not null and (select count(*) from pendaftar
      where sekolah_id = s.id and perangkat = p_perangkat and dibuat_pada > now() - interval '1 hour') >= 5 then
    raise exception 'terlalu_banyak';
  end if;
  if exists (select 1 from jalur where sekolah_id = s.id and aktif) and p_jalur is null then
    raise exception 'jalur_wajib'; end if;
  if p_jalur is not null then
    select * into j from jalur where id = p_jalur and sekolah_id = s.id and aktif;
    if not found then raise exception 'jalur_tidak_valid'; end if;
    if (j.buka is not null and now() < j.buka) or (j.tutup is not null and now() > j.tutup) then
      raise exception 'jalur_tutup'; end if;
    if j.kuota is not null and (select count(*) from pendaftar where jalur_id = j.id) >= j.kuota then
      raise exception 'kuota_penuh'; end if;
  end if;
  nomor := to_char(now(), 'YY') || '-' || upper(substr(encode(extensions.gen_random_bytes(4), 'hex'), 1, 6));
  insert into pendaftar (sekolah_id, nomor, jalur_id, nama_anak, tanggal_lahir, isian, perangkat, setuju_privasi_pada)
    values (s.id, nomor, p_jalur, left(trim(p_nama_anak), 100), p_tgl_lahir, coalesce(p_isian,'{}'), left(p_perangkat, 64), now());
  return nomor;
end $$;
grant execute on function daftar_pendaftar(text,uuid,text,date,jsonb,text,boolean) to anon, authenticated;

-- cek_status: tambah jalur, syarat berkas, dan berkas yang sudah terunggah
create or replace function cek_status(p_slug text, p_nomor text, p_tgl_lahir date) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'nomor', p.nomor, 'nama_anak', p.nama_anak, 'status', p.status, 'catatan', p.catatan,
    'sekolah', s.nama, 'jalur', j.nama, 'syarat_berkas', coalesce(to_jsonb(j.syarat_berkas), '[]'),
    'berkas', coalesce((select jsonb_agg(b.jenis) from berkas b where b.pendaftar_id = p.id), '[]'))
  from pendaftar p join sekolah s on s.id = p.sekolah_id left join jalur j on j.id = p.jalur_id
  where s.slug = p_slug and p.nomor = upper(trim(p_nomor)) and p.tanggal_lahir = p_tgl_lahir
$$;

-- Khusus server (service_role): validasi identitas pendaftar sebelum upload.
create function siapkan_berkas(p_slug text, p_nomor text, p_tgl date, p_jenis text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare p pendaftar%rowtype; s sekolah%rowtype; j jalur%rowtype;
begin
  select p2.* into p from pendaftar p2 join sekolah s2 on s2.id = p2.sekolah_id
    where s2.slug = p_slug and p2.nomor = upper(trim(p_nomor)) and p2.tanggal_lahir = p_tgl;
  if not found then raise exception 'pendaftar_tidak_ditemukan'; end if;
  select * into s from sekolah where id = p.sekolah_id;
  if langganan_status(s.id) not in ('trial','aktif') then raise exception 'pendaftaran_ditutup'; end if;
  select * into j from jalur where id = p.jalur_id;
  if not found or not (p_jenis = any (j.syarat_berkas)) then raise exception 'jenis_berkas_tidak_valid'; end if;
  return jsonb_build_object('sekolah_id', s.id, 'pendaftar_id', p.id, 'format', s.format_berkas);
end $$;

-- Mengembalikan path lama bila berkas jenis yang sama diganti.
create function catat_berkas(p_pendaftar uuid, p_jenis text, p_path text, p_ukuran int) returns text
language plpgsql security definer set search_path = public as $$
declare lama text; sid uuid;
begin
  select sekolah_id into sid from pendaftar where id = p_pendaftar;
  select path into lama from berkas where pendaftar_id = p_pendaftar and jenis = p_jenis;
  delete from berkas where pendaftar_id = p_pendaftar and jenis = p_jenis;
  insert into berkas (pendaftar_id, sekolah_id, jenis, path, ukuran) values (p_pendaftar, sid, p_jenis, p_path, p_ukuran);
  return lama;
end $$;

revoke all on function siapkan_berkas(text,text,date,text), catat_berkas(uuid,text,text,int) from public, anon, authenticated;
grant execute on function siapkan_berkas(text,text,date,text), catat_berkas(uuid,text,text,int) to service_role;

-- ===== 0004_pengaturan_sekolah.sql =====
-- Pengaturan sekolah: izin unggah aset, batas galeri, dan aturan edit jalur (opsi A).

-- format berkas harus subset dari pdf/jpg/png dan tidak kosong
alter table sekolah add constraint format_berkas_valid
  check (cardinality(format_berkas) > 0 and format_berkas <@ array['pdf','jpg','png']);

-- admin hanya boleh menulis ke folder sekolahnya sendiri, dan hanya saat trial/aktif
create policy aset_baca on storage.objects for select to authenticated
  using (bucket_id = 'sekolah-aset' and (storage.foldername(name))[1] = sekolah_saya()::text);
create policy aset_tambah on storage.objects for insert to authenticated
  with check (bucket_id = 'sekolah-aset' and (storage.foldername(name))[1] = sekolah_saya()::text and bisa_tulis(sekolah_saya()));
create policy aset_ubah on storage.objects for update to authenticated
  using (bucket_id = 'sekolah-aset' and (storage.foldername(name))[1] = sekolah_saya()::text and bisa_tulis(sekolah_saya()));
create policy aset_hapus on storage.objects for delete to authenticated
  using (bucket_id = 'sekolah-aset' and (storage.foldername(name))[1] = sekolah_saya()::text);

-- galeri maksimal 6 foto per sekolah
create function batasi_galeri() returns trigger language plpgsql as $$
begin
  if (select count(*) from galeri where sekolah_id = new.sekolah_id) >= 6 then
    raise exception 'galeri_penuh';
  end if;
  return new;
end $$;
create trigger galeri_maks before insert on galeri for each row execute function batasi_galeri();

-- Aturan edit jalur (opsi A): setelah periode dibuka atau sudah ada pendaftar,
-- nama dan syarat berkas boleh diubah, tetapi kuota dan periode terkunci.
create function jalur_terkunci(j jalur) returns boolean language sql stable security definer set search_path = public as $$
  select (j.buka is not null and j.buka <= now()) or exists (select 1 from pendaftar where jalur_id = j.id)
$$;

create function jaga_jalur() returns trigger language plpgsql as $$
begin
  if tg_op = 'DELETE' then
    if exists (select 1 from pendaftar where jalur_id = old.id) then raise exception 'jalur_terkunci'; end if;
    return old;
  end if;
  if jalur_terkunci(old) and (new.kuota is distinct from old.kuota or new.buka is distinct from old.buka
      or new.tutup is distinct from old.tutup) then
    raise exception 'jalur_terkunci';
  end if;
  if new.buka is not null and new.tutup is not null and new.tutup <= new.buka then
    raise exception 'periode_tidak_valid';
  end if;
  return new;
end $$;
create trigger jalur_jaga before update or delete on jalur for each row execute function jaga_jalur();

create function jaga_jalur_baru() returns trigger language plpgsql as $$
begin
  if new.buka is not null and new.tutup is not null and new.tutup <= new.buka then
    raise exception 'periode_tidak_valid';
  end if;
  return new;
end $$;
create trigger jalur_baru before insert on jalur for each row execute function jaga_jalur_baru();

-- dipakai UI untuk menampilkan kunci per jalur
grant execute on function jalur_terkunci(jalur) to authenticated;

-- ===== 0005_dashboard_pendaftar.sql =====
-- Dashboard pendaftar: nomor WhatsApp orang tua, akses berkas untuk admin, ringkasan, dan data ganda.

alter table pendaftar add column wa_ortu text check (wa_ortu ~ '^[0-9]{9,15}$');

-- daftar_pendaftar: tambah nomor WhatsApp orang tua (wajib, sudah dinormalkan ke 62…)
drop function daftar_pendaftar(text,uuid,text,date,jsonb,text,boolean);
create function daftar_pendaftar(
  p_slug text, p_jalur uuid, p_nama_anak text, p_tgl_lahir date,
  p_isian jsonb, p_perangkat text, p_setuju boolean, p_wa text
) returns text
language plpgsql security definer set search_path = public as $$
declare s sekolah%rowtype; nomor text; j jalur%rowtype;
begin
  if not coalesce(p_setuju, false) then raise exception 'perlu_persetujuan'; end if;
  if p_wa is null or p_wa !~ '^[0-9]{9,15}$' then raise exception 'wa_tidak_valid'; end if;
  if p_tgl_lahir > current_date or p_tgl_lahir < current_date - interval '30 years' then
    raise exception 'tanggal_lahir_tidak_valid'; end if;
  select * into s from sekolah where slug = p_slug;
  if not found or langganan_status(s.id) not in ('trial','aktif') then
    raise exception 'pendaftaran_ditutup';
  end if;
  if p_perangkat is not null and (select count(*) from pendaftar
      where sekolah_id = s.id and perangkat = p_perangkat and dibuat_pada > now() - interval '1 hour') >= 5 then
    raise exception 'terlalu_banyak';
  end if;
  if exists (select 1 from jalur where sekolah_id = s.id and aktif) and p_jalur is null then
    raise exception 'jalur_wajib'; end if;
  if p_jalur is not null then
    select * into j from jalur where id = p_jalur and sekolah_id = s.id and aktif;
    if not found then raise exception 'jalur_tidak_valid'; end if;
    if (j.buka is not null and now() < j.buka) or (j.tutup is not null and now() > j.tutup) then
      raise exception 'jalur_tutup'; end if;
    if j.kuota is not null and (select count(*) from pendaftar where jalur_id = j.id) >= j.kuota then
      raise exception 'kuota_penuh'; end if;
  end if;
  nomor := to_char(now(), 'YY') || '-' || upper(substr(encode(extensions.gen_random_bytes(4), 'hex'), 1, 6));
  insert into pendaftar (sekolah_id, nomor, jalur_id, nama_anak, tanggal_lahir, isian, perangkat, setuju_privasi_pada, wa_ortu)
    values (s.id, nomor, p_jalur, left(trim(p_nama_anak), 100), p_tgl_lahir, coalesce(p_isian,'{}'), left(p_perangkat, 64), now(), p_wa);
  return nomor;
end $$;
grant execute on function daftar_pendaftar(text,uuid,text,date,jsonb,text,boolean,text) to anon, authenticated;

-- admin membuka berkas lewat tautan sementara: path berkas = sekolah_id/pendaftar_id/nama
create policy berkas_baca_admin on storage.objects for select to authenticated
  using (bucket_id = 'berkas' and (storage.foldername(name))[1] = sekolah_saya()::text);

-- pendaftar dengan nama + tanggal lahir yang sama (kemungkinan data ganda), hanya sekolah sendiri
create function ganda_saya() returns setof uuid
language sql stable security definer set search_path = public as $$
  select id from (
    select id, count(*) over (partition by lower(regexp_replace(trim(nama_anak), '\s+', ' ', 'g')), tanggal_lahir) n
    from pendaftar where sekolah_id = sekolah_saya()
  ) t where n > 1
$$;

create function ringkasan_saya() returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'total', count(*),
    'baru', count(*) filter (where p.status = 'Baru'),
    'diterima', count(*) filter (where p.status = 'Diterima'),
    'cadangan', count(*) filter (where p.status = 'Cadangan'),
    'ditolak', count(*) filter (where p.status = 'Ditolak'),
    'hari_ini', count(*) filter (where (p.dibuat_pada at time zone 'Asia/Jakarta')::date = (now() at time zone 'Asia/Jakarta')::date),
    'berkas_kurang', count(*) filter (where p.status = 'Baru' and j.id is not null
        and cardinality(j.syarat_berkas) > (select count(*) from berkas b where b.pendaftar_id = p.id)))
  from pendaftar p left join jalur j on j.id = p.jalur_id
  where p.sekolah_id = sekolah_saya()
$$;
grant execute on function ganda_saya(), ringkasan_saya() to authenticated;

-- ===== 0006_langganan_aktivasi.sql =====
-- Langganan: sekolah yang dibatalkan/dinonaktifkan pemilik tidak bisa membuka diri sendiri lewat kode baru.

create or replace function status_saya() returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'status', langganan_status(l.sekolah_id), 'trial_until', l.trial_until, 'active_until', l.active_until,
    'dibatalkan', l.dibatalkan, 'dinonaktifkan', s.nonaktif, 'email', a.email)
  from langganan l join sekolah s on s.id = l.sekolah_id join admin_sekolah a on a.sekolah_id = s.id
  where l.sekolah_id = sekolah_saya()
$$;

create or replace function gunakan_kode(p_kode text) returns timestamptz
language plpgsql security definer set search_path = public as $$
declare sid uuid := sekolah_saya(); k kode_aktivasi%rowtype; base timestamptz; baru timestamptz;
begin
  if sid is null then raise exception 'belum_masuk'; end if;
  -- dibatalkan/dinonaktifkan pemilik: hanya pemilik yang bisa membukanya kembali
  if exists (select 1 from langganan l join sekolah s on s.id = l.sekolah_id
             where l.sekolah_id = sid and (l.dibatalkan or s.nonaktif)) then
    raise exception 'langganan_dibatalkan';
  end if;
  select * into k from kode_aktivasi where kode = upper(trim(p_kode)) and sekolah_id = sid for update;
  if not found or k.dipakai_pada is not null then raise exception 'kode_tidak_valid'; end if;
  update kode_aktivasi set dipakai_pada = now() where kode = k.kode;
  -- perpanjangan menambah 1 tahun dari tanggal berakhir, sisa hari tidak hangus
  select greatest(coalesce(active_until, now()), now()) into base from langganan where sekolah_id = sid;
  update langganan set active_until = base + interval '1 year' where sekolah_id = sid returning active_until into baru;
  insert into log_langganan (sekolah_id, peristiwa, detail) values (sid, 'kode_dipakai', jsonb_build_object('kode', k.kode));
  return baru;
end $$;

create or replace function minta_kode_aktivasi(p_email text) returns text
language plpgsql security definer set search_path = public as $$
declare sid uuid; v text; alfabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; i int;
begin
  select sekolah_id into sid from admin_sekolah where email = lower(trim(p_email));
  if sid is null then return null; end if;
  if exists (select 1 from langganan l join sekolah s on s.id = l.sekolah_id
             where l.sekolah_id = sid and (l.dibatalkan or s.nonaktif)) then
    return null;
  end if;
  if (select count(*) from kode_aktivasi where email = lower(trim(p_email)) and dibuat_pada > now() - interval '1 day') >= 3 then
    raise exception 'batas_harian';
  end if;
  loop
    v := 'SPMB-';
    for i in 1..5 loop v := v || substr(alfabet, 1 + get_byte(extensions.gen_random_bytes(1), 0) % 31, 1); end loop;
    exit when not exists (select 1 from kode_aktivasi where kode = v);
  end loop;
  insert into kode_aktivasi (kode, sekolah_id, email) values (v, sid, lower(trim(p_email)));
  insert into log_langganan (sekolah_id, peristiwa, detail) values (sid, 'kode_dibuat', jsonb_build_object('kode', v));
  return v;
end $$;

grant execute on function status_saya(), gunakan_kode(text) to authenticated;
revoke all on function minta_kode_aktivasi(text) from public, anon, authenticated;
grant execute on function minta_kode_aktivasi(text) to service_role;

-- ===== 0007_pemilik.sql =====
-- Halaman pemilik (/super). Semua fungsi di sini hanya untuk service_role; akses diputuskan
-- oleh aplikasi (akun dengan app_metadata.role = 'owner'), bukan oleh RLS.

create function ringkasan_sekolah() returns table (
  id uuid, slug text, nama text, npsn text, email text, dibuat_pada timestamptz,
  status text, trial_until timestamptz, active_until timestamptz,
  dibatalkan boolean, nonaktif boolean, jumlah_pendaftar bigint, diajak_oleh text
) language sql stable security definer set search_path = public as $$
  select s.id, s.slug, s.nama, s.npsn, a.email, s.dibuat_pada,
         langganan_status(s.id), l.trial_until, l.active_until, l.dibatalkan, s.nonaktif,
         (select count(*) from pendaftar p where p.sekolah_id = s.id), s.diajak_oleh
  from sekolah s
  left join admin_sekolah a on a.sekolah_id = s.id
  left join langganan l on l.sekolah_id = s.id
  order by s.dibuat_pada desc
$$;

-- Ganti slug secara atomik; slug lama dialihkan agar QR yang sudah tercetak tetap hidup.
create function ganti_slug(p_sekolah uuid, p_slug text) returns text
language plpgsql security definer set search_path = public as $$
declare lama text;
begin
  select slug into lama from sekolah where id = p_sekolah for update;
  if lama is null then raise exception 'sekolah_tidak_ada'; end if;
  if lama = p_slug then return lama; end if;
  if p_slug !~ '^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$'
     or p_slug in ('admin','masuk','daftar','aktivasi','super','api') then
    raise exception 'slug_tidak_valid';
  end if;
  if exists (select 1 from sekolah where slug = p_slug)
     or exists (select 1 from slug_lama where slug = p_slug and sekolah_id <> p_sekolah) then
    raise exception 'slug_dipakai';
  end if;
  delete from slug_lama where slug = p_slug;            -- kembali ke slug yang pernah dipakai sendiri
  insert into slug_lama (slug, sekolah_id) values (lama, p_sekolah);
  update sekolah set slug = p_slug where id = p_sekolah;
  insert into log_langganan (sekolah_id, peristiwa, detail)
    values (p_sekolah, 'pemilik_ganti_slug', jsonb_build_object('dari', lama, 'ke', p_slug));
  return p_slug;
end $$;

revoke all on function ringkasan_sekolah(), ganti_slug(uuid,text) from public, anon, authenticated;
grant execute on function ringkasan_sekolah(), ganti_slug(uuid,text) to service_role;

-- ===== 0008_arsip_data.sql =====
-- Arsip data tahun lalu: pendaftar yang diarsipkan tidak dihitung kuota, kunci jalur, ringkasan, dan data ganda.

alter table pendaftar add column diarsip boolean not null default false;
create index on pendaftar (sekolah_id, diarsip);

-- kuota jalur hanya menghitung pendaftar yang belum diarsipkan
create or replace function daftar_pendaftar(
  p_slug text, p_jalur uuid, p_nama_anak text, p_tgl_lahir date,
  p_isian jsonb, p_perangkat text, p_setuju boolean, p_wa text
) returns text
language plpgsql security definer set search_path = public as $$
declare s sekolah%rowtype; nomor text; j jalur%rowtype;
begin
  if not coalesce(p_setuju, false) then raise exception 'perlu_persetujuan'; end if;
  if p_wa is null or p_wa !~ '^[0-9]{9,15}$' then raise exception 'wa_tidak_valid'; end if;
  if p_tgl_lahir > current_date or p_tgl_lahir < current_date - interval '30 years' then
    raise exception 'tanggal_lahir_tidak_valid'; end if;
  select * into s from sekolah where slug = p_slug;
  if not found or langganan_status(s.id) not in ('trial','aktif') then
    raise exception 'pendaftaran_ditutup';
  end if;
  if p_perangkat is not null and (select count(*) from pendaftar
      where sekolah_id = s.id and perangkat = p_perangkat and dibuat_pada > now() - interval '1 hour') >= 5 then
    raise exception 'terlalu_banyak';
  end if;
  if exists (select 1 from jalur where sekolah_id = s.id and aktif) and p_jalur is null then
    raise exception 'jalur_wajib'; end if;
  if p_jalur is not null then
    select * into j from jalur where id = p_jalur and sekolah_id = s.id and aktif;
    if not found then raise exception 'jalur_tidak_valid'; end if;
    if (j.buka is not null and now() < j.buka) or (j.tutup is not null and now() > j.tutup) then
      raise exception 'jalur_tutup'; end if;
    if j.kuota is not null and (select count(*) from pendaftar where jalur_id = j.id and not diarsip) >= j.kuota then
      raise exception 'kuota_penuh'; end if;
  end if;
  nomor := to_char(now(), 'YY') || '-' || upper(substr(encode(extensions.gen_random_bytes(4), 'hex'), 1, 6));
  insert into pendaftar (sekolah_id, nomor, jalur_id, nama_anak, tanggal_lahir, isian, perangkat, setuju_privasi_pada, wa_ortu)
    values (s.id, nomor, p_jalur, left(trim(p_nama_anak), 100), p_tgl_lahir, coalesce(p_isian,'{}'), left(p_perangkat, 64), now(), p_wa);
  return nomor;
end $$;

-- Jalur terkunci bila ada pendaftar aktif, atau periodenya sudah dibuka dan belum pernah diarsipkan.
-- Jalur yang pendaftarnya sudah diarsipkan dianggap masuk musim baru, jadi kuota dan periode bisa diatur ulang.
create or replace function jalur_terkunci(j jalur) returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from pendaftar where jalur_id = j.id and not diarsip)
      or (j.buka is not null and j.buka <= now() and not exists (select 1 from pendaftar where jalur_id = j.id and diarsip))
$$;

create or replace function jaga_jalur() returns trigger language plpgsql as $$
begin
  if tg_op = 'DELETE' then
    if exists (select 1 from pendaftar where jalur_id = old.id and not diarsip) then raise exception 'jalur_terkunci'; end if;
    return old;
  end if;
  if jalur_terkunci(old) and (new.kuota is distinct from old.kuota or new.buka is distinct from old.buka
      or new.tutup is distinct from old.tutup) then
    raise exception 'jalur_terkunci';
  end if;
  if new.buka is not null and new.tutup is not null and new.tutup <= new.buka then
    raise exception 'periode_tidak_valid';
  end if;
  return new;
end $$;

create or replace function ganda_saya() returns setof uuid
language sql stable security definer set search_path = public as $$
  select id from (
    select id, count(*) over (partition by lower(regexp_replace(trim(nama_anak), '\s+', ' ', 'g')), tanggal_lahir) n
    from pendaftar where sekolah_id = sekolah_saya() and not diarsip
  ) t where n > 1
$$;

create or replace function ringkasan_saya() returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'total', count(*) filter (where not p.diarsip),
    'arsip', count(*) filter (where p.diarsip),
    'baru', count(*) filter (where not p.diarsip and p.status = 'Baru'),
    'diterima', count(*) filter (where not p.diarsip and p.status = 'Diterima'),
    'cadangan', count(*) filter (where not p.diarsip and p.status = 'Cadangan'),
    'ditolak', count(*) filter (where not p.diarsip and p.status = 'Ditolak'),
    'hari_ini', count(*) filter (where not p.diarsip and (p.dibuat_pada at time zone 'Asia/Jakarta')::date = (now() at time zone 'Asia/Jakarta')::date),
    'berkas_kurang', count(*) filter (where not p.diarsip and p.status = 'Baru' and j.id is not null
        and cardinality(j.syarat_berkas) > (select count(*) from berkas b where b.pendaftar_id = p.id)))
  from pendaftar p left join jalur j on j.id = p.jalur_id
  where p.sekolah_id = sekolah_saya()
$$;

-- Arsipkan / pulihkan semua pendaftar sekolah sendiri. Hanya saat trial atau aktif.
create function arsipkan_semua(p_arsip boolean) returns int
language plpgsql security definer set search_path = public as $$
declare sid uuid := sekolah_saya(); n int;
begin
  if sid is null or not bisa_tulis(sid) then raise exception 'tidak_boleh'; end if;
  update pendaftar set diarsip = p_arsip where sekolah_id = sid and diarsip = not p_arsip;
  get diagnostics n = row_count;
  insert into log_langganan (sekolah_id, peristiwa, detail)
    values (sid, case when p_arsip then 'arsipkan_pendaftar' else 'pulihkan_arsip' end, jsonb_build_object('jumlah', n));
  return n;
end $$;
grant execute on function arsipkan_semua(boolean) to authenticated;

-- admin boleh menghapus berkas pendaftar sekolahnya sendiri dari bucket privat (untuk hapus data arsip)
create policy berkas_hapus_admin on storage.objects for delete to authenticated
  using (bucket_id = 'berkas' and (storage.foldername(name))[1] = sekolah_saya()::text and bisa_tulis(sekolah_saya()));

-- catatan penghapusan arsip (jumlah saja, tanpa data anak)
create function catat_hapus_arsip(p_jumlah int) returns void
language sql security definer set search_path = public as $$
  insert into log_langganan (sekolah_id, peristiwa, detail)
  select sekolah_saya(), 'hapus_arsip', jsonb_build_object('jumlah', p_jumlah) where sekolah_saya() is not null
$$;
grant execute on function catat_hapus_arsip(int) to authenticated;

-- ===== 0009_slug_dipesan.sql =====
-- Daftar slug dipesan diperluas (auth, keluar adalah rute level atas). Satu sumber kebenaran: slug_dipesan().
create function slug_dipesan() returns text[] language sql immutable as $$
  select array['admin','masuk','daftar','aktivasi','super','api','auth','keluar']
$$;
grant execute on function slug_dipesan() to anon, authenticated, service_role;

alter table sekolah drop constraint sekolah_slug_check;
alter table sekolah add constraint sekolah_slug_check
  check (slug ~ '^[a-z0-9](?:[a-z0-9-]{1,38})[a-z0-9]$' and slug <> all (slug_dipesan()));

create or replace function cek_slug(p_slug text) returns boolean
language sql stable security definer set search_path = public as $$
  select p_slug ~ '^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$'
     and p_slug <> all (slug_dipesan())
     and not exists (select 1 from sekolah where slug = p_slug)
     and not exists (select 1 from slug_lama where slug = p_slug)
$$;

create or replace function ganti_slug(p_sekolah uuid, p_slug text) returns text
language plpgsql security definer set search_path = public as $$
declare lama text;
begin
  select slug into lama from sekolah where id = p_sekolah for update;
  if lama is null then raise exception 'sekolah_tidak_ada'; end if;
  if lama = p_slug then return lama; end if;
  if p_slug !~ '^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$' or p_slug = any (slug_dipesan()) then
    raise exception 'slug_tidak_valid';
  end if;
  if exists (select 1 from sekolah where slug = p_slug)
     or exists (select 1 from slug_lama where slug = p_slug and sekolah_id <> p_sekolah) then
    raise exception 'slug_dipakai';
  end if;
  delete from slug_lama where slug = p_slug;
  insert into slug_lama (slug, sekolah_id) values (lama, p_sekolah);
  update sekolah set slug = p_slug where id = p_sekolah;
  insert into log_langganan (sekolah_id, peristiwa, detail)
    values (p_sekolah, 'pemilik_ganti_slug', jsonb_build_object('dari', lama, 'ke', p_slug));
  return p_slug;
end $$;

-- ===== 0010_slug_hukum.sql =====
-- Halaman /syarat dan /privasi menjadi rute level atas, jadi dipesan sebagai slug.
create or replace function slug_dipesan() returns text[] language sql immutable as $$
  select array['admin','masuk','daftar','aktivasi','super','api','auth','keluar','syarat','privasi']
$$;
