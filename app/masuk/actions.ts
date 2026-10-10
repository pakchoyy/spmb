"use server";

import { headers } from "next/headers";
import { supabaseServer } from "@/lib/supabase/server";

type Hasil = { ok: true } | { ok: false; pesan: string };

export async function masuk(email: string, sandi: string): Promise<Hasil> {
  const db = await supabaseServer();
  const { error } = await db.auth.signInWithPassword({ email: email.trim().toLowerCase(), password: sandi });
  if (!error) return { ok: true };
  if (error.code === "email_not_confirmed") return { ok: false, pesan: "Email belum dikonfirmasi. Klik link di email pendaftaran." };
  return { ok: false, pesan: "Email atau kata sandi salah." };
}

// Jawaban selalu sama, supaya email yang terdaftar tidak bisa ditebak.
export async function lupaSandi(email: string): Promise<Hasil> {
  const h = await headers();
  const origin = h.get("origin") ?? `https://${h.get("host")}`;
  const db = await supabaseServer();
  await db.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: `${origin}/auth/konfirmasi` });
  return { ok: true };
}

export async function aturSandiBaru(sandi: string): Promise<Hasil> {
  if (sandi.length < 8) return { ok: false, pesan: "Kata sandi minimal 8 karakter." };
  const db = await supabaseServer();
  const { error } = await db.auth.updateUser({ password: sandi });
  return error ? { ok: false, pesan: "Gagal mengubah kata sandi. Minta link baru." } : { ok: true };
}
