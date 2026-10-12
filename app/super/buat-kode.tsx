"use client";

import { useState, useTransition } from "react";
import { Copy, KeyRound } from "lucide-react";
import { Galat, input } from "@/components/ui";
import { IkonWa } from "@/components/ikon-merek";
import { buatKodePemilik } from "./actions";

/** Pemilik membuat kode aktivasi (24 jam) untuk email admin; email bisa dikunci (detail sekolah) atau diketik. */
export default function BuatKode({ email: awal = "", kunci = false, wa = null }: { email?: string; kunci?: boolean; wa?: string | null }) {
  const [email, setEmail] = useState(awal);
  const [kode, setKode] = useState<string | null>(null);
  const [galat, setGalat] = useState("");
  const [pending, start] = useTransition();
  const pesan = kode ? `Kode aktivasi SPMB Zone untuk ${email}: ${kode}\nBerlaku 24 jam, sekali pakai. Masuk ke aplikasi → Langganan → masukkan kode.` : "";

  return (
    <section className="space-y-3 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
      <h2 className="flex items-center gap-2 font-bold"><KeyRound className="size-5 text-[var(--biru)]" aria-hidden />Buat kode aktivasi</h2>
      <p className="text-sm text-neutral-600">Untuk pembeli yang kodenya kedaluwarsa atau kesulitan. Kode berlaku 24 jam, sekali pakai, menambah 1 tahun.</p>
      <div className="flex gap-2">
        {!kunci && <input className={input} type="email" placeholder="email admin sekolah" value={email} onChange={(e) => setEmail(e.target.value)} />}
        <button className="btn btn-utama shrink-0" disabled={pending || !email} onClick={() => {
          setGalat("");
          start(async () => { const r = await buatKodePemilik(email); if (r.ok) setKode(r.kode); else setGalat(r.pesan); });
        }}>{pending ? "Membuat…" : kunci ? `Buat kode untuk ${email}` : "Buat kode"}</button>
      </div>
      <Galat>{galat}</Galat>
      {kode && (
        <div className="space-y-2 rounded-2xl bg-[var(--biru-muda)] p-3">
          <p className="text-center font-mono text-2xl font-bold tracking-widest text-[var(--biru-tua)]">{kode}</p>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" className="btn btn-pil bg-white" onClick={() => navigator.clipboard.writeText(pesan).catch(() => {})}><Copy className="size-4" aria-hidden />Salin pesan</button>
            <a className="btn btn-pil btn-wa" target="_blank" rel="noopener noreferrer"
              href={`https://wa.me/${wa ?? ""}?text=${encodeURIComponent(pesan)}`}><IkonWa className="size-4" />Kirim via WA</a>
          </div>
        </div>
      )}
    </section>
  );
}
