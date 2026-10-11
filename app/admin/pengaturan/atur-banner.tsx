"use client";

import { useRef, useState } from "react";
import { Move, ZoomIn } from "lucide-react";
import { useAksi } from "@/components/aksi";
import { Galat } from "@/components/ui";
import { simpanBannerAtur } from "./actions";

export type BannerAtur = { x: number; y: number; z: number };

/** Geser foto untuk memilih bagian yang tampil, dan perbesar dengan penggeser (seperti mengatur foto profil). */
export default function AturBanner({ src, awal, warna }: { src: string; awal: BannerAtur; warna: string }) {
  const [a, setA] = useState<BannerAtur>({ x: awal.x ?? 50, y: awal.y ?? 50, z: awal.z ?? 100 });
  const tarik = useRef<{ px: number; py: number; x: number; y: number } | null>(null);
  const kotak = useRef<HTMLDivElement>(null);
  const { pending, galat, tersimpan, jalankan } = useAksi();
  const berubah = a.x !== (awal.x ?? 50) || a.y !== (awal.y ?? 50) || a.z !== (awal.z ?? 100);

  const gerak = (e: React.PointerEvent) => {
    const t = tarik.current, el = kotak.current;
    if (!t || !el) return;
    // geser jari ke kanan = melihat bagian kiri foto (titik fokus berkurang)
    const dx = ((e.clientX - t.px) / el.clientWidth) * 100 / (a.z / 100);
    const dy = ((e.clientY - t.py) / el.clientHeight) * 100 / (a.z / 100);
    setA((v) => ({ ...v, x: Math.min(100, Math.max(0, t.x - dx)), y: Math.min(100, Math.max(0, t.y - dy)) }));
  };

  return (
    <div className="space-y-3 rounded-2xl bg-neutral-50 p-3">
      <p className="flex items-center gap-2 text-sm font-semibold"><Move className="size-4" aria-hidden />Atur bagian foto yang tampil</p>
      <div className="grid grid-cols-[3fr_2fr] items-end gap-3">
        <div ref={kotak} className="relative aspect-[4/5] touch-none cursor-grab overflow-hidden rounded-2xl active:cursor-grabbing"
          style={{ background: `linear-gradient(160deg, ${warna}, color-mix(in srgb, ${warna} 65%, black))` }}
          onPointerDown={(e) => { (e.target as HTMLElement).setPointerCapture(e.pointerId); tarik.current = { px: e.clientX, py: e.clientY, x: a.x, y: a.y }; }}
          onPointerMove={gerak} onPointerUp={() => { tarik.current = null; }} onPointerCancel={() => { tarik.current = null; }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" draggable={false} className="absolute inset-0 size-full select-none object-cover opacity-60"
            style={{ objectPosition: `${a.x}% ${a.y}%`, transform: `scale(${a.z / 100})`, transformOrigin: `${a.x}% ${a.y}%` }} />
          <span className="absolute bottom-2 left-2 rounded-full bg-black/50 px-2 py-0.5 text-[11px] font-semibold text-white">Tampilan HP · geser foto</span>
        </div>
        <div className="relative aspect-[16/7] overflow-hidden rounded-xl" style={{ background: warna }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" className="absolute inset-0 size-full object-cover opacity-60"
            style={{ objectPosition: `${a.x}% ${a.y}%`, transform: `scale(${a.z / 100})`, transformOrigin: `${a.x}% ${a.y}%` }} />
          <span className="absolute bottom-1 left-1 rounded-full bg-black/50 px-1.5 text-[10px] text-white">Layar lebar</span>
        </div>
      </div>
      <label className="flex items-center gap-3 text-sm">
        <ZoomIn className="size-5 shrink-0 text-neutral-500" aria-hidden />
        <input type="range" min={100} max={250} value={a.z} onChange={(e) => setA({ ...a, z: Number(e.target.value) })} className="w-full accent-[var(--biru)]" aria-label="Perbesar" />
      </label>
      <Galat>{galat}</Galat>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" className="btn btn-pil btn-lembut" onClick={() => setA({ x: 50, y: 50, z: 100 })}>Ke tengah</button>
        <button type="button" className="btn btn-pil btn-utama" disabled={pending || !berubah} onClick={() => jalankan(() => simpanBannerAtur(a))}>
          {pending ? "Menyimpan…" : tersimpan && !berubah ? "Tersimpan ✓" : "Simpan posisi"}
        </button>
      </div>
    </div>
  );
}
