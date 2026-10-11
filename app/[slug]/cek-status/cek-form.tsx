"use client";

import { useState, useTransition } from "react";
import { cekStatus, type Status } from "./actions";
import Unggah from "../daftar/unggah";
import { BadgeCheck, Clock, Hourglass, PartyPopper, Printer, Search, XCircle } from "lucide-react";
import TeksBesar from "@/components/teks-besar";
import Konfeti from "@/components/konfeti";

// Warna, ikon, dan langkah berikutnya per status, dengan bahasa untuk orang tua.
const INFO = {
  Baru: { ikon: Clock, latar: "var(--biru-muda)", warna: "var(--biru-tua)", judul: "Sedang diperiksa", saran: "Sekolah sedang memeriksa data dan berkas. Pastikan semua berkas sudah diunggah." },
  Diterima: { ikon: BadgeCheck, latar: "var(--mint-muda)", warna: "#0b6b52", judul: "Diterima", saran: "Selamat! Ikuti arahan sekolah untuk daftar ulang. Simpan nomor pendaftaran Anda." },
  Cadangan: { ikon: Hourglass, latar: "var(--kuning-muda)", warna: "#8a5a00", judul: "Cadangan", saran: "Anak Anda masuk daftar tunggu. Sekolah akan menghubungi bila ada kursi kosong." },
  Ditolak: { ikon: XCircle, latar: "var(--oranye-muda)", warna: "#a2401a", judul: "Belum diterima", saran: "Baca catatan sekolah di bawah. Hubungi sekolah lewat WhatsApp bila ada pertanyaan." },
} as const;

export default function CekForm({ slug, nama, format, bisaUnggah }: { slug: string; nama: string; format: string[]; bisaUnggah: boolean }) {
  const [nomor, setNomor] = useState("");
  const [tgl, setTgl] = useState("");
  const [hasil, setHasil] = useState<Status | null>(null);
  const [galat, setGalat] = useState("");
  const [pending, start] = useTransition();
  const input = "h-12 w-full rounded-xl border border-neutral-300 bg-white px-3 text-base outline-none focus:border-[var(--biru)] focus:ring-4 focus:ring-[var(--biru-muda)]";

  function cari(e: React.FormEvent) {
    e.preventDefault();
    setGalat(""); setHasil(null);
    start(async () => {
      try {
        const r = await cekStatus(slug, nomor, tgl);
        if (r) setHasil(r); else setGalat("Nomor pendaftaran atau tanggal lahir tidak cocok.");
      } catch { setGalat("Koneksi terputus. Coba lagi."); }
    });
  }

  const info = hasil ? INFO[hasil.status as keyof typeof INFO] ?? INFO.Baru : null;
  return (
    <main className="mx-auto max-w-md space-y-4 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-neutral-600">{nama}</p>
        <TeksBesar className="!bg-[var(--biru-muda)] !text-[var(--biru)]" />
      </div>
      <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
        <h1 className="flex items-center gap-2 font-serif text-2xl font-bold"><Search className="size-6 text-[var(--biru)]" aria-hidden />Cek status pendaftaran</h1>
        <form onSubmit={cari} className="mt-4 space-y-3">
          <label className="block"><span className="mb-1 block text-sm font-semibold">Nomor pendaftaran</span>
            <input className={`${input} font-mono uppercase`} placeholder="Contoh: 26-A1B2C3" value={nomor} onChange={(e) => setNomor(e.target.value)} autoCapitalize="characters" autoComplete="off" /></label>
          <label className="block"><span className="mb-1 block text-sm font-semibold">Tanggal lahir anak</span>
            <input type="date" className={input} value={tgl} onChange={(e) => setTgl(e.target.value)} /></label>
          <button disabled={pending} className="btn btn-utama w-full">{pending ? "Memeriksa…" : "Cek status"}</button>
        </form>
        {galat && <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-800">{galat}</p>}
      </div>
      {hasil?.status === "Diterima" && (<>
        <Konfeti />
        <section className="muncul overflow-hidden rounded-3xl bg-white text-center shadow-lg ring-4 ring-[var(--mint)]">
          <div className="bg-[var(--mint)] px-5 py-6 text-white">
            <PartyPopper className="mx-auto size-12" aria-hidden />
            <p className="mt-2 font-serif text-3xl font-bold">Selamat!</p>
            <p className="mt-1 text-white/90">{hasil.nama_anak} diterima di</p>
            <p className="text-lg font-bold">{nama}</p>
          </div>
          <div className="space-y-1 p-5">
            <p className="text-sm text-neutral-600">Nomor pendaftaran</p>
            <p className="font-mono text-2xl font-bold tracking-wider">{hasil.nomor}</p>
            <button type="button" onClick={() => window.print()} className="btn btn-pil btn-lembut mt-3 print:hidden"><Printer className="size-4" aria-hidden />Simpan / cetak bukti</button>
          </div>
        </section>
      </>)}
      {hasil && info && (
        <section className="muncul space-y-3 rounded-3xl p-5 print:hidden" style={{ background: info.latar }}>
          <p className="text-sm font-semibold text-neutral-700">{hasil.nomor} · {hasil.nama_anak}</p>
          <p className="flex items-center gap-2 font-serif text-2xl font-bold" style={{ color: info.warna }}><info.ikon className="size-7" aria-hidden />{info.judul}</p>
          <p>{info.saran}</p>
          {hasil.catatan && <p className="rounded-2xl bg-white/70 p-3 text-sm"><b>Catatan sekolah:</b> {hasil.catatan}</p>}
          {bisaUnggah && hasil.syarat_berkas.length > 0 && hasil.status === "Baru" && (<>
            <h2 className="pt-2 font-bold">Berkas</h2>
            <Unggah slug={slug} nomor={hasil.nomor} tglLahir={tgl} syarat={hasil.syarat_berkas} sudah={hasil.berkas} format={format} />
          </>)}
        </section>
      )}
    </main>
  );
}
