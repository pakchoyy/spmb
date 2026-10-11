-- Permintaan fitur, kritik & saran, dan laporan masalah dari admin sekolah ke pemilik.
create table masukan (
  id uuid primary key default gen_random_uuid(),
  sekolah_id uuid not null references sekolah on delete cascade,
  jenis text not null check (jenis in ('fitur', 'saran', 'masalah')),
  isi text not null check (char_length(isi) between 5 and 1000),
  selesai boolean not null default false,
  dibuat_pada timestamptz not null default now()
);
create index on masukan (dibuat_pada desc);
alter table masukan enable row level security;
-- tabel baru otomatis dapat izin penuh; cabut lalu beri seperlunya
revoke all on masukan from anon, authenticated;
grant select on masukan to authenticated;
grant insert (sekolah_id, jenis, isi) on masukan to authenticated;
create policy baca on masukan for select to authenticated using (sekolah_id = sekolah_saya());
create policy tambah on masukan for insert to authenticated with check (
  sekolah_id = sekolah_saya()
  and (select count(*) from masukan m where m.sekolah_id = sekolah_saya() and m.dibuat_pada > now() - interval '1 day') < 10
);
