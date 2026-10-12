"use client";

import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";

type PromptPasang = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

/**
 * Tombol "Pasang aplikasi". Android/Chrome: memakai prompt bawaan browser.
 * iPhone/iPad: menampilkan petunjuk Bagikan → Tambahkan ke Layar Utama. Tersembunyi bila sudah terpasang.
 */
export default function PasangApp({ judul = "Pasang aplikasi di HP", teks = "Buka lebih cepat dari layar utama, seperti aplikasi.", kunci = "pasang", ikon = "/api/ikon/192?v=3", nama = "SPMB Zone" }: { judul?: string; teks?: string; kunci?: string; ikon?: string; nama?: string }) {
  const [prompt, setPrompt] = useState<PromptPasang | null>(null);
  const [ios, setIos] = useState(false);
  const [petunjuk, setPetunjuk] = useState(false);
  const [tutup, setTutup] = useState(true);

  useEffect(() => {
    const terpasang = matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone;
    let ditutup = false;
    try { ditutup = localStorage.getItem(`tutup:${kunci}`) === "1"; } catch {}
    if (terpasang || ditutup) return;
    /* eslint-disable react-hooks/set-state-in-effect -- deteksi perangkat hanya di klien */
    setTutup(false);
    setIos(/iphone|ipad|ipod/i.test(navigator.userAgent) && !/crios|fxios/i.test(navigator.userAgent));
    /* eslint-enable react-hooks/set-state-in-effect */
    const tangkap = (e: Event) => { e.preventDefault(); setPrompt(e as PromptPasang); };
    addEventListener("beforeinstallprompt", tangkap);
    addEventListener("appinstalled", () => setTutup(true));
    return () => removeEventListener("beforeinstallprompt", tangkap);
  }, [kunci]);

  if (tutup || (!prompt && !ios)) return null;
  const sembunyi = () => { setTutup(true); try { localStorage.setItem(`tutup:${kunci}`, "1"); } catch {} };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--biru)] to-[#14204a] p-4 text-white shadow-lg print:hidden">
      <div aria-hidden className="absolute -right-6 -top-10 size-32 rounded-full bg-white/10" />
      <div className="relative flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={ikon} alt="" width={56} height={56} className="size-14 shrink-0 rounded-2xl bg-white shadow-md ring-2 ring-white/40" />
        <div className="min-w-0 flex-1 pr-6">
          <p className="font-bold leading-tight">{judul}</p>
          <p className="truncate text-xs text-white/70">{nama} · aplikasi web</p>
        </div>
      </div>
      <p className="relative mt-3 text-sm text-white/90">
        {petunjuk
          ? <>Ketuk <Share className="inline size-4 align-[-2px]" aria-label="Bagikan" /> di bawah layar Safari, lalu pilih <b>Tambahkan ke Layar Utama</b>.</>
          : teks}
      </p>
      {!petunjuk && (
        <button type="button" className="btn btn-kuning relative mt-3 w-full" onClick={async () => {
          if (prompt) { await prompt.prompt(); const r = await prompt.userChoice; if (r.outcome === "accepted") setTutup(true); setPrompt(null); }
          else setPetunjuk(true);
        }}><Download className="size-5" aria-hidden />Pasang sekarang</button>
      )}
      <button type="button" aria-label="Tutup" onClick={sembunyi} className="absolute right-2 top-2 grid size-8 place-items-center rounded-full text-white/70"><X className="size-4" /></button>
    </div>
  );
}
