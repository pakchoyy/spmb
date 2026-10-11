import { createBrowserClient } from "@supabase/ssr";

// Klien di browser, hanya untuk memulai login Google (OAuth PKCE; penukar kode ada di /auth/callback).
export const supabaseBrowser = () =>
  createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
