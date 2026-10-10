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
