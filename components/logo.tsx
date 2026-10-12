import Link from "next/link";
import { NAMA_APP } from "@/lib/merek";

/**
 * Tanda SPMB Zone: heksagon berbentuk huruf S + dokumen bergaris + centang (lihat public/merek/).
 * `putih` = versi satu warna untuk ikon aplikasi di atas latar biru.
 */
export function TandaLogo({ className = "size-9", putih = false }: { className?: string; putih?: boolean }) {
  return (
    <svg viewBox="-4 -4 108 108" className={className} aria-hidden>
      {!putih && (
        <defs>
          <linearGradient id="spmbz-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2f8bff" /><stop offset="1" stopColor="#1747c4" /></linearGradient>
        </defs>
      )}
      <path d="M78 22 L50 7 L14 27 L14 47 L86 53 L86 73 L50 93 L22 78" fill="none" stroke={putih ? "#fff" : "url(#spmbz-g)"} strokeWidth="13" strokeLinejoin="round" />
      <g stroke={putih ? "#fff" : "#2567C9"} strokeWidth="4.2" strokeLinecap="round"><path d="M31 27 H55" /><path d="M31 35 H62" /></g>
      <circle cx="70" cy="71" r="18" fill={putih ? "#2567C9" : "#fff"} />
      <circle cx="70" cy="71" r="14.5" fill={putih ? "#fff" : "#0F2F5B"} />
      <path d="M62.5 71.5 L68 77 L78 65.5" fill="none" stroke={putih ? "#2567C9" : "#fff"} strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Logo: tanda + nama aplikasi. `terang` untuk latar gelap (footer). */
export function Logo({ terang = false }: { terang?: boolean }) {
  return (
    <Link href="/" className={`flex items-center gap-2 font-serif text-xl font-bold ${terang ? "text-white" : "text-[#0F2F5B]"}`}>
      <span className={terang ? "grid size-10 place-items-center rounded-xl bg-white" : ""}><TandaLogo /></span>
      {NAMA_APP}
    </Link>
  );
}
