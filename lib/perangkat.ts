import "server-only";
import { headers } from "next/headers";

/** Hash IP (+ user agent) pengunjung; dipakai untuk pembatasan kasar, bukan identitas. */
export async function hashPerangkat(pakaiUa = true): Promise<string> {
  const h = await headers();
  // di Vercel, x-real-ip / x-vercel-forwarded-for diisi oleh platform (tidak bisa dipalsukan klien)
  const ip = h.get("x-real-ip") ?? h.get("x-vercel-forwarded-for")?.split(",")[0].trim() ?? (h.get("x-forwarded-for") ?? "").split(",")[0].trim();
  const mentah = pakaiUa ? `${ip}|${h.get("user-agent") ?? ""}` : ip;
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(mentah));
  return Buffer.from(buf).toString("hex").slice(0, 32);
}

/** Batas percobaan per perangkat lewat database (berlaku lintas server). true = boleh lanjut. */
export async function bolehLanjut(jenis: string, maks: number, menit: number): Promise<boolean> {
  const { supabaseService } = await import("@/lib/supabase/admin");
  const { data, error } = await supabaseService().rpc("batas_hit", { p_kunci: `${jenis}:${await hashPerangkat(false)}`, p_maks: maks, p_menit: menit });
  return error ? true : data !== false; // bila database bermasalah, jangan kunci pengguna
}
