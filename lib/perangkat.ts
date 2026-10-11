import "server-only";
import { headers } from "next/headers";

/** Hash IP (+ user agent) pengunjung; dipakai untuk pembatasan kasar, bukan identitas. */
export async function hashPerangkat(pakaiUa = true): Promise<string> {
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim();
  const mentah = pakaiUa ? `${ip}|${h.get("user-agent") ?? ""}` : ip;
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(mentah));
  return Buffer.from(buf).toString("hex").slice(0, 32);
}
