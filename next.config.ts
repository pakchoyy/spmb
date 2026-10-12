import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // unggah berkas maksimal 2 MB lewat Server Action (+ ruang untuk overhead multipart)
  experimental: { serverActions: { bodySizeLimit: "3mb" } },
  // logo, banner, dan galeri sekolah dari bucket publik Supabase, dioptimalkan Next.js (WebP, ukuran sesuai layar)
  images: {
    remotePatterns: process.env.NEXT_PUBLIC_SUPABASE_URL
      ? [{ protocol: "https", hostname: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname, pathname: "/storage/v1/object/public/**" }]
      : [],
  },
  poweredByHeader: false,
  // browser yang langsung meminta /favicon.ico tetap mendapat logo SPMB Zone
  async rewrites() {
    return [{ source: "/favicon.ico", destination: "/api/ikon/192?v=3" }];
  },
  // header keamanan dasar untuk semua halaman
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=()" },
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
      ],
    }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
