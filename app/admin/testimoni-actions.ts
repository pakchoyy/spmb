"use server";

import { revalidatePath } from "next/cache";
import { wajibAdmin } from "@/lib/sekolah-saya";

type Hasil = { ok: true } | { ok: false; pesan: string };

/** Simpan (buat atau ubah) testimoni sekolah sendiri. Langsung tampil di beranda. */
export async function simpanTestimoni(f: { nama: string; jabatan: string; rating: number; isi: string }): Promise<Hasil> {
  const nama = f.nama.trim().slice(0, 80), jabatan = f.jabatan.trim().slice(0, 60), isi = f.isi.trim();
  if (nama.length < 2) return { ok: false, pesan: "Isi nama Anda." };
  if (!Number.isInteger(f.rating) || f.rating < 1 || f.rating > 5) return { ok: false, pesan: "Pilih bintang 1 sampai 5." };
  if (isi.length < 10) return { ok: false, pesan: "Ceritakan sedikit lebih panjang (minimal 10 huruf)." };
  if (isi.length > 300) return { ok: false, pesan: "Maksimal 300 huruf." };

  const { db, sekolah } = await wajibAdmin();
  const baris = { nama, jabatan: jabatan || null, rating: f.rating, isi };
  const { data: ada } = await db.from("testimoni").select("id").maybeSingle();
  const { error } = ada
    ? await db.from("testimoni").update(baris).eq("id", ada.id)
    : await db.from("testimoni").insert({ ...baris, sekolah_id: sekolah.id });
  if (error) return { ok: false, pesan: "Gagal menyimpan. Coba lagi." };
  revalidatePath("/");
  revalidatePath("/admin");
  return { ok: true };
}
