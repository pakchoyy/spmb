"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Galat, Kolom, input, tombol } from "@/components/ui";
import { useAksi } from "@/components/aksi";
import { simpanDaftarUlang } from "./actions";

export type PengaturanDaftarUlang = { aktif?: boolean; tenggat?: string | null; info?: string; isian?: string[]; berkas?: string[] };

const keLokal = (iso?: string | null) => (iso ? new Date(new Date(iso).getTime() + 7 * 3600000).toISOString().slice(0, 16) : "");

function Daftar({ label, nilai, ubah, contoh, maks }: { label: string; nilai: string[]; ubah: (v: string[]) => void; contoh: string; maks: number }) {
  return (
    <div>
      <span className="mb-1 block text-sm font-semibold">{label}</span>
      <div className="space-y-2">
        {nilai.map((v, i) => (
          <div key={i} className="flex gap-2">
            <input className={input} value={v} maxLength={60} placeholder={contoh} onChange={(e) => ubah(nilai.map((x, n) => (n === i ? e.target.value : x)))} />
            <button type="button" aria-label="Hapus" className="grid size-12 shrink-0 place-items-center rounded-xl text-neutral-500" onClick={() => ubah(nilai.filter((_, n) => n !== i))}><X className="size-5" /></button>
          </div>
        ))}
        {nilai.length < maks && <button type="button" className="btn btn-pil btn-lembut" onClick={() => ubah([...nilai, ""])}><Plus className="size-4" aria-hidden />Tambah</button>}
      </div>
    </div>
  );
}

export default function DaftarUlangForm({ awal, bisaUbah }: { awal: PengaturanDaftarUlang; bisaUbah: boolean }) {
  const [f, setF] = useState({
    aktif: !!awal.aktif, tenggat: keLokal(awal.tenggat), info: awal.info ?? "",
    isian: awal.isian?.length ? awal.isian : ["Ukuran seragam", "Nama ayah", "Nama ibu"],
    berkas: awal.berkas?.length ? awal.berkas : ["Akta kelahiran"],
  });
  const { pending, galat, jalankan } = useAksi();
  const set = (p: Partial<typeof f>) => setF((x) => ({ ...x, ...p }));

  return (
    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); jalankan(() => simpanDaftarUlang({ ...f, tenggat: f.tenggat ? `${f.tenggat}:00+07:00` : null })); }}>
      <fieldset disabled={!bisaUbah || pending} className="space-y-4">
        <label className="flex items-start gap-3 rounded-2xl bg-[var(--mint-muda)] p-4">
          <input type="checkbox" className="mt-1 size-5" checked={f.aktif} onChange={(e) => set({ aktif: e.target.checked })} />
          <span><b>Buka daftar ulang</b><span className="block text-sm text-neutral-700">Orang tua anak yang <b>Diterima</b> melihat form ini di halaman cek status.</span></span>
        </label>
        <Kolom label="Batas daftar ulang (boleh kosong)"><input type="datetime-local" className={input} value={f.tenggat} onChange={(e) => set({ tenggat: e.target.value })} /></Kolom>
        <Kolom label="Informasi untuk orang tua"><textarea className="min-h-24 w-full rounded-xl border border-neutral-300 p-3" maxLength={800} value={f.info} placeholder="Contoh: Daftar ulang di sekolah tanggal 1–5 Juli, jam 08.00–12.00. Bawa berkas asli." onChange={(e) => set({ info: e.target.value })} /></Kolom>
        <Daftar label="Isian tambahan" nilai={f.isian} ubah={(isian) => set({ isian })} contoh="Ukuran seragam" maks={10} />
        <Daftar label="Berkas daftar ulang" nilai={f.berkas} ubah={(berkas) => set({ berkas })} contoh="Akta kelahiran" maks={8} />
      </fieldset>
      <Galat>{galat}</Galat>
      {bisaUbah && <button className={tombol} disabled={pending}>{pending ? "Menyimpan…" : "Simpan daftar ulang"}</button>}
    </form>
  );
}
