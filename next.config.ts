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
