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
  nomor := to_char(now(), 'YY') || '-' || upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 6));
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
