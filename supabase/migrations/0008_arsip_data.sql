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
  nomor := to_char(now(), 'YY') || '-' || upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 6));
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
