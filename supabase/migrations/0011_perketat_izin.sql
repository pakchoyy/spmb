-- Pengetatan izin fungsi. Supabase memberi EXECUTE ke anon secara bawaan pada fungsi baru.
-- anon hanya boleh: cek_slug, cek_status, daftar_pendaftar, sekolah_publik, slug_pengalihan.

-- khusus pengguna login (semua sudah memeriksa auth.uid() sendiri; ini lapisan kedua)
revoke execute on function
  arsipkan_semua(boolean), buat_sekolah(text,text,text,text), catat_hapus_arsip(int),
  ganda_saya(), gunakan_kode(text), ringkasan_saya(), status_saya(), jalur_terkunci(jalur)
  from public, anon;

-- fungsi trigger tidak perlu bisa dipanggil lewat API
revoke execute on function batasi_galeri(), jaga_jalur(), jaga_jalur_baru() from public, anon, authenticated;

-- search_path tetap, agar tidak bisa dibelokkan
alter function batasi_galeri() set search_path = public;
alter function jaga_jalur() set search_path = public;
alter function jaga_jalur_baru() set search_path = public;
alter function slug_dipesan() set search_path = public;
