-- Halaman /tentang menjadi rute level atas, jadi dipesan sebagai slug.
create or replace function slug_dipesan() returns text[] language sql immutable set search_path = public as $$
  select array['admin','masuk','daftar','aktivasi','super','api','auth','keluar','syarat','privasi','cara-pakai','tentang']
$$;
