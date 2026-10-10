-- Halaman /syarat dan /privasi menjadi rute level atas, jadi dipesan sebagai slug.
create or replace function slug_dipesan() returns text[] language sql immutable as $$
  select array['admin','masuk','daftar','aktivasi','super','api','auth','keluar','syarat','privasi']
$$;
