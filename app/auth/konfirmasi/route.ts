import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase/server";

// Tujuan link di email (konfirmasi pendaftaran dan atur ulang kata sandi).
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const tokenHash = p.get("token_hash");
  const type = p.get("type") as EmailOtpType | null;
  const next = p.get("next") ?? "/admin";
  const aman = next.startsWith("/") && !next.startsWith("//") ? next : "/admin"; // cegah open redirect

  if (tokenHash && type) {
    const db = await supabaseServer();
    const { error } = await db.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(new URL(type === "recovery" ? "/masuk/atur-ulang" : aman, req.url));
  }
  return NextResponse.redirect(new URL("/masuk?galat=link", req.url));
}
