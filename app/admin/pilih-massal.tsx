"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Galat } from "@/components/ui";
import { useAksi } from "@/components/aksi";
import { STATUS, WARNA_STATUS } from "@/lib/pendaftar";
import { ubahStatusMassal } from "./pendaftar/actions";

/**
 * Bar bawah untuk mode "Pilih banyak". Kotak centang di daftar pendaftar memakai atribut form="massal",
 * jadi daftar tetap dirender di server.
 */
export default function PilihMassal({ batal }: { batal: string }) {
  const router = useRouter();
  const [n, setN] = useState(0);
  const [status, setStatus] = useState("Diterima");
  const [catatan, setCatatan] = useState("");
  const { pending, galat, jalankan } = useAksi();

  useEffect(() => {
    const hitung = () => setN(document.querySelectorAll('input[form="massal"]:checked').length);
    hitung();
    document.addEventListener("change", hitung);
    return () => document.removeEventListener("change", hitung);
  }, []);

  const semua = (cek: boolean) => {
    document.querySelectorAll<HTMLInputElement>('input[form="massal"]').forEach((i) => { i.checked = cek; });
    setN(cek ? document.querySelectorAll('input[form="massal"]').length : 0);
  };
  const perluCatatan = status === "Ditolak" || status === "Cadangan";

  return (
    <form id="massal" className="fixed inset-x-0 bottom-16 z-30 lg:bottom-0 lg:left-60 border-t bg-white/95 p-3 shadow-[0_-8px_24px_-12px_rgb(0_0_0/.25)] backdrop-blur print:hidden"
      onSubmit={(e) => {
        e.preventDefault();
        const ids = new FormData(e.currentTarget).getAll("id").map(String);
        if (!confirm(`Tetapkan ${ids.length} pendaftar menjadi ${status}?`)) return;
        jalankan(() => ubahStatusMassal(ids, status, catatan), () => { semua(false); setCatatan(""); router.refresh(); });
      }}>
      <div className="mx-auto max-w-2xl space-y-2">
        <div className="flex items-center justify-between gap-2 text-sm">
          <b>{n} dipilih</b>
          <span className="flex gap-3">
            <button type="button" className="tautan" onClick={() => semua(true)}>Pilih semua</button>
            <a className="tautan" href={batal}>Selesai</a>
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {STATUS.map((x) => (
            <button key={x} type="button" aria-pressed={status === x} onClick={() => setStatus(x)}
              className={`h-10 rounded-xl border-2 text-sm font-semibold ${status === x ? `${WARNA_STATUS[x]} border-current` : "border-neutral-200 bg-white"}`}>{x}</button>
          ))}
        </div>
        {perluCatatan && <input className="h-11 w-full rounded-xl border border-neutral-300 px-3" maxLength={500} placeholder="Catatan alasan (wajib, terlihat orang tua)" value={catatan} onChange={(e) => setCatatan(e.target.value)} />}
        <Galat>{galat}</Galat>
        <button className="btn btn-utama w-full" disabled={pending || n === 0}>{pending ? "Menyimpan…" : `Tetapkan ${status} untuk ${n} pendaftar`}</button>
      </div>
    </form>
  );
}
