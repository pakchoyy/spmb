import { createClient } from "@supabase/supabase-js";

// Klien anon tanpa sesi: hanya boleh memanggil fungsi RPC publik (lihat migrasi).
export const supabaseAnon = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false },
  });
