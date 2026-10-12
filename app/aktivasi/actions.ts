"use server";

import { supabaseService } from "@/lib/supabase/admin";
import { kirimEmail } from "@/lib/email";
import { lolosTurnstile } from "@/lib/turnstile";
import { bolehLanjut } from "@/lib/perangkat";

type Hasil = { ok: true; kode: string } | { ok: false; pesan: string; belumDaftar?: boolean };

const PESAN: Record<string, string> = {
  token_salah: "Tautan aktivasi tidak valid. Buka lagi tautan dari halaman pesanan bgy-store.",
  email_tidak_terdaftar: "Email ini belum terdaftar sebagai admin sekolah.",
  langganan_dibatalkan: "Langganan sekolah ini dinonaktifkan. Hubungi kami lewat WhatsApp.",
  batas_harian: "Email ini sudah meminta 3 kode hari ini. Coba lagi besok atau hubungi kami.",
};

/** Dipanggil dari halaman setelah bayar di bgy-store (/aktivasi?t=token). Kode sekali pakai, berlaku 1 jam. */
export async function mintaKode(email: string, token: string, turnstile: string | null): Promise<Hasil> {
  const em = email.trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(em) || em.length > 200) return { ok: false, pesan: "Isi email yang benar." };
  if (!(await lolosTurnstile(turnstile))) return { ok: false, pesan: "Verifikasi gagal. Muat ulang halaman." };
  if (!(await bolehLanjut("aktivasi", 10, 60))) return { ok: false, pesan: "Terlalu banyak percobaan. Coba lagi 1 jam lagi." };

  const { data: kode, error } = await supabaseService().rpc("minta_kode_aktivasi", { p_email: em, p_token: token.slice(0, 64) });
  if (error || typeof kode !== "string") {
    const k = Object.keys(PESAN).find((x) => error?.message.includes(x));
    return { ok: false, pesan: k ? PESAN[k] : "Gagal membuat kode. Coba lagi.", belumDaftar: k === "email_tidak_terdaftar" };
  }
  await kirimEmail(em, `Kode aktivasi ${kode}`,
    `Terima kasih sudah berlangganan SPMB Zone.\n\nKode aktivasi Anda: ${kode}\n\n` +
    `Masuk ke aplikasi, buka menu Langganan, lalu masukkan kode ini. Kode hanya bisa dipakai sekali dan berlaku 1 jam.`).catch(() => {});
  return { ok: true, kode };
}
