"use server";

import { wajibAdmin } from "@/lib/sekolah-saya";

type Hasil = { ok: true } | { ok: false; pesan: string };

export async function kirimMasukan(jenis: string, isi: string): Promise<Hasil> {
  if (!["fitur", "saran", "masalah"].includes(jenis)) return { ok: false, pesan: "Pilih jenis masukan." };
  const teks = isi.trim().slice(0, 1000);
  if (teks.length < 5) return { ok: false, pesan: "Tulis masukan minimal 5 huruf." };
  const { db, sekolah } = await wajibAdmin();
  const { error } = await db.from("masukan").insert({ sekolah_id: sekolah.id, jenis, isi: teks });
  // policy menolak bila sudah 10 masukan dalam sehari
  if (error) return { ok: false, pesan: error.code === "42501" ? "Batas 10 masukan per hari tercapai. Coba lagi besok." : "Gagal mengirim. Coba lagi." };
  return { ok: true };
}
