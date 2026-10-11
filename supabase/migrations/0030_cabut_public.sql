-- Fungsi baru di Postgres otomatis bisa dijalankan PUBLIC; mencabut dari anon saja tidak cukup.
revoke execute on function daftar_pendaftar(text, uuid, text, date, jsonb, text, boolean, text) from public;
revoke execute on function cek_status(text, text, date) from public, anon, authenticated;
