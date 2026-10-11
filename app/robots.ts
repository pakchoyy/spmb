import type { MetadataRoute } from "next";

const ASAL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://spmbz.web.id").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/super", "/api", "/auth", "/keluar", "/*/daftar", "/*/sukses", "/*/cek-status"] },
    sitemap: `${ASAL}/sitemap.xml`,
  };
}
