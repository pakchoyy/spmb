-- Posisi & perbesaran banner (seperti mengatur foto profil): x,y = titik fokus 0–100 (%), z = 100–250 (%).
alter table sekolah add column banner_atur jsonb not null default '{"x":50,"y":50,"z":100}'
  check (jsonb_typeof(banner_atur) = 'object');
grant update (banner_atur) on sekolah to authenticated;

create or replace function sekolah_publik(p_slug text) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'slug', s.slug, 'nama', s.nama, 'alamat', s.alamat, 'logo_path', s.logo_path,
    'warna_aksen', s.warna_aksen, 'banner_path', s.banner_path, 'banner_atur', s.banner_atur, 'keunggulan', s.keunggulan,
    'format_berkas', s.format_berkas, 'kontak_wa', s.kontak_wa, 'peta_url', s.peta_url,
    'instagram', s.instagram, 'status', langganan_status(s.id), 'terverifikasi', s.terverifikasi,
    'akreditasi', s.akreditasi,
    'jumlah', case when s.tampil_jumlah then (select count(*) from pendaftar p where p.sekolah_id = s.id and not p.diarsip) end, 'jadwal', s.jadwal, 'prestasi', s.prestasi, 'prestasi_gerak', s.prestasi_gerak,
    'jalur', coalesce((
      select jsonb_agg((to_jsonb(j) - 'sekolah_id') || jsonb_build_object('sisa',
        case when s.tampil_kuota and j.kuota is not null
          then greatest(0, j.kuota - (select count(*) from pendaftar p where p.jalur_id = j.id and not p.diarsip)) end))
      from jalur j where j.sekolah_id = s.id and j.aktif), '[]'),
    'form', coalesce((select jsonb_agg(to_jsonb(f) - 'sekolah_id' order by f.urutan) from form_field f where f.sekolah_id = s.id), '[]'),
    'galeri', coalesce((select jsonb_agg(g.path order by g.urutan) from galeri g where g.sekolah_id = s.id), '[]'))
  from sekolah s where s.slug = p_slug
$$;
