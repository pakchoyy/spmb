"use client";

import { useEffect, useState } from "react";
import { MessageSquareHeart, Star, X } from "lucide-react";
import { Galat, input } from "@/components/ui";
import { useAksi } from "@/components/aksi";
import { simpanTestimoni } from "./testimoni-actions";

type Awal = { nama: string; jabatan: string | null; rating: number; isi: string } | null;
const KUNCI = "yukmasuk:testimoni-tutup";

/** Kartu testimoni di beranda admin. Bisa ditutup; tetap bisa diubah setelah dikirim. */
export default function TestimoniForm({ awal }: { awal: Awal }) {
  const [tutup, setTutup] = useState(true); // mulai tertutup sampai pilihan di HP terbaca
  const [buka, setBuka] = useState(!awal);
  const [f, setF] = useState({ nama: awal?.nama ?? "", jabatan: awal?.jabatan ?? "", rating: awal?.rating ?? 0, isi: awal?.isi ?? "" });
  const { pending, galat, tersimpan, jalankan } = useAksi();

  useEffect(() => {
    let t = false;
    try { t = localStorage.getItem(KUNCI) === "1"; } catch {}
    setTutup(t && !awal); // eslint-disable-line react-hooks/set-state-in-effect -- membaca pilihan tersimpan di klien
  }, [awal]);

  if (tutup) return null;
  const sembunyikan = () => { try { localStorage.setItem(KUNCI, "1"); } catch {} setTutup(true); };

  if (awal && !buka) {
    return (
      <section className="flex items-center justify-between gap-3 rounded-3xl bg-[var(--ungu-muda)] p-4 print:hidden">
        <p className="text-sm"><b>Terima kasih atas testimoninya!</b> Sudah tampil di beranda SPMB Zone</p>
        <button className="btn btn-pil bg-white text-[var(--ungu)]" onClick={() => setBuka(true)}>Ubah</button>
      </section>
    );
  }

  return (
    <section className="rounded-3xl bg-[var(--ungu-muda)] p-5 print:hidden">
      <div className="flex items-start justify-between gap-2">
        <h2 className="flex items-center gap-2 font-bold"><MessageSquareHeart className="size-5 text-[var(--ungu)]" aria-hidden />Bagaimana pengalaman memakai SPMB Zone?</h2>
        {!awal && <button onClick={sembunyikan} aria-label="Tutup" className="grid size-8 shrink-0 place-items-center rounded-full bg-white/70"><X className="size-4" aria-hidden /></button>}
      </div>
      <p className="mt-1 text-sm text-neutral-700">Testimoni Anda tampil di beranda dan membantu sekolah lain.</p>
      <form className="mt-4 space-y-3" onSubmit={(e) => { e.preventDefault(); jalankan(() => simpanTestimoni(f), () => setBuka(false)); }}>
        <div className="flex gap-1" role="radiogroup" aria-label="Penilaian">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" role="radio" aria-checked={f.rating === n} aria-label={`${n} bintang`} onClick={() => setF({ ...f, rating: n })}
              className="grid size-11 place-items-center rounded-xl bg-white">
              <Star className={`size-6 ${n <= f.rating ? "fill-[var(--kuning)] text-[var(--kuning)]" : "text-neutral-300"}`} aria-hidden />
            </button>
          ))}
        </div>
        <textarea className="min-h-24 w-full rounded-xl border border-neutral-300 bg-white p-3 outline-none focus:border-[var(--ungu)]" maxLength={300}
          placeholder="Contoh: Pendaftaran tahun ini jauh lebih rapi, orang tua cukup daftar dari HP." value={f.isi} onChange={(e) => setF({ ...f, isi: e.target.value })} />
        <div className="grid grid-cols-2 gap-2">
          <input className={input} placeholder="Nama Anda" maxLength={80} value={f.nama} onChange={(e) => setF({ ...f, nama: e.target.value })} />
          <input className={input} placeholder="Jabatan (mis. Operator)" maxLength={60} value={f.jabatan} onChange={(e) => setF({ ...f, jabatan: e.target.value })} />
        </div>
        <Galat>{galat}</Galat>
        {tersimpan && <p className="text-sm font-semibold text-[#0b6b52]">Terima kasih! Testimoni sudah tampil.</p>}
        <button className="btn w-full bg-[var(--ungu)] text-white" disabled={pending || !f.rating}>{pending ? "Mengirim…" : awal ? "Simpan perubahan" : "Kirim testimoni"}</button>
      </form>
    </section>
  );
}
