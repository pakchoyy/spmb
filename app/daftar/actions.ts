"use server";

import { headers } from "next/headers";
import { supabaseAnon } from "@/lib/supabase/anon";
import { supabaseServer } from "@/lib/supabase/server";
import { SLUG_RE } from "@/lib/slug";
import { VERSI_PRIVASI, VERSI_SYARAT } from "@/lib/hukum";

export async function cekSlugAksi(slug: string): Promise<{ tersedia: boolean; saran: string[] }> {
  if (!SLUG_RE.test(slug)) return { tersedia: false, saran: [] };
  const db = supabaseAnon();
  const { data } = await db.rpc("cek_slug", { p_slug: slug });
  if (data) return { tersedia: true, saran: [] };
  const tahun = String(new Date().getFullYear());
  const kandidat = [`${slug}-2`, `${slug}-${tahun}`, `${slug}-id`].filter((k) => SLUG_RE.test(k));
  const saran: string[] = [];
  for (const k of kandidat) {
    if (saran.length === 2) break;
    if ((await db.rpc("cek_slug", { p_slug: k })).data) saran.push(k);
  }
  return { tersedia: false, saran };
}

type Hasil = { ok: true } | { ok: false; pesan: string };

export async function daftarSekolah(f: {
  nama: string; slug: string; npsn: string; email: string; sandi: string; kodeRef: string; setuju: boolean;
}): Promise<Hasil> {
  if (!f.setuju) return { ok: false, pesan: "Centang persetujuan Syarat dan Ketentuan untuk melanjutkan." };
  const email = f.email.trim().toLowerCase();
  if (f.nama.trim().length < 3) return { ok: false, pesan: "Isi nama sekolah." };
  if (!SLUG_RE.test(f.slug)) return { ok: false, pesan: "Alamat halaman tidak valid." };
  if (f.npsn && !/^\d{8}$/.test(f.npsn)) return { ok: false, pesan: "NPSN terdiri dari 8 angka." };
  if (!/^\S+@\S+\.\S+$/.test(email)) return { ok: false, pesan: "Isi email yang benar." };
  if (f.sandi.length < 8) return { ok: false, pesan: "Kata sandi minimal 8 karakter." };
  if (!(await cekSlugAksi(f.slug)).tersedia) return { ok: false, pesan: "Alamat halaman sudah dipakai. Pilih yang lain." };

  const h = await headers();
  const origin = h.get("origin") ?? `https://${h.get("host")}`;
  const db = await supabaseServer();
  const { error } = await db.auth.signUp({
    email, password: f.sandi,
    options: {
      emailRedirectTo: `${origin}/auth/konfirmasi`,
      // sekolah dibuat setelah email dikonfirmasi (lihat lib/sekolah-saya.ts)
      data: { nama: f.nama.trim(), slug: f.slug, npsn: f.npsn, kode_ref: f.kodeRef.trim().toUpperCase(),
        // versi dokumen yang disetujui, tercatat di akun
        setuju_syarat: VERSI_SYARAT, setuju_privasi: VERSI_PRIVASI, setuju_pada: new Date().toISOString() },
    },
  });
  // Email yang sudah terdaftar tidak dibedakan, supaya tidak bisa dipakai menebak email orang.
  if (error?.code === "email_address_invalid") return { ok: false, pesan: "Email ini ditolak. Pastikan alamat email benar dan masih aktif." };
  if (error?.code === "over_email_send_rate_limit") return { ok: false, pesan: "Terlalu banyak percobaan. Coba lagi beberapa menit lagi." };
  if (error && error.status !== 422) return { ok: false, pesan: "Pendaftaran belum berhasil. Coba lagi sebentar lagi." };
  return { ok: true };
}

/** Untuk admin yang sudah login tetapi sekolahnya belum terbentuk (slug keburu terpakai). */
export async function lengkapiSekolah(f: { nama: string; slug: string; npsn: string }): Promise<Hasil> {
  if (!SLUG_RE.test(f.slug)) return { ok: false, pesan: "Alamat halaman tidak valid." };
  const db = await supabaseServer();
  const { error } = await db.rpc("buat_sekolah", { p_slug: f.slug, p_nama: f.nama.trim(), p_npsn: f.npsn, p_kode_ref: "" });
  if (error) return { ok: false, pesan: error.message === "slug_tidak_tersedia" ? "Alamat halaman sudah dipakai. Pilih yang lain." : "Gagal membuat sekolah. Coba lagi." };
  return { ok: true };
}
