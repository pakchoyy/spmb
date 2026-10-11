-- 1) Satu NPSN hanya untuk satu sekolah (mencegah pendaftaran ganda & trial berulang).
create unique index sekolah_npsn_unik on sekolah (npsn) where npsn is not null;
alter table sekolah add constraint sekolah_npsn_format check (npsn is null or npsn ~ '^[0-9]{8}$');

create or replace function npsn_terdaftar(p_npsn text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from sekolah where npsn = p_npsn)
$$;
revoke all on function npsn_terdaftar(text) from public;
grant execute on function npsn_terdaftar(text) to anon, authenticated;

create or replace function buat_sekolah(p_slug text, p_nama text, p_npsn text, p_kode_ref text) returns uuid
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); sid uuid; em text;
begin
  if uid is null then raise exception 'belum_masuk'; end if;
  if exists (select 1 from admin_sekolah where user_id = uid) then raise exception 'sudah_punya_sekolah'; end if;
  if not cek_slug(p_slug) then raise exception 'slug_tidak_tersedia'; end if;
  if coalesce(p_npsn, '') !~ '^[0-9]{8}$' then raise exception 'npsn_tidak_valid'; end if;
  if exists (select 1 from sekolah where npsn = p_npsn) then raise exception 'npsn_terdaftar'; end if;
  select email into em from auth.users where id = uid;
  insert into sekolah (slug, nama, npsn, diajak_oleh)
    values (p_slug, left(trim(p_nama), 150), p_npsn,
            (select kode_ajakan from sekolah where kode_ajakan = upper(nullif(trim(p_kode_ref), ''))))
    returning id into sid;
  insert into langganan (sekolah_id) values (sid);
  insert into admin_sekolah (user_id, sekolah_id, email) values (uid, sid, lower(em));
  return sid;
end $$;

-- 2) Program ajak sekolah: komisi per sekolah yang diajak dan sudah berlangganan.
alter table sekolah add column komisi_dicairkan int not null default 0 check (komisi_dicairkan >= 0); -- diatur pemilik

create or replace function ajakan_saya() returns jsonb
language sql stable security definer set search_path = public as $$
  with saya as (select id, kode_ajakan, komisi_dicairkan from sekolah where id = sekolah_saya()),
  diajak as (
    select s.nama, s.dibuat_pada,
           exists (select 1 from langganan l where l.sekolah_id = s.id and l.active_until is not null and not l.dibatalkan) as berbayar
    from sekolah s, saya where s.diajak_oleh = saya.kode_ajakan and s.id <> saya.id
  )
  select jsonb_build_object(
    'kode', saya.kode_ajakan,
    'komisi', p.komisi_nominal, 'batas', p.batas_pencairan, 'dicairkan', saya.komisi_dicairkan,
    'sekolah', coalesce((select jsonb_agg(jsonb_build_object('nama', d.nama, 'tanggal', d.dibuat_pada, 'berbayar', d.berbayar) order by d.dibuat_pada desc) from diajak d), '[]'))
  from saya, pengaturan p where p.id = 1
$$;
revoke all on function ajakan_saya() from public, anon;
grant execute on function ajakan_saya() to authenticated;

-- 3) Pengetatan hasil audit keamanan.
-- a. Pendaftaran orang tua hanya lewat server (Turnstile + validasi isian + batas perangkat yang tidak bisa dipalsukan).
revoke execute on function daftar_pendaftar(text, uuid, text, date, jsonb, text, boolean, text) from anon, authenticated;
grant execute on function daftar_pendaftar(text, uuid, text, date, jsonb, text, boolean, text) to service_role;

-- b. Admin tidak boleh mengganti NPSN sendiri, dan kunci alamat tidak bisa dibuka lagi.
revoke update (npsn) on sekolah from authenticated;
create or replace function jaga_kunci_slug() returns trigger language plpgsql set search_path = public as $$
begin
  if old.slug_dikunci and not new.slug_dikunci and current_user = 'authenticated' then raise exception 'slug_dikunci'; end if;
  return new;
end $$;
create trigger kunci_slug before update of slug_dikunci on sekolah for each row execute function jaga_kunci_slug();
revoke execute on function jaga_kunci_slug() from public, anon, authenticated;

-- c. Path gambar hanya boleh milik sekolah itu sendiri (atau aset bawaan /demo/), ukuran JSON dibatasi.
alter table sekolah add constraint sekolah_logo_milik check (logo_path is null or logo_path ~ ('^(' || id || '/logo-[0-9a-f]{8}|/demo/[a-z0-9-]+)\.(png|jpg|webp)$'));
alter table sekolah add constraint sekolah_banner_milik check (banner_path is null or banner_path ~ ('^(' || id || '/banner-[0-9a-f]{8}|/demo/[a-z0-9-]+)\.(png|jpg|webp)$'));
alter table galeri add constraint galeri_path_milik check (path ~ ('^(' || sekolah_id || '/galeri-[0-9a-f]{8}|/demo/[a-z0-9-]+)\.(png|jpg|webp)$'));
alter table sekolah add constraint sekolah_json_ukuran check (
  pg_column_size(daftar_ulang) < 8000 and pg_column_size(banner_atur) < 500
  and pg_column_size(jadwal) < 8000 and pg_column_size(prestasi) < 20000);

-- d. Batas percobaan umum (unggah berkas, daftar ulang, daftar sekolah, laporan error). Hanya server.
create or replace function batas_hit(p_kunci text, p_maks int, p_menit int) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from cek_log where kunci = p_kunci and waktu > now() - make_interval(mins => p_menit)) >= p_maks then
    return false;
  end if;
  insert into cek_log (kunci) values (left(p_kunci, 64));
  return true;
end $$;
revoke all on function batas_hit(text, int, int) from public, anon, authenticated;
grant execute on function batas_hit(text, int, int) to service_role;

-- e. galat_log tidak boleh membengkak: simpan maks. 2000 baris terbaru.
create or replace function pangkas_galat() returns trigger language plpgsql set search_path = public as $$
begin
  delete from galat_log where id < (select min(id) from (select id from galat_log order by id desc limit 2000) t);
  return null;
end $$;
create trigger pangkas_galat after insert on galat_log for each statement execute function pangkas_galat();
revoke execute on function pangkas_galat() from public, anon, authenticated;
