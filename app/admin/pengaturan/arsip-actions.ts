"use server";

import { revalidatePath } from "next/cache";
import { wajibAdmin } from "@/lib/sekolah-saya";

type Hasil = { ok: true; jumlah: number } | { ok: false; pesan: string };

const segarkan = () => { revalidatePath("/admin"); revalidatePath("/admin/pengaturan"); };

export async function arsipkan(arsip: boolean): Promise<Hasil> {
  const { db } = await wajibAdmin();
  const { data, error } = await db.rpc("arsipkan_semua", { p_arsip: arsip });
  if (error) return { ok: false, pesan: "Langganan Anda tidak aktif, data hanya bisa dibaca." };
  segarkan();
  return { ok: true, jumlah: data as number };
}

/**
 * Hapus permanen pendaftar yang sudah diarsipkan, beserta berkasnya di storage.
 * Berkas dihapus dulu; bila gagal, baris pendaftar dibiarkan agar tidak ada berkas yatim.
 * Konfirmasi: admin harus mengetik alamat halaman sekolah.
 */
export async function hapusArsip(konfirmasi: string): Promise<Hasil> {
  const { db, sekolah } = await wajibAdmin();
  if (konfirmasi.trim() !== sekolah.slug) return { ok: false, pesan: "Ketik alamat halaman sekolah dengan benar untuk konfirmasi." };

  const { data: arsip } = await db.from("pendaftar").select("id").eq("diarsip", true);
  const ids = (arsip ?? []).map((p) => p.id as string);
  if (!ids.length) return { ok: true, jumlah: 0 };

  for (let i = 0; i < ids.length; i += 100) {
    const potong = ids.slice(i, i + 100);
    const { data: berkas } = await db.from("berkas").select("path").in("pendaftar_id", potong);
    const paths = (berkas ?? []).map((b) => b.path as string);
    if (paths.length) {
      const { error } = await db.storage.from("berkas").remove(paths);
      if (error) return { ok: false, pesan: "Gagal menghapus berkas. Tidak ada data yang dihapus pada tahap ini; coba lagi." };
    }
    const { error } = await db.from("pendaftar").delete().in("id", potong).eq("diarsip", true);
    if (error) return { ok: false, pesan: "Gagal menghapus data. Sebagian mungkin sudah terhapus; coba lagi." };
  }
  await db.rpc("catat_hapus_arsip", { p_jumlah: ids.length }).then(() => {}, () => {});
  segarkan();
  return { ok: true, jumlah: ids.length };
}
