"use client";

import { useState } from "react";
import { Galat, input, tombol } from "@/components/ui";
import { useAksi } from "@/components/aksi";
import { simpanPengumuman } from "./actions";

// <input type="datetime-local"> tanpa zona waktu; sekolah memakai WIB.
const keLokal = (iso: string | null) => (iso ? new Date(new Date(iso).getTime() + 7 * 3600000).toISOString().slice(0, 16) : "");
const keIso = (lokal: string) => (lokal ? `${lokal}:00+07:00` : null);

export default function PengumumanForm({ awal, bisaUbah }: { awal: string | null; bisaUbah: boolean }) {
  const [aktif, setAktif] = useState(!!awal);
  const [waktu, setWaktu] = useState(keLokal(awal));
  const { pending, galat, jalankan } = useAksi();

  return (
    <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); jalankan(() => simpanPengumuman(aktif ? keIso(waktu) : null)); }}>
      <fieldset disabled={!bisaUbah || pending} className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {([[false, "Langsung terlihat", "Orang tua melihat hasil begitu admin menetapkan"], [true, "Serentak", "Hasil tampil bersamaan pada tanggal tertentu"]] as const).map(([v, j, t]) => (
            <button key={j} type="button" aria-pressed={aktif === v} onClick={() => setAktif(v)}
              className={`rounded-2xl p-3 text-left ring-2 ${aktif === v ? "bg-[var(--biru-muda)] ring-[var(--biru)]" : "ring-black/10"}`}>
              <span className="block font-bold">{j}</span><span className="block text-xs text-neutral-600">{t}</span>
            </button>
          ))}
        </div>
        {aktif && (
          <label className="block"><span className="mb-1 block text-sm font-semibold">Tanggal & jam pengumuman (WIB)</span>
            <input type="datetime-local" className={input} value={waktu} required onChange={(e) => setWaktu(e.target.value)} /></label>
        )}
        <p className="text-xs text-neutral-500">Sebelum waktu itu, orang tua melihat &ldquo;Sedang diperiksa&rdquo; dan hitung mundur. Admin tetap bisa menetapkan hasil kapan saja.</p>
      </fieldset>
      <Galat>{galat}</Galat>
      {bisaUbah && <button className={tombol} disabled={pending}>{pending ? "Menyimpan…" : "Simpan pengumuman"}</button>}
    </form>
  );
}
