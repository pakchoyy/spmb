"use client";

import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";

type PromptPasang = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

/**
 * Tombol "Pasang aplikasi". Android/Chrome: memakai prompt bawaan browser.
 * iPhone/iPad: menampilkan petunjuk Bagikan → Tambahkan ke Layar Utama. Tersembunyi bila sudah terpasang.
 */
export default function PasangApp({ judul = "Pasang aplikasi di HP", teks = "Buka lebih cepat dari layar utama, seperti aplikasi.", kunci = "pasang" }: { judul?: string; teks?: string; kunci?: string }) {
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
    <div className="relative flex items-center gap-3 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-black/5 print:hidden">
      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--biru-muda)]"><Download className="size-5 text-[var(--biru)]" aria-hidden /></span>
      <div className="min-w-0 flex-1">
        <p className="font-bold">{judul}</p>
        {petunjuk
          ? <p className="text-sm text-neutral-700">Ketuk <Share className="inline size-4 align-[-2px]" aria-label="Bagikan" /> di bawah layar, lalu pilih <b>Tambahkan ke Layar Utama</b>.</p>
          : <p className="text-sm text-neutral-600">{teks}</p>}
      </div>
      {!petunjuk && (
        <button type="button" className="btn btn-utama btn-pil shrink-0" onClick={async () => {
          if (prompt) { await prompt.prompt(); const r = await prompt.userChoice; if (r.outcome === "accepted") setTutup(true); setPrompt(null); }
          else setPetunjuk(true);
        }}>Pasang</button>
      )}
      <button type="button" aria-label="Tutup" onClick={sembunyi} className="absolute right-2 top-2 grid size-7 place-items-center rounded-full text-neutral-400"><X className="size-4" /></button>
    </div>
  );
}
