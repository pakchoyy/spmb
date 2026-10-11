import Link from "next/link";
import { NAMA_APP } from "@/lib/merek";

/** Logo: pintu gerbang bulat dengan titik kuning, lalu nama aplikasi. */
export function Logo({ terang = false }: { terang?: boolean }) {
  return (
    <Link href="/" className={`flex items-center gap-2 font-serif text-xl font-bold ${terang ? "text-white" : "text-[var(--biru)]"}`}>
      <svg viewBox="0 0 32 32" aria-hidden className="size-8">
        <rect width="32" height="32" rx="10" fill={terang ? "#fff" : "var(--biru)"} />
        <path d="M9 25V15a7 7 0 0 1 14 0v10" fill="none" stroke={terang ? "var(--biru)" : "#fff"} strokeWidth="3" strokeLinecap="round" />
        <circle cx="16" cy="20" r="2.4" fill="var(--kuning)" />
      </svg>
      {NAMA_APP}
    </Link>
  );
}
