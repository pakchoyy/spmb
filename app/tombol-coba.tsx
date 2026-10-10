"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

/** Tautan "Coba gratis". Kode ajakan dari ?ref= dibawa ke /daftar saat diklik, supaya halaman tetap bisa di-cache. */
export default function TombolCoba({ className, children }: { className?: string; children: React.ReactNode }) {
  const router = useRouter();
  return (
    <Link href="/daftar" className={className} onClick={(e) => {
      const ref = new URLSearchParams(window.location.search).get("ref");
      if (!ref) return;
      e.preventDefault();
      router.push(`/daftar?ref=${encodeURIComponent(ref.slice(0, 12))}`);
    }}>{children}</Link>
  );
}
