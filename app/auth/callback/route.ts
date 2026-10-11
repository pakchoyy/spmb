import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

// Tujuan kembali setelah login Google. Kode ditukar jadi sesi (cookie), lalu ke /admin.
// Sekolah baru (belum punya data sekolah) otomatis diarahkan ke /daftar/lengkapi oleh wajibAdmin().
export async function GET(req: NextRequest) {
  const kode = req.nextUrl.searchParams.get("code");
  const ref = req.nextUrl.searchParams.get("ref");
  if (kode) {
    const { error } = await (await supabaseServer()).auth.exchangeCodeForSession(kode);
    if (!error) {
      const tujuan = new URL("/admin", req.url);
      const res = NextResponse.redirect(tujuan);
      if (ref && /^[A-Za-z0-9]{1,12}$/.test(ref)) res.cookies.set("ym_ref", ref.toUpperCase(), { maxAge: 3600, httpOnly: true, sameSite: "lax", path: "/" });
      return res;
    }
  }
  return NextResponse.redirect(new URL("/masuk?galat=google", req.url));
}
