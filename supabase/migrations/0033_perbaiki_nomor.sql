-- Perbaikan 0024: "daftar_pendaftar.nomor" di dalam subquery dibaca sebagai tabel → setiap pendaftaran gagal
-- ("missing FROM-clause entry"). Ditulis ulang utuh dengan variabel v_nomor; isian dibatasi ukurannya.
create or replace function daftar_pendaftar(p_slug text, p_jalur uuid, p_nama_anak text, p_tgl_lahir date,
  p_isian jsonb, p_perangkat text, p_setuju boolean, p_wa text) returns text
language plpgsql security definer set search_path = public as $$
declare s sekolah%rowtype; v_nomor text; j jalur%rowtype;
begin
  if not coalesce(p_setuju, false) then raise exception 'perlu_persetujuan'; end if;
  if p_wa is null or p_wa !~ '^[0-9]{9,15}$' then raise exception 'wa_tidak_valid'; end if;
  if p_tgl_lahir > current_date or p_tgl_lahir < current_date - interval '30 years' then
    raise exception 'tanggal_lahir_tidak_valid'; end if;
  if p_isian is not null and pg_column_size(p_isian) > 20000 then raise exception 'isian_terlalu_besar'; end if;
  select * into s from sekolah where slug = p_slug;
  if not found or langganan_status(s.id) not in ('trial','aktif') then raise exception 'pendaftaran_ditutup'; end if;
  if p_perangkat is not null and (select count(*) from pendaftar
      where sekolah_id = s.id and perangkat = p_perangkat and dibuat_pada > now() - interval '1 hour') >= 5 then
    raise exception 'terlalu_banyak';
  end if;
  if exists (select 1 from jalur where sekolah_id = s.id and aktif) and p_jalur is null then raise exception 'jalur_wajib'; end if;
  if p_jalur is not null then
    select * into j from jalur where id = p_jalur and sekolah_id = s.id and aktif;
    if not found then raise exception 'jalur_tidak_valid'; end if;
    if (j.buka is not null and now() < j.buka) or (j.tutup is not null and now() > j.tutup) then raise exception 'jalur_tutup'; end if;
    if j.kuota is not null and (select count(*) from pendaftar where jalur_id = j.id and not diarsip) >= j.kuota then
      raise exception 'kuota_penuh'; end if;
  end if;
  -- nomor 6 angka, unik per sekolah
  loop
    v_nomor := (100000 + (('x' || encode(extensions.gen_random_bytes(4), 'hex'))::bit(32)::bigint % 900000))::text;
    exit when not exists (select 1 from pendaftar x where x.sekolah_id = s.id and x.nomor = v_nomor);
  end loop;
  insert into pendaftar (sekolah_id, nomor, jalur_id, nama_anak, tanggal_lahir, isian, perangkat, setuju_privasi_pada, wa_ortu)
    values (s.id, v_nomor, p_jalur, left(trim(p_nama_anak), 100), p_tgl_lahir, coalesce(p_isian, '{}'), left(p_perangkat, 64), now(), p_wa);
  return v_nomor;
end $$;
