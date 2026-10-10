"use server";

import { revalidatePath } from "next/cache";
import { wajibAdmin } from "@/lib/sekolah-saya";
import { STATUS } from "@/lib/pendaftar";

type Hasil = { ok: true } | { ok: false; pesan: string };

export async function ubahStatus(id: string, status: string, catatan: string): Promise<Hasil> {
  if (!(STATUS as readonly string[]).includes(status)) return { ok: false, pesan: "Status tidak valid." };
  const cat = catatan.trim().slice(0, 500);
  if ((status === "Ditolak" || status === "Cadangan") && !cat) return { ok: false, pesan: "Isi catatan alasan untuk status ini." };

  const { db } = await wajibAdmin();
  // RLS menolak bila langganan tidak aktif atau pendaftar milik sekolah lain (0 baris terubah)
  const { data, error } = await db.from("pendaftar").update({ status, catatan: cat || null }).eq("id", id).select("id");
  if (error || !data?.length) return { ok: false, pesan: "Langganan tidak aktif atau data tidak ditemukan." };
  revalidatePath("/admin");
  revalidatePath(`/admin/pendaftar/${id}`);
  return { ok: true };
}

/** Tautan sementara (5 menit) ke berkas di storage privat. */
export async function tautBerkas(berkasId: string): Promise<{ ok: true; url: string } | { ok: false; pesan: string }> {
  const { db } = await wajibAdmin();
  const { data: b } = await db.from("berkas").select("path").eq("id", berkasId).maybeSingle();
  if (!b) return { ok: false, pesan: "Berkas tidak ditemukan." };
  const { data, error } = await db.storage.from("berkas").createSignedUrl(b.path, 300);
  if (error || !data) return { ok: false, pesan: "Gagal membuka berkas. Coba lagi." };
  return { ok: true, url: data.signedUrl };
}
