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
      <path d="M79 27 L50 10 L18 27 L18 43 L50 50 L82 57 L82 73 L50 90 L21 73" fill="none" stroke={putih ? "#fff" : "url(#spmbz-g)"} strokeWidth="19" strokeLinejoin="round" />
      {/* dokumen di dalam huruf S */}
      <path d="M28 26 L50 16 L68 25 L68 45 L28 38 Z" fill={putih ? "#1d5fd6" : "#fff"} stroke={putih ? "#1d5fd6" : "#fff"} strokeWidth="3" strokeLinejoin="round" />
      <g stroke={putih ? "#fff" : "#2567C9"} strokeWidth="4.5" strokeLinecap="round"><path d="M36 27 H56" /><path d="M36 35 H60" /></g>
      <circle cx="72" cy="73" r="17" fill={putih ? "#1d5fd6" : "#fff"} />
      <circle cx="72" cy="73" r="13.5" fill="#0F2F5B" />
      <path d="M65 73.5 L70 78.5 L79 68" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
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
