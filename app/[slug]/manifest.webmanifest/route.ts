import { supabaseAnon } from "@/lib/supabase/anon";
import type { SekolahPublik } from "@/lib/berkas";

// Manifest per sekolah: "Pasang di layar HP" menambahkan halaman sekolah itu, bukan aplikasi umum.
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data } = await supabaseAnon().rpc("sekolah_publik", { p_slug: slug });
  const s = data as SekolahPublik | null;
  if (!s) return new Response("Not found", { status: 404 });

  const ikon = (px: number, ekstra = "") => `/api/ikon/${px}?s=${s.slug}${ekstra}`;
  const body = {
    name: `SPMB ${s.nama}`,
    short_name: s.nama.slice(0, 12).trim(),
    description: `Pendaftaran SPMB online ${s.nama}.`,
    start_url: `/${s.slug}`,
    scope: `/${s.slug}`,
    display: "standalone",
    lang: "id",
    background_color: "#f4f6ff",
    theme_color: s.warna_aksen,
    icons: [
      { src: ikon(192), sizes: "192x192", type: "image/png" },
      { src: ikon(512), sizes: "512x512", type: "image/png" },
      { src: ikon(512, "&maskable=1"), sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/manifest+json", "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400" },
  });
}
