"use server";

import { revalidatePath } from "next/cache";
import { wajibAdmin } from "@/lib/sekolah-saya";

type Hasil = { ok: true; berakhir: string } | { ok: false; pesan: string };

export async function pakaiKode(kode: string): Promise<Hasil> {
  const k = kode.trim().toUpperCase();
  if (!/^SPMB-[A-Z0-9]{5}$/.test(k)) return { ok: false, pesan: "Format kode salah. Contoh: SPMB-AB3CD." };
  const { db } = await wajibAdmin();
  const { data, error } = await db.rpc("gunakan_kode", { p_kode: k });
  if (error) {
    return { ok: false, pesan: error.message === "langganan_dibatalkan"
      ? "Langganan ini dinonaktifkan. Hubungi pemilik aplikasi."
      : error.message === "kode_kedaluwarsa"
        ? "Kode sudah lewat 1 jam. Buka lagi tautan aktivasi dari bgy-store untuk minta kode baru."
        : "Kode tidak valid atau sudah dipakai." };
  }
  revalidatePath("/admin", "layout");
  return { ok: true, berakhir: data as string };
}
