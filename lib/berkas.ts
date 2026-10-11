export const MAKS_BYTE = 2 * 1024 * 1024; // dikunci 2 MB, sama dengan bucket
export const MIME: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  png: "image/png",
};

/** Satu tahap di garis waktu SPMB (tanggal format YYYY-MM-DD). */
export type Jadwal = { judul: string; mulai: string; selesai: string | null };
/** Satu prestasi siswa; foto di bucket sekolah-aset. */
export type Prestasi = { judul: string; nama: string; ket: string; foto: string | null };

export type SekolahPublik = {
  slug: string;
  nama: string;
  alamat: string | null;
  logo_path: string | null;
  banner_path: string | null;
  keunggulan: string[];
  kontak_wa: string | null;
  peta_url: string | null;
  instagram: string | null;
  galeri: string[];
  warna_aksen: string;
  format_berkas: string[];
  status: "trial" | "aktif" | "tenggang" | "nonaktif";
  terverifikasi?: boolean;
  akreditasi?: string | null;
  jumlah?: number | null;
  jadwal?: Jadwal[];
  prestasi?: Prestasi[];
  jalur: { id: string; nama: string; kuota: number | null; sisa?: number | null; buka: string | null; tutup: string | null; syarat_berkas: string[] }[];
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
  wa_tidak_valid: "Isi nomor WhatsApp yang benar, contoh 081234567890.",
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

/** URL publik aset sekolah (logo, banner, galeri) dari bucket `sekolah-aset`. */
export const urlAset = (path: string | null | undefined) =>
  path ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/sekolah-aset/${path}` : null;

/** "0812-3456-7890" / "+62 812…" -> "628123456890"; null bila bukan nomor wajar (9–15 digit). */
export function normalWa(mentah: string): string | null {
  const d = mentah.replace(/\D/g, "").replace(/^0/, "62");
  return /^[0-9]{9,15}$/.test(d) ? d : null;
}
