"use server";

import { headers } from "next/headers";
import { supabaseAnon } from "@/lib/supabase/anon";
import { supabaseServer } from "@/lib/supabase/server";
import { bolehLanjut } from "@/lib/perangkat";
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

type Hasil = { ok: true; langsung?: boolean } | { ok: false; pesan: string };

const PESAN_NPSN = "NPSN ini sudah terdaftar. Jika ini sekolah Anda, hubungi admin sekolah yang mendaftar atau chat kami lewat WhatsApp.";

async function npsnTerdaftar(npsn: string) {
  const { data } = await supabaseAnon().rpc("npsn_terdaftar", { p_npsn: npsn });
  return data === true;
}

export async function daftarSekolah(f: {
  nama: string; slug: string; npsn: string; email: string; sandi: string; kodeRef: string; setuju: boolean;
}): Promise<Hasil> {
  if (!f.setuju) return { ok: false, pesan: "Centang persetujuan Syarat dan Ketentuan untuk melanjutkan." };
  const email = f.email.trim().toLowerCase();
  if (f.nama.trim().length < 3) return { ok: false, pesan: "Isi nama sekolah." };
  if (!SLUG_RE.test(f.slug)) return { ok: false, pesan: "Alamat halaman tidak valid." };
  if (!/^\d{8}$/.test(f.npsn)) return { ok: false, pesan: "Isi NPSN sekolah (8 angka)." };
  if (!/^\S+@\S+\.\S+$/.test(email)) return { ok: false, pesan: "Isi email yang benar." };
  if (f.sandi.length < 8) return { ok: false, pesan: "Kata sandi minimal 8 karakter." };
  if (!(await cekSlugAksi(f.slug)).tersedia) return { ok: false, pesan: "Alamat halaman sudah dipakai. Pilih yang lain." };
  if (await npsnTerdaftar(f.npsn)) return { ok: false, pesan: PESAN_NPSN };
  if (!(await bolehLanjut("daftar-sekolah", 5, 60))) return { ok: false, pesan: "Terlalu banyak pendaftaran dari perangkat ini. Coba lagi 1 jam lagi." };

  // alamat tautan email dari env, bukan header permintaan (header bisa dipalsukan)
  const h = await headers();
  const origin = (process.env.NEXT_PUBLIC_SITE_URL ?? `https://${h.get("host")}`).replace(/\/$/, "");
  const db = await supabaseServer();
  const { data, error } = await db.auth.signUp({
    email, password: f.sandi,
    options: {
      emailRedirectTo: `${origin}/auth/konfirmasi`,
      // sekolah dibuat saat pertama masuk ke /admin (lihat lib/sekolah-saya.ts)
      data: { nama: f.nama.trim(), slug: f.slug, npsn: f.npsn, kode_ref: f.kodeRef.trim().toUpperCase(),
        // versi dokumen yang disetujui, tercatat di akun
        setuju_syarat: VERSI_SYARAT, setuju_privasi: VERSI_PRIVASI, setuju_pada: new Date().toISOString() },
    },
  });
  if (error?.code === "email_address_invalid") return { ok: false, pesan: "Email ini ditolak. Pastikan alamat email benar dan masih aktif." };
  if (error?.code === "over_email_send_rate_limit") return { ok: false, pesan: "Terlalu banyak percobaan. Coba lagi beberapa menit lagi." };
  if (error?.code === "user_already_exists" || error?.status === 422) return { ok: false, pesan: "Email ini sudah terdaftar. Silakan masuk." };
  if (error) return { ok: false, pesan: "Pendaftaran belum berhasil. Coba lagi sebentar lagi." };
  // Konfirmasi email dimatikan di Supabase: sesi langsung ada, admin langsung masuk.
  // Bila suatu saat konfirmasi dinyalakan lagi, sesi kosong dan form menampilkan "Cek email".
  return { ok: true, langsung: !!data.session };
}

/** Untuk admin yang sudah login tetapi belum punya sekolah: masuk lewat Google, atau alamat keburu dipakai. */
export async function lengkapiSekolah(f: { nama: string; slug: string; npsn: string; kodeRef: string; setuju: boolean }): Promise<Hasil> {
  if (!f.setuju) return { ok: false, pesan: "Centang persetujuan Syarat dan Ketentuan untuk melanjutkan." };
  if (f.nama.trim().length < 3) return { ok: false, pesan: "Isi nama sekolah." };
  if (!SLUG_RE.test(f.slug)) return { ok: false, pesan: "Alamat halaman tidak valid." };
  if (!/^\d{8}$/.test(f.npsn)) return { ok: false, pesan: "Isi NPSN sekolah (8 angka)." };
  const db = await supabaseServer();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return { ok: false, pesan: "Sesi berakhir. Silakan masuk lagi." };
  // versi dokumen yang disetujui ikut tercatat untuk akun Google
  if (!user.user_metadata?.setuju_syarat) {
    await db.auth.updateUser({ data: { setuju_syarat: VERSI_SYARAT, setuju_privasi: VERSI_PRIVASI, setuju_pada: new Date().toISOString() } });
  }
  const { error } = await db.rpc("buat_sekolah", {
    p_slug: f.slug, p_nama: f.nama.trim(), p_npsn: f.npsn, p_kode_ref: f.kodeRef.trim().toUpperCase(),
  });
  if (error) return { ok: false, pesan: {
    slug_tidak_tersedia: "Alamat halaman sudah dipakai. Pilih yang lain.",
    sudah_punya_sekolah: "Akun ini sudah punya sekolah.",
    npsn_terdaftar: PESAN_NPSN,
    npsn_tidak_valid: "Isi NPSN sekolah (8 angka).",
  }[error.message] ?? "Gagal membuat sekolah. Coba lagi." };
  return { ok: true };
}
