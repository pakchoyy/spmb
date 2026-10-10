"use client";

import { useState } from "react";
import { Galat, Kolom, input, tombol } from "@/components/ui";
import { useAksi } from "@/components/aksi";
import { geserField, hapusField, simpanField } from "./actions";

export type FieldAdmin = { id: string; label: string; tipe: string; opsi: string[] | null; wajib: boolean };
const TIPE: Record<string, string> = { teks: "Teks pendek", paragraf: "Teks panjang", angka: "Angka", tanggal: "Tanggal", pilihan: "Pilihan" };

function Editor({ fd, bisaUbah, onSelesai }: { fd?: FieldAdmin; bisaUbah: boolean; onSelesai?: () => void }) {
  const [f, setF] = useState({ label: fd?.label ?? "", tipe: fd?.tipe ?? "teks", opsi: (fd?.opsi ?? []).join("\n"), wajib: fd?.wajib ?? true });
  const { pending, galat, jalankan } = useAksi();
  const set = (p: Partial<typeof f>) => setF((x) => ({ ...x, ...p }));
  return (
    <form className="space-y-3 rounded-xl border bg-white p-4" onSubmit={(e) => {
      e.preventDefault();
      jalankan(() => simpanField({ id: fd?.id, ...f }), () => { if (!fd) setF({ label: "", tipe: "teks", opsi: "", wajib: true }); onSelesai?.(); });
    }}>
      <fieldset disabled={!bisaUbah || pending} className="space-y-3">
        <Kolom label="Nama isian"><input className={input} value={f.label} maxLength={80} placeholder="Contoh: Nama orang tua" onChange={(e) => set({ label: e.target.value })} /></Kolom>
        <Kolom label="Jenis">
          <select className={input} value={f.tipe} onChange={(e) => set({ tipe: e.target.value })}>
            {Object.entries(TIPE).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </Kolom>
        {f.tipe === "pilihan" && (
          <Kolom label="Pilihan (satu per baris)"><textarea className="min-h-20 w-full rounded-lg border p-3" value={f.opsi} onChange={(e) => set({ opsi: e.target.value })} /></Kolom>
        )}
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="size-5" checked={f.wajib} onChange={(e) => set({ wajib: e.target.checked })} />Wajib diisi</label>
      </fieldset>
      <Galat>{galat}</Galat>
      {bisaUbah && <button className={tombol} disabled={pending}>{fd ? "Simpan" : "Tambah isian"}</button>}
    </form>
  );
}

export default function FieldForm({ fields, bisaUbah }: { fields: FieldAdmin[]; bisaUbah: boolean }) {
  const [edit, setEdit] = useState<string | null>(null);
  const aksi = useAksi();
  return (
    <div className="space-y-3">
      <p className="text-sm text-neutral-600">Nama dan tanggal lahir anak sudah ada di form. Tambahkan isian lain yang sekolah butuhkan, tanpa batas jumlah.</p>
      <ul className="space-y-2">
        {fields.map((fd, i) => (
          <li key={fd.id}>
            {edit === fd.id ? <Editor fd={fd} bisaUbah={bisaUbah} onSelesai={() => setEdit(null)} /> : (
              <div className="flex items-center gap-2 rounded-xl border bg-white p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{fd.label}{fd.wajib && <span className="text-red-600"> *</span>}</p>
                  <p className="text-sm text-neutral-600">{TIPE[fd.tipe]}</p>
                </div>
                {bisaUbah && (<>
                  <button aria-label="Naik" className="size-10 rounded border disabled:opacity-30" disabled={i === 0 || aksi.pending} onClick={() => aksi.jalankan(() => geserField(fd.id, -1))}>↑</button>
                  <button aria-label="Turun" className="size-10 rounded border disabled:opacity-30" disabled={i === fields.length - 1 || aksi.pending} onClick={() => aksi.jalankan(() => geserField(fd.id, 1))}>↓</button>
                  <button className="h-10 rounded border px-3 text-sm" onClick={() => setEdit(fd.id)}>Ubah</button>
                  <button className="h-10 rounded border px-3 text-sm" disabled={aksi.pending} onClick={() => confirm(`Hapus isian "${fd.label}"?`) && aksi.jalankan(() => hapusField(fd.id))}>Hapus</button>
                </>)}
              </div>
            )}
          </li>
        ))}
      </ul>
      <Galat>{aksi.galat}</Galat>
      <Editor key={fields.length} bisaUbah={bisaUbah} />
    </div>
  );
}
