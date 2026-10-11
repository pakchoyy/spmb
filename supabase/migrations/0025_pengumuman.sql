-- Pengumuman hasil serentak: sebelum `umumkan_pada`, orang tua hanya melihat "sedang diperiksa".
alter table sekolah add column umumkan_pada timestamptz;
grant update (umumkan_pada) on sekolah to authenticated;

create or replace function cek_status_nomor(p_slug text, p_nomor text) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'nomor', p.nomor, 'nama_anak', p.nama_anak,
    'status', case when tunda then 'Baru' else p.status end,
    'catatan', case when tunda then null else p.catatan end,
    'umumkan_pada', case when tunda then s.umumkan_pada end,
    'sekolah', s.nama, 'jalur', j.nama, 'syarat_berkas', coalesce(to_jsonb(j.syarat_berkas), '[]'),
    'berkas', coalesce((select jsonb_agg(b.jenis) from berkas b where b.pendaftar_id = p.id), '[]'))
  from pendaftar p join sekolah s on s.id = p.sekolah_id left join jalur j on j.id = p.jalur_id
    cross join lateral (select s.umumkan_pada is not null and now() < s.umumkan_pada as tunda) t
  where s.slug = p_slug and p.nomor = upper(trim(p_nomor))
$$;

-- Versi lama (nomor + tanggal lahir) ikut menahan hasil.
create or replace function cek_status(p_slug text, p_nomor text, p_tgl_lahir date) returns jsonb
language sql stable security definer set search_path = public as $$
  select cek_status_nomor(p_slug, p_nomor) from pendaftar p join sekolah s on s.id = p.sekolah_id
  where s.slug = p_slug and p.nomor = upper(trim(p_nomor)) and p.tanggal_lahir = p_tgl_lahir
$$;
