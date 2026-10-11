-- Supabase memberi izin penuh ke anon/authenticated pada tabel baru secara bawaan.
-- Cabut, lalu beri ulang hanya kolom yang boleh diisi admin (bukan `tampil`).
revoke all on testimoni from anon, authenticated;
grant select on testimoni to authenticated;
grant insert (sekolah_id, nama, jabatan, rating, isi) on testimoni to authenticated;
grant update (nama, jabatan, rating, isi) on testimoni to authenticated;
