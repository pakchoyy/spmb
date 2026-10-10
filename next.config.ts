import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // unggah berkas maksimal 2 MB lewat Server Action (+ ruang untuk overhead multipart)
  experimental: { serverActions: { bodySizeLimit: "3mb" } },
  /* config options here */
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
