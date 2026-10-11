-- Indeks untuk foreign key (saran Supabase advisor) agar tetap cepat saat data membesar.
create index if not exists berkas_pendaftar_idx on berkas (pendaftar_id);
create index if not exists berkas_sekolah_idx on berkas (sekolah_id);
create index if not exists form_field_sekolah_idx on form_field (sekolah_id);
create index if not exists galeri_sekolah_idx on galeri (sekolah_id);
create index if not exists kode_aktivasi_sekolah_idx on kode_aktivasi (sekolah_id);
create index if not exists log_langganan_sekolah_idx on log_langganan (sekolah_id);
create index if not exists masukan_sekolah_idx on masukan (sekolah_id);
create index if not exists pendaftar_jalur_idx on pendaftar (jalur_id);
create index if not exists slug_lama_sekolah_idx on slug_lama (sekolah_id);
