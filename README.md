# Gerbang (SPMB multi-sekolah)

Next.js + Tailwind + Supabase. Spesifikasi: PRD Final SPMB Multi-Sekolah (10 Okt 2026).

- `supabase/migrations/0001_init.sql` — skema, RLS, dan fungsi (anon hanya lewat RPC).
- Salin `.env.example` ke `.env.local`, lalu `npm run dev`.
- Slug yang dipesan: admin, masuk, daftar, aktivasi, super, api.

Status: kerangka rute + migrasi. Belum ada UI form/dashboard, upload berkas, Turnstile, dan integrasi Lynk.

## Setup Supabase Auth (wajib)

Di Authentication → Email Templates, ubah link agar memakai rute `/auth/konfirmasi`:

- **Confirm signup:** `<a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email">Aktifkan akun</a>`
- **Reset password:** `<a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=recovery">Atur ulang kata sandi</a>`

Di Authentication → URL Configuration, daftarkan domain aplikasi ke Site URL dan Redirect URLs (`https://domain.com/auth/konfirmasi`). Biarkan **Confirm email** menyala.
