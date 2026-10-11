import type { MetadataRoute } from "next";
import { supabaseService } from "@/lib/supabase/admin";

export const revalidate = 3600;

const ASAL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://spmbz.web.id").replace(/\/$/, "");

/** Beranda, panduan, dan halaman sekolah yang sedang menerima pendaftar, supaya muncul di Google. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data } = await supabaseService().rpc("ringkasan_sekolah").then((r) => r, () => ({ data: null }));
  const sekolah = ((data ?? []) as { slug: string; status: string; nonaktif: boolean }[])
    .filter((s) => (s.status === "trial" || s.status === "aktif") && !s.nonaktif);
  return [
    { url: ASAL, changeFrequency: "weekly", priority: 1 },
    { url: `${ASAL}/cara-pakai`, changeFrequency: "monthly", priority: 0.6 },
    ...sekolah.map((s) => ({ url: `${ASAL}/${s.slug}`, changeFrequency: "daily" as const, priority: 0.8 })),
  ];
}
