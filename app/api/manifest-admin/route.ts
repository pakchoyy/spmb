// Manifest aplikasi admin: dipasang dari /admin, terbuka langsung ke dasbor.
export function GET() {
  const body = {
    name: "Admin SPMB Zone",
    short_name: "Admin SPMB",
    description: "Periksa pendaftar SPMB sekolah dari HP.",
    id: "/admin",
    start_url: "/admin",
    scope: "/",
    display: "standalone",
    lang: "id",
    background_color: "#f4f6ff",
    theme_color: "#2449d8",
    categories: ["education", "productivity"],
    shortcuts: [
      { name: "Pendaftar baru", url: "/admin?status=Baru", icons: [{ src: "/api/ikon/192", sizes: "192x192" }] },
      { name: "Pengaturan", url: "/admin/pengaturan", icons: [{ src: "/api/ikon/192", sizes: "192x192" }] },
    ],
    icons: [
      { src: "/api/ikon/192", sizes: "192x192", type: "image/png" },
      { src: "/api/ikon/512", sizes: "512x512", type: "image/png" },
      { src: "/api/ikon/512?maskable=1", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
  return new Response(JSON.stringify(body), { headers: { "Content-Type": "application/manifest+json", "Cache-Control": "public, max-age=86400" } });
}
