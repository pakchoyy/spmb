"use client";

import { useState } from "react";
import { Galat, Kolom, input, tombol } from "@/components/ui";
import { useAksi } from "@/components/aksi";
import { hapusJalur, simpanJalur } from "./actions";

export type JalurAdmin = {
  id: string; nama: string; aktif: boolean; kuota: number | null; buka: string | null; tutup: string | null;
  syarat_berkas: string[]; terkunci: boolean;
};
const NAMA = ["Domisili", "Afirmasi", "Prestasi", "Mutasi"];

// Waktu diisi dalam WIB (UTC+7), disimpan sebagai waktu absolut.
const keWib = (iso: string | null) => (iso ? new Date(new Date(iso).getTime() + 7 * 3600e3).toISOString().slice(0, 16) : "");
const dariWib = (v: string) => (v ? `${v}:00+07:00` : "");

function Baris({ j, nama, bisaUbah, dipakai }: { j?: JalurAdmin; nama?: string; bisaUbah: boolean; dipakai: string[] }) {
  const [f, setF] = useState({
    nama: j?.nama ?? nama ?? NAMA.find((n) => !dipakai.includes(n)) ?? "Domisili",
    aktif: j?.aktif ?? true, kuota: j?.kuota?.toString() ?? "", buka: keWib(j?.buka ?? null), tutup: keWib(j?.tutup ?? null),
    syarat: (j?.syarat_berkas ?? []).join("\n"),
  });
  const { pending, galat, tersimpan, jalankan } = useAksi();
  const terkunci = j?.terkunci ?? false;
  const set = (p: Partial<typeof f>) => setF((x) => ({ ...x, ...p }));

  return (
    <form className="space-y-3 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5" onSubmit={(e) => {
      e.preventDefault();
      jalankan(() => simpanJalur({ id: j?.id, nama: f.nama, aktif: f.aktif, kuota: f.kuota, buka: dariWib(f.buka), tutup: dariWib(f.tutup), syarat: f.syarat.split("\n") }),
        () => { if (!j) setF((x) => ({ ...x, syarat: "", kuota: "", buka: "", tutup: "" })); });
    }}>
      <fieldset disabled={!bisaUbah || pending} className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <select className="h-12 rounded-xl border border-neutral-300 bg-white px-3 font-semibold" value={f.nama} onChange={(e) => set({ nama: e.target.value })}>
            {NAMA.filter((n) => n === f.nama || !dipakai.includes(n)).map((n) => <option key={n}>{n}</option>)}
          </select>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="size-5" checked={f.aktif} onChange={(e) => set({ aktif: e.target.checked })} />Aktif</label>
        </div>
        {terkunci && <p className="rounded-2xl bg-[var(--kuning-muda)] p-2 text-sm text-amber-900">Sudah dibuka atau punya pendaftar: kuota dan periode terkunci. Nama dan syarat berkas masih bisa diubah.</p>}
        <Kolom label="Kuota (kosongkan bila tanpa batas)"><input className={input} inputMode="numeric" disabled={terkunci} value={f.kuota} onChange={(e) => set({ kuota: e.target.value.replace(/\D/g, "") })} /></Kolom>
        <div className="grid grid-cols-2 gap-2">
          <Kolom label="Buka (WIB)"><input type="datetime-local" className={input} disabled={terkunci} value={f.buka} onChange={(e) => set({ buka: e.target.value })} /></Kolom>
          <Kolom label="Tutup (WIB)"><input type="datetime-local" className={input} disabled={terkunci} value={f.tutup} onChange={(e) => set({ tutup: e.target.value })} /></Kolom>
        </div>
        <Kolom label="Syarat berkas (satu per baris)" bantu={<span className="text-neutral-600">Contoh: Kartu Keluarga, Akta Kelahiran. Setelah mengisi formulir, orang tua diminta memotret/mengunggah setiap berkas ini dari HP (JPG/PNG/PDF, maks. 2 MB).</span>}>
          <textarea className="min-h-24 w-full rounded-xl border border-neutral-300 bg-white p-3 outline-none focus:border-[var(--biru)] focus:ring-4 focus:ring-[var(--biru-muda)]" value={f.syarat} onChange={(e) => set({ syarat: e.target.value })} />
        </Kolom>
      </fieldset>
      <Galat>{galat}</Galat>
      {tersimpan && <p className="text-sm font-semibold text-green-700">Tersimpan ✓</p>}
      {bisaUbah && (
        <div className="flex gap-2">
          <button className={tombol} disabled={pending}>{j ? "Simpan jalur" : "Tambah jalur"}</button>
          {j && !terkunci && (
            <button type="button" className="btn btn-pil h-12 border-2 border-neutral-300 bg-white" disabled={pending}
              onClick={() => confirm(`Hapus jalur ${j.nama}?`) && jalankan(() => hapusJalur(j.id))}>Hapus</button>
          )}
        </div>
      )}
    </form>
  );
}

export default function JalurForm({ jalur, bisaUbah }: { jalur: JalurAdmin[]; bisaUbah: boolean }) {
  const dipakai = jalur.map((j) => j.nama);
  return (
    <div className="space-y-3">
      <div className="space-y-1 rounded-2xl bg-[var(--biru-muda)] p-3 text-sm text-[var(--biru-tua)]">
        <p><b>Di sinilah berkas diatur.</b> Setiap jalur punya daftar &ldquo;Syarat berkas&rdquo; yang wajib diunggah orang tua.</p>
        <p>Tidak memakai jalur? Tetap buat satu jalur (mis. Domisili) supaya bisa meminta berkas. Tanpa jalur, formulir hanya berisi isian teks.</p>
      </div>
      {jalur.map((j) => <Baris key={`${j.id}-${j.nama}`} j={j} bisaUbah={bisaUbah} dipakai={dipakai} />)}
      {bisaUbah && dipakai.length < NAMA.length && <Baris key={`baru-${dipakai.length}`} bisaUbah dipakai={dipakai} />}
    </div>
  );
}
