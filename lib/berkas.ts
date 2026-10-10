export const MAKS_BYTE = 2 * 1024 * 1024; // dikunci 2 MB, sama dengan bucket
export const MIME: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  png: "image/png",
};

export type SekolahPublik = {
  slug: string;
  nama: string;
  warna_aksen: string;
  format_berkas: string[];
  status: "trial" | "aktif" | "tenggang" | "nonaktif";
  jalur: { id: string; nama: string; kuota: number | null; buka: string | null; tutup: string | null; syarat_berkas: string[] }[];
  form: { id: string; label: string; tipe: "teks" | "angka" | "tanggal" | "pilihan" | "paragraf"; opsi: string[] | null; wajib: boolean }[];
};

export const PESAN_ERROR: Record<string, string> = {
  pendaftaran_ditutup: "Pendaftaran sekolah ini sedang ditutup.",
  terlalu_banyak: "Terlalu banyak pendaftaran dari perangkat ini. Coba lagi satu jam lagi.",
  jalur_tutup: "Jalur yang dipilih belum dibuka atau sudah ditutup.",
  kuota_penuh: "Kuota jalur yang dipilih sudah penuh.",
  jalur_wajib: "Pilih jalur pendaftaran.",
  jalur_tidak_valid: "Jalur yang dipilih tidak valid.",
  perlu_persetujuan: "Centang persetujuan privasi untuk melanjutkan.",
  tanggal_lahir_tidak_valid: "Tanggal lahir tidak valid.",
};
export const pesanError = (m?: string) => PESAN_ERROR[m ?? ""] ?? "Terjadi kesalahan. Coba lagi.";

/** Kompres gambar di browser (maks. sisi 1600 px) agar muat < 2 MB; PDF dibiarkan. */
export async function kompres(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  const bmp = await createImageBitmap(file);
  const skala = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * skala);
  c.height = Math.round(bmp.height * skala);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  const blob = await new Promise<Blob | null>((r) => c.toBlob(r, "image/jpeg", 0.8));
  if (!blob || blob.size >= file.size) return file;
  return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
}
