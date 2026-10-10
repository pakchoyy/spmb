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
  nomor := to_char(now(), 'YY') || '-' || upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 6));
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
