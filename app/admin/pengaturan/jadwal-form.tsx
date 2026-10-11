"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Galat, input, tombol } from "@/components/ui";
import { useAksi } from "@/components/aksi";
import type { Jadwal } from "@/lib/berkas";
import { simpanJadwal } from "./actions";

const CONTOH = ["Pendaftaran online", "Verifikasi berkas", "Pengumuman hasil", "Daftar ulang"];

export default function JadwalForm({ awal, bisaUbah }: { awal: Jadwal[]; bisaUbah: boolean }) {
  const [d, setD] = useState<Jadwal[]>(awal.length ? awal : CONTOH.map((judul) => ({ judul, mulai: "", selesai: null })));
  const { pending, galat, jalankan } = useAksi();
  const ubah = (i: number, p: Partial<Jadwal>) => setD((x) => x.map((j, n) => (n === i ? { ...j, ...p } : j)));

  return (
    <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); jalankan(() => simpanJadwal(d)); }}>
      <fieldset disabled={!bisaUbah || pending} className="space-y-3">
        <ol className="space-y-3">
          {d.map((j, i) => (
            <li key={i} className="rounded-2xl bg-[var(--biru-muda)]/60 p-3">
              <div className="flex items-center gap-2">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[var(--biru)] text-sm font-bold text-white">{i + 1}</span>
                <input className={input} value={j.judul} maxLength={80} placeholder="Nama tahap" aria-label={`Nama tahap ${i + 1}`} onChange={(e) => ubah(i, { judul: e.target.value })} />
                <button type="button" aria-label="Hapus tahap" className="grid size-10 shrink-0 place-items-center rounded-xl text-neutral-500" onClick={() => setD(d.filter((_, n) => n !== i))}><Trash2 className="size-5" /></button>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 pl-9">
                <label className="text-xs font-semibold">Mulai<input type="date" className={input} value={j.mulai} onChange={(e) => ubah(i, { mulai: e.target.value })} /></label>
                <label className="text-xs font-semibold">Selesai (boleh kosong)<input type="date" className={input} value={j.selesai ?? ""} onChange={(e) => ubah(i, { selesai: e.target.value || null })} /></label>
              </div>
            </li>
          ))}
        </ol>
        {d.length < 8 && (
          <button type="button" className="btn btn-lembut btn-pil" onClick={() => setD([...d, { judul: "", mulai: "", selesai: null }])}><Plus className="size-4" aria-hidden />Tambah tahap</button>
        )}
      </fieldset>
      <p className="text-xs text-neutral-500">Tahap tanpa tanggal tidak disimpan. Urutan mengikuti tanggal mulai.</p>
      <Galat>{galat}</Galat>
      {bisaUbah && <button className={tombol} disabled={pending}>{pending ? "Menyimpan…" : "Simpan jadwal"}</button>}
    </form>
  );
}
