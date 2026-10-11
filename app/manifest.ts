import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SPMB Zone — SPMB",
    short_name: "SPMB Zone",
    description: "Pendaftaran SPMB online untuk sekolah.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f6ff",
    theme_color: "#2449d8",
    lang: "id",
    icons: [
      { src: "/api/ikon/192", sizes: "192x192", type: "image/png" },
      { src: "/api/ikon/512", sizes: "512x512", type: "image/png" },
      { src: "/api/ikon/512?maskable=1", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
