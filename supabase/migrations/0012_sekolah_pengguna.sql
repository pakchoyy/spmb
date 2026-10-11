-- Deretan "sekolah yang memakai" di beranda: hanya sekolah berlangganan aktif yang mengizinkan tampil.
alter table sekolah add column tampil_di_beranda boolean not null default true;
grant update (tampil_di_beranda) on sekolah to authenticated;

create function sekolah_pengguna() returns table (slug text, nama text, logo_path text)
language sql stable security definer set search_path = public as $$
  select s.slug, s.nama, s.logo_path
  from sekolah s
  where s.tampil_di_beranda and langganan_status(s.id) = 'aktif'
  order by s.dibuat_pada
  limit 60
$$;
revoke all on function sekolah_pengguna() from public;
grant execute on function sekolah_pengguna() to anon, authenticated;
