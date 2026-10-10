import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Klien dengan sesi login (cookie). Dipakai admin sekolah; RLS tetap berlaku.
export async function supabaseServer() {
  const jar = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (list) => {
        // Server Component tidak boleh menulis cookie; proxy.ts yang menyegarkan sesi.
        try { list.forEach(({ name, value, options }) => jar.set(name, value, options)); } catch {}
      },
    },
  });
}
