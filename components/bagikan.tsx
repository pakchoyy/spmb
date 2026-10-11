"use client";

import { Share2 } from "lucide-react";

/** Bagikan tautan lewat menu bagikan HP; bila tidak tersedia, buka WhatsApp. */
export default function Bagikan({ judul, teks, url, className = "btn btn-lembut btn-pil", label = "Bagikan" }:
  { judul: string; teks: string; url?: string; className?: string; label?: string }) {
  function bagikan() {
    const u = url ?? location.href;
    if (navigator.share) { navigator.share({ title: judul, text: `${teks}\n${u}` }).catch(() => {}); return; }
    window.open(`https://wa.me/?text=${encodeURIComponent(`${teks} ${u}`)}`, "_blank", "noopener");
  }
  return <button type="button" onClick={bagikan} className={className}><Share2 className="size-4" aria-hidden /> {label}</button>;
}
