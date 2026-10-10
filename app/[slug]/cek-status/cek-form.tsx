"use client";

import { useState, useTransition } from "react";
import { cekStatus, type Status } from "./actions";
import Unggah from "../daftar/unggah";

export default function CekForm({ slug, nama, format, bisaUnggah }: { slug: string; nama: string; format: string[]; bisaUnggah: boolean }) {
  const [nomor, setNomor] = useState("");
  const [tgl, setTgl] = useState("");
  const [hasil, setHasil] = useState<Status | null>(null);
  const [galat, setGalat] = useState("");
  const [pending, start] = useTransition();
  const input = "h-12 w-full rounded-lg border px-3 text-base";

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

  return (
    <main className="mx-auto max-w-md space-y-4 p-4">
      <h1 className="text-lg font-semibold">Cek status pendaftaran</h1>
      <p className="text-sm text-neutral-600">{nama}</p>
      <form onSubmit={cari} className="space-y-3">
        <label className="block"><span className="text-sm font-medium">Nomor pendaftaran</span>
          <input className={input} value={nomor} onChange={(e) => setNomor(e.target.value)} autoCapitalize="characters" autoComplete="off" /></label>
        <label className="block"><span className="text-sm font-medium">Tanggal lahir anak</span>
          <input type="date" className={input} value={tgl} onChange={(e) => setTgl(e.target.value)} /></label>
        <button disabled={pending} className="h-12 w-full rounded-lg bg-blue-700 font-medium text-white disabled:opacity-50">{pending ? "Memeriksa…" : "Cek status"}</button>
      </form>
      {galat && <p role="alert" className="text-sm text-red-700">{galat}</p>}
      {hasil && (
        <section className="space-y-3 rounded-xl border p-4">
          <p className="text-sm text-neutral-600">{hasil.nomor} · {hasil.nama_anak}</p>
          <p className="text-2xl font-bold">{hasil.status}</p>
          {hasil.catatan && <p className="text-sm">Catatan panitia: {hasil.catatan}</p>}
          {bisaUnggah && hasil.syarat_berkas.length > 0 && hasil.status === "Baru" && (<>
            <h2 className="pt-2 font-medium">Berkas</h2>
            <Unggah slug={slug} nomor={hasil.nomor} tglLahir={tgl} syarat={hasil.syarat_berkas} sudah={hasil.berkas} format={format} />
          </>)}
        </section>
      )}
    </main>
  );
}
