import type { Metadata, Viewport } from "next";
import { cache } from "react";
import { supabaseAnon } from "@/lib/supabase/anon";
import type { SekolahPublik } from "@/lib/berkas";

// Identitas sekolah (ikon tab, ikon aplikasi, warna bilah HP) untuk SEMUA halaman /[slug]/…:
// halaman sekolah, daftar, bukti pendaftaran, dan cek status.
const ambil = cache(async (slug: string) => {
  const { data } = await supabaseAnon().rpc("sekolah_publik", { p_slug: slug });
  return data as SekolahPublik | null;
});

type P = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const s = await ambil((await params).slug);
  if (!s) return {};
  const v = (s.logo_path ?? "").replace(/\W/g, "").slice(-8) || "0"; // berubah saat logo diganti
  return {
    title: { default: `SPMB ${s.nama}`, template: `%s · ${s.nama}` },
    manifest: `/${s.slug}/manifest.webmanifest`,
    icons: { icon: `/api/ikon/192?s=${s.slug}&v=${v}`, apple: `/api/ikon/180?s=${s.slug}&v=${v}` },
    appleWebApp: { capable: true, title: s.nama.slice(0, 20), statusBarStyle: "default" },
  };
}

export async function generateViewport({ params }: P): Promise<Viewport> {
  const s = await ambil((await params).slug);
  return { themeColor: s?.warna_aksen ?? "#2449d8" };
}

export default function LayoutSekolah({ children }: { children: React.ReactNode }) {
  return children;
}
