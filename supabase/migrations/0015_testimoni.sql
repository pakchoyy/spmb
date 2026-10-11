-- Testimoni sekolah di beranda. Dari admin sekolah langsung tampil; pemilik bisa ubah/sembunyikan/hapus/tambah (service_role).
create table testimoni (
  id uuid primary key default gen_random_uuid(),
  sekolah_id uuid unique references sekolah on delete cascade,  -- kosong = ditambahkan pemilik
  nama_sekolah text,                                            -- dipakai bila sekolah_id kosong
  nama text not null check (char_length(nama) between 2 and 80),
  jabatan text check (char_length(jabatan) <= 60),
  rating int not null check (rating between 1 and 5),
  isi text not null check (char_length(isi) between 10 and 300),
  tampil boolean not null default true,
  dibuat_pada timestamptz not null default now(),
  check (sekolah_id is not null or nama_sekolah is not null)
);
alter table testimoni enable row level security;

grant select on testimoni to authenticated;
grant insert (sekolah_id, nama, jabatan, rating, isi) on testimoni to authenticated;
grant update (nama, jabatan, rating, isi) on testimoni to authenticated;  -- tampil hanya pemilik
create policy baca on testimoni for select to authenticated using (sekolah_id = sekolah_saya());
create policy tambah on testimoni for insert to authenticated with check (sekolah_id = sekolah_saya());
create policy ubah on testimoni for update to authenticated using (sekolah_id = sekolah_saya()) with check (sekolah_id = sekolah_saya());

create function testimoni_publik() returns table (nama text, jabatan text, rating int, isi text, sekolah text, logo_path text)
language sql stable security definer set search_path = public as $$
  select t.nama, t.jabatan, t.rating, t.isi, coalesce(s.nama, t.nama_sekolah), s.logo_path
  from testimoni t left join sekolah s on s.id = t.sekolah_id
  where t.tampil and (s.id is null or not s.nonaktif)
  order by t.dibuat_pada desc
  limit 12
$$;
revoke all on function testimoni_publik() from public;
grant execute on function testimoni_publik() to anon, authenticated;
