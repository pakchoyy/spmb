"use client";

import { useState } from "react";
import { kompres, MAKS_BYTE, MIME } from "@/lib/berkas";
import { unggahBerkas } from "./actions";

type Props = { slug: string; nomor: string; tglLahir: string; syarat: string[]; sudah: string[]; format: string[]; onSelesai?: () => void };

/** Unggah per berkas; yang gagal bisa diulang tanpa mengulang form. */
export default function Unggah({ slug, nomor, tglLahir, syarat, sudah, format, onSelesai }: Props) {
  const [ok, setOk] = useState<string[]>(sudah);
  const [sibuk, setSibuk] = useState<string | null>(null);
  const [galat, setGalat] = useState<Record<string, string>>({});
  const terima = format.map((f) => MIME[f]).filter(Boolean).join(",");

  async function pilih(jenis: string, f: File | undefined) {
    if (!f) return;
    setSibuk(jenis);
    setGalat((g) => ({ ...g, [jenis]: "" }));
    try {
      const kecil = await kompres(f);
      if (kecil.size > MAKS_BYTE) throw new Error("Ukuran berkas maksimal 2 MB.");
      const fd = new FormData();
      fd.set("file", kecil);
      const r = await unggahBerkas(slug, nomor, tglLahir, jenis, fd);
      if (!r.ok) throw new Error(r.pesan);
      setOk((o) => [...new Set([...o, jenis])]);
    } catch (e) {
      setGalat((g) => ({ ...g, [jenis]: e instanceof Error ? e.message : "Unggah gagal. Coba lagi." }));
    } finally {
      setSibuk(null);
    }
  }

  const lengkap = syarat.every((s) => ok.includes(s));
  return (
    <div className="space-y-3">
      {syarat.map((j) => (
        <div key={j} className="rounded-lg border p-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">{j}</span>
            <span className={ok.includes(j) ? "text-green-700" : "text-neutral-500"}>
              {sibuk === j ? "Mengunggah…" : ok.includes(j) ? "Terunggah ✓" : "Belum"}
            </span>
          </div>
          <label className="mt-2 flex h-12 cursor-pointer items-center justify-center rounded-lg border border-dashed text-sm">
            {ok.includes(j) ? "Ganti berkas" : galat[j] ? "Coba unggah lagi" : "Pilih berkas / foto"}
            <input type="file" accept={terima} capture={undefined} className="sr-only" disabled={sibuk !== null}
              onChange={(e) => { void pilih(j, e.target.files?.[0]); e.target.value = ""; }} />
          </label>
          {galat[j] && <p role="alert" className="mt-1 text-sm text-red-700">{galat[j]}</p>}
        </div>
      ))}
      <p className="text-sm text-neutral-600">Format {format.join(", ").toUpperCase()}, maksimal 2 MB per berkas.</p>
      {onSelesai && (
        <button type="button" onClick={onSelesai} disabled={sibuk !== null}
          className="h-12 w-full rounded-lg bg-[var(--aksen)] font-medium text-white disabled:opacity-50">
          {lengkap ? "Selesai" : "Lanjut, lengkapi berkas nanti"}
        </button>
      )}
    </div>
  );
}
