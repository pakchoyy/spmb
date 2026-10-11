"use client";

import { useState } from "react";
import { kompres, MAKS_BYTE, MIME } from "@/lib/berkas";
import { unggahBerkas } from "./actions";
import { Camera, CheckCircle2, FolderOpen } from "lucide-react";

type Props = { slug: string; nomor: string; tglLahir: string; syarat: string[]; sudah: string[]; format: string[]; onSelesai?: () => void };

/** Unggah per berkas; yang gagal bisa diulang tanpa mengulang form. */
export default function Unggah({ slug, nomor, tglLahir, syarat, sudah, format, onSelesai }: Props) {
  const [ok, setOk] = useState<string[]>(sudah);
  const [sibuk, setSibuk] = useState<string | null>(null);
  const [pratinjau, setPratinjau] = useState<Record<string, string>>({});
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
      // pratinjau kecil foto yang terkirim, supaya orang tua yakin berkasnya benar
      if (kecil.type.startsWith("image/")) {
        const url = URL.createObjectURL(kecil);
        setPratinjau((p) => { if (p[jenis]) URL.revokeObjectURL(p[jenis]); return { ...p, [jenis]: url }; });
      }
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
        <div key={j} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold">{j}</span>
            <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${ok.includes(j) ? "bg-[var(--mint-muda)] text-[#0b6b52]" : "bg-neutral-100 text-neutral-600"}`}>
              {sibuk === j ? "Mengunggah…" : ok.includes(j) ? <><CheckCircle2 className="size-3.5" aria-hidden />Terkirim</> : "Belum"}
            </span>
          </div>
          {pratinjau[j] && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={pratinjau[j]} alt={`Pratinjau ${j}`} className="mt-2 h-28 w-full rounded-xl object-cover" />
          )}
          <div className={`mt-2 grid gap-2 ${format.includes("jpg") ? "grid-cols-2" : ""}`}>
            {format.includes("jpg") && <label className={`btn btn-pil h-11 cursor-pointer text-white ${sibuk !== null ? "opacity-50" : ""}`} style={{ background: "var(--aksen)" }}>
              <Camera className="size-4" aria-hidden />{ok.includes(j) ? "Foto ulang" : "Ambil foto"}
              <input type="file" accept="image/*" capture="environment" className="sr-only" disabled={sibuk !== null}
                onChange={(e) => { void pilih(j, e.target.files?.[0]); e.target.value = ""; }} />
            </label>}
            <label className={`btn btn-pil h-11 cursor-pointer border-2 border-neutral-300 bg-white ${sibuk !== null ? "opacity-50" : ""}`}>
              <FolderOpen className="size-4" aria-hidden />{galat[j] ? "Coba lagi" : "Pilih file"}
              <input type="file" accept={terima} className="sr-only" disabled={sibuk !== null}
                onChange={(e) => { void pilih(j, e.target.files?.[0]); e.target.value = ""; }} />
            </label>
          </div>
          {galat[j] && <p role="alert" className="mt-1 text-sm text-red-700">{galat[j]}</p>}
        </div>
      ))}
      <p className="text-sm text-neutral-600">Format {format.join(", ").toUpperCase()}, maksimal 2 MB per berkas.</p>
      {onSelesai && (
        <button type="button" onClick={onSelesai} disabled={sibuk !== null}
          className="btn h-12 w-full text-white" style={{ background: "var(--aksen)" }}>
          {lengkap ? "Selesai" : "Lanjut, lengkapi berkas nanti"}
        </button>
      )}
    </div>
  );
}
