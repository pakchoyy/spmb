"use client";

import { useState } from "react";
import Link from "next/link";
import { Galat, input } from "@/components/ui";
import { useAksi } from "@/components/aksi";
import { arsipkan, hapusArsip } from "./arsip-actions";

export default function ArsipForm({ slug, aktif, arsip, bisaUbah }: { slug: string; aktif: number; arsip: number; bisaUbah: boolean }) {
  const [ket, setKet] = useState("");
  const [info, setInfo] = useState("");
  const a1 = useAksi(), a2 = useAksi();

  return (
    <div className="space-y-4">
      <p className="text-sm text-neutral-600">
        Setelah musim SPMB selesai, arsipkan pendaftar tahun lalu. Data arsip tidak ikut dihitung di dashboard, kuota, dan data ganda, tetapi masih bisa dilihat dan diunduh. Mengarsipkan juga membebaskan pengaturan kuota dan periode jalur untuk tahun baru.
      </p>
      <dl className="grid grid-cols-2 gap-2 text-center">
        <div className="rounded-xl border bg-white p-3"><dt className="text-xs text-neutral-600">Pendaftar aktif</dt><dd className="text-2xl font-bold">{aktif}</dd></div>
        <div className="rounded-xl border bg-white p-3"><dt className="text-xs text-neutral-600">Diarsipkan</dt><dd className="text-2xl font-bold">{arsip}</dd></div>
      </dl>

      {/* unduhan berkas, bukan navigasi halaman */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a className="flex h-12 items-center justify-center rounded-lg border font-semibold" href="/admin/pendaftar/unduh">Unduh data aktif sebelum mengarsipkan (Excel)</a>

      {bisaUbah && (<>
        <div className="grid gap-2">
          <button className="h-12 rounded-lg border-2 border-[var(--biru)] font-semibold text-[var(--biru)] disabled:opacity-50" disabled={a1.pending || aktif === 0}
            onClick={() => confirm(`Arsipkan ${aktif} pendaftar aktif?`) && a1.jalankan(async () => { const r = await arsipkan(true); if (r.ok) setInfo(`${r.jumlah} pendaftar diarsipkan.`); return r; })}>
            Arsipkan semua pendaftar aktif
          </button>
          <button className="h-12 rounded-lg border font-semibold disabled:opacity-50" disabled={a1.pending || arsip === 0}
            onClick={() => a1.jalankan(async () => { const r = await arsipkan(false); if (r.ok) setInfo(`${r.jumlah} pendaftar dipulihkan.`); return r; })}>
            Pulihkan semua arsip
          </button>
          {arsip > 0 && <Link className="text-center text-sm underline" href="/admin?arsip=1">Lihat arsip</Link>}
        </div>
        <Galat>{a1.galat}</Galat>
        {info && <p className="text-sm font-semibold text-green-700">{info}</p>}

        {arsip > 0 && (
          <div className="space-y-3 rounded-xl border-2 border-red-200 bg-red-50 p-4">
            <h3 className="font-bold text-red-900">Hapus permanen data arsip</h3>
            <p className="text-sm text-red-900">Menghapus {arsip} pendaftar arsip beserta semua berkasnya. Tidak bisa dibatalkan. Unduh dulu jika perlu lewat tombol &ldquo;Unduh ke Excel&rdquo; di halaman arsip.</p>
            <label className="block text-sm">Ketik <b>{slug}</b> untuk konfirmasi
              <input className={`${input} mt-1`} value={ket} onChange={(e) => setKet(e.target.value)} autoCapitalize="none" spellCheck={false} />
            </label>
            <button className="h-12 w-full rounded-lg bg-red-700 font-bold text-white disabled:opacity-50" disabled={a2.pending || ket.trim() !== slug}
              onClick={() => a2.jalankan(async () => { const r = await hapusArsip(ket); if (r.ok) { setInfo(`${r.jumlah} data arsip dihapus.`); setKet(""); } return r; })}>
              {a2.pending ? "Menghapus…" : "Hapus permanen"}
            </button>
            <Galat>{a2.galat}</Galat>
          </div>
        )}
      </>)}
    </div>
  );
}
