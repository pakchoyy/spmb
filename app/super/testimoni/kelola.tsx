"use client";

import { useState } from "react";
import { Eye, EyeOff, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { Galat, Kolom, input } from "@/components/ui";
import { useAksi } from "@/components/aksi";
import { Bintang } from "@/components/testimoni";
import { hapusTestimoni, setTampilTestimoni, tambahTestimoni, ubahTestimoni, type TestimoniIsi } from "../actions";

export type BarisTestimoni = {
  id: string; nama: string; jabatan: string; rating: number; isi: string; tampil: boolean;
  sekolah: string; slug: string | null; manual: boolean; tanggal: string;
};

function Editor({ awal, manual, onSimpan, onBatal }: { awal: TestimoniIsi; manual: boolean; onSimpan: (f: TestimoniIsi) => Promise<{ ok: true } | { ok: false; pesan: string }>; onBatal?: () => void }) {
  const [f, setF] = useState(awal);
  const { pending, galat, jalankan } = useAksi();
  return (
    <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); jalankan(() => onSimpan(f), () => { if (!onBatal) setF({ nama: "", jabatan: "", rating: 0, isi: "", namaSekolah: "" }); onBatal?.(); }); }}>
      {manual && <Kolom label="Nama sekolah"><input className={input} value={f.namaSekolah} onChange={(e) => setF({ ...f, namaSekolah: e.target.value })} /></Kolom>}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" aria-label={`${n} bintang`} onClick={() => setF({ ...f, rating: n })} className="grid size-10 place-items-center rounded-xl bg-neutral-50">
            <Star className={`size-5 ${n <= f.rating ? "fill-[var(--kuning)] text-[var(--kuning)]" : "text-neutral-300"}`} aria-hidden />
          </button>
        ))}
      </div>
      <textarea className="min-h-20 w-full rounded-xl border border-neutral-300 p-3" maxLength={300} placeholder="Isi testimoni" value={f.isi} onChange={(e) => setF({ ...f, isi: e.target.value })} />
      <div className="grid grid-cols-2 gap-2">
        <input className={input} placeholder="Nama penulis" value={f.nama} onChange={(e) => setF({ ...f, nama: e.target.value })} />
        <input className={input} placeholder="Jabatan" value={f.jabatan} onChange={(e) => setF({ ...f, jabatan: e.target.value })} />
      </div>
      <Galat>{galat}</Galat>
      <div className="flex gap-2">
        <button className="btn btn-utama flex-1" disabled={pending || !f.rating}>{pending ? "Menyimpan…" : "Simpan"}</button>
        {onBatal && <button type="button" className="btn btn-pil h-12 border-2 border-neutral-300 bg-white" onClick={onBatal}>Batal</button>}
      </div>
    </form>
  );
}

export default function KelolaTestimoni({ daftar }: { daftar: BarisTestimoni[] }) {
  const [edit, setEdit] = useState<string | null>(null);
  const [tambah, setTambah] = useState(false);
  const aksi = useAksi();
  return (
    <div className="space-y-3">
      {tambah ? (
        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <h2 className="mb-3 font-bold">Tambah testimoni</h2>
          <p className="mb-3 text-sm text-neutral-600">Hanya dari sekolah yang sudah memberi izin, misalnya lewat WhatsApp.</p>
          <Editor awal={{ nama: "", jabatan: "", rating: 0, isi: "", namaSekolah: "" }} manual onSimpan={tambahTestimoni} onBatal={() => setTambah(false)} />
        </section>
      ) : (
        <button className="btn btn-lembut w-full" onClick={() => setTambah(true)}><Plus className="size-5" aria-hidden />Tambah testimoni</button>
      )}

      {daftar.length === 0 && <p className="rounded-3xl bg-white p-5 text-center text-sm text-neutral-600 shadow-sm ring-1 ring-black/5">Belum ada testimoni.</p>}

      <ul className="space-y-3">
        {daftar.map((t) => (
          <li key={t.id} className={`rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 ${t.tampil ? "" : "opacity-60"}`}>
            {edit === t.id ? (
              <Editor awal={{ nama: t.nama, jabatan: t.jabatan, rating: t.rating, isi: t.isi, namaSekolah: t.manual ? t.sekolah : "" }} manual={t.manual}
                onSimpan={(f) => ubahTestimoni(t.id, f)} onBatal={() => setEdit(null)} />
            ) : (<>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-bold">{t.sekolah}</p>
                  <p className="text-xs text-neutral-500">{t.manual ? "Ditambahkan pemilik" : "Dari admin sekolah"} · {t.tanggal}{!t.tampil && " · disembunyikan"}</p>
                </div>
                <Bintang n={t.rating} />
              </div>
              <p className="mt-2">&ldquo;{t.isi}&rdquo;</p>
              <p className="mt-1 text-sm text-neutral-600">{t.nama}{t.jabatan && ` · ${t.jabatan}`}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button className="btn btn-pil btn-lembut" onClick={() => setEdit(t.id)}><Pencil className="size-4" aria-hidden />Ubah</button>
                <button className="btn btn-pil border-2 border-neutral-300 bg-white" disabled={aksi.pending} onClick={() => aksi.jalankan(() => setTampilTestimoni(t.id, !t.tampil))}>
                  {t.tampil ? <><EyeOff className="size-4" aria-hidden />Sembunyikan</> : <><Eye className="size-4" aria-hidden />Tampilkan</>}
                </button>
                <button className="btn btn-pil bg-red-50 text-red-700" disabled={aksi.pending}
                  onClick={() => confirm(`Hapus testimoni dari ${t.sekolah}?`) && aksi.jalankan(() => hapusTestimoni(t.id))}><Trash2 className="size-4" aria-hidden />Hapus</button>
              </div>
            </>)}
          </li>
        ))}
      </ul>
      <Galat>{aksi.galat}</Galat>
    </div>
  );
}
