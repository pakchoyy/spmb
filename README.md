# Gerbang (SPMB multi-sekolah)

Next.js + Tailwind + Supabase. Spesifikasi: PRD Final SPMB Multi-Sekolah (10 Okt 2026).

- `supabase/migrations/0001_init.sql` — skema, RLS, dan fungsi (anon hanya lewat RPC).
- Salin `.env.example` ke `.env.local`, lalu `npm run dev`.
- Slug yang dipesan: admin, masuk, daftar, aktivasi, super, api.

Status: kerangka rute + migrasi. Belum ada UI form/dashboard, upload berkas, Turnstile, dan integrasi Lynk.
