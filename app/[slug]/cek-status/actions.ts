"use server";

import { supabaseService } from "@/lib/supabase/admin";
import { hashPerangkat } from "@/lib/perangkat";

export type DaftarUlang = { aktif: boolean; tenggat?: string | null; info?: string; isian?: string[]; berkas?: string[] };
export type Status = {
  nomor: string; nama_anak: string; status: string; catatan: string | null; sekolah: string; logo_path?: string | null;
  jalur: string | null; syarat_berkas: string[]; berkas: string[]; umumkan_pada?: string | null;
  daftar_ulang?: DaftarUlang | null; daftar_ulang_pada?: string | null;
};
type Hasil = { ok: true; data: Status | null } | { ok: false; pesan: string };

export async function cekStatus(slug: string, nomor: string): Promise<Hasil> {
  const n = nomor.trim();
  if (n.length < 6 || n.length > 12) return { ok: true, data: null };
  // lewat service_role + hash IP: maks. 20 percobaan per jam per perangkat
  const { data, error } = await supabaseService().rpc("cek_status_aman", { p_slug: slug, p_nomor: n, p_kunci: await hashPerangkat(false) });
  if (error) return { ok: false, pesan: error.message.includes("terlalu_banyak") ? "Terlalu banyak percobaan. Coba lagi 1 jam lagi." : "Gagal memeriksa. Coba lagi." };
  return { ok: true, data: (data as Status | null) ?? null };
}

export async function kirimDaftarUlang(slug: string, nomor: string, tglLahir: string, isian: Record<string, string>): Promise<{ ok: true } | { ok: false; pesan: string }> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tglLahir)) return { ok: false, pesan: "Isi tanggal lahir anak." };
  const bersih = Object.fromEntries(Object.entries(isian).slice(0, 20).map(([k, v]) => [k.slice(0, 100), String(v).trim().slice(0, 500)]));
  const { error } = await supabaseService().rpc("kirim_daftar_ulang", { p_slug: slug, p_nomor: nomor, p_tgl: tglLahir, p_isian: bersih });
  if (!error) return { ok: true };
  if (error.message.includes("pendaftar_tidak_ditemukan")) return { ok: false, pesan: "Tanggal lahir tidak cocok dengan data pendaftaran." };
  if (error.message.includes("daftar_ulang_tutup")) return { ok: false, pesan: "Daftar ulang sudah ditutup." };
  return { ok: false, pesan: "Gagal menyimpan. Coba lagi." };
}
