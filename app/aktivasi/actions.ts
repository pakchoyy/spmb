"use server";

import { supabaseService } from "@/lib/supabase/admin";
import { kirimEmail } from "@/lib/email";
import { lolosTurnstile } from "@/lib/turnstile";

type Hasil = { ok: true } | { ok: false; pesan: string };

/**
 * Jawaban selalu sama untuk email apa pun yang formatnya benar, supaya halaman ini
 * tidak bisa dipakai menebak email admin sekolah. Kode hanya dibuat untuk email admin terdaftar.
 */
export async function mintaKode(email: string, token: string | null): Promise<Hasil> {
  const em = email.trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(em) || em.length > 200) return { ok: false, pesan: "Isi email yang benar." };
  if (!(await lolosTurnstile(token))) return { ok: false, pesan: "Verifikasi gagal. Muat ulang halaman." };

  const { data: kode, error } = await supabaseService().rpc("minta_kode_aktivasi", { p_email: em });
  if (error && error.message !== "batas_harian") console.error("minta_kode_aktivasi", error.message);
  if (typeof kode === "string") {
    await kirimEmail(em, `Kode aktivasi ${kode}`,
      `Terima kasih sudah berlangganan.\n\nKode aktivasi Anda: ${kode}\n\n` +
      `Masuk ke aplikasi, buka menu Langganan, lalu masukkan kode ini. Kode hanya bisa dipakai sekali.\n\n` +
      `Jika Anda tidak merasa meminta kode ini, abaikan email ini.`);
  }
  return { ok: true };
}
