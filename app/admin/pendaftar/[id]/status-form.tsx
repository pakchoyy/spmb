"use client";

import { useState } from "react";
import { Galat } from "@/components/ui";
import { useAksi } from "@/components/aksi";
import { STATUS, WARNA_STATUS } from "@/lib/pendaftar";
import { ubahStatus } from "../actions";

export default function StatusForm({ id, status: s0, catatan: c0, bisaUbah }: { id: string; status: string; catatan: string | null; bisaUbah: boolean }) {
  const [status, setStatus] = useState(s0);
  const [catatan, setCatatan] = useState(c0 ?? "");
  const { pending, galat, tersimpan, jalankan } = useAksi();
  const perluCatatan = status === "Ditolak" || status === "Cadangan";

  return (
    <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); jalankan(() => ubahStatus(id, status, catatan)); }}>
      <div className="grid grid-cols-2 gap-2">
        {STATUS.map((x) => (
          <button key={x} type="button" disabled={!bisaUbah || pending} onClick={() => setStatus(x)} aria-pressed={status === x}
            className={`h-12 rounded-2xl border-2 font-semibold disabled:opacity-60 ${status === x ? `${WARNA_STATUS[x]} border-current` : "border-neutral-200 bg-white"}`}>{x}</button>
        ))}
      </div>
      <label className="block">
        <span className="text-sm font-semibold">Catatan alasan{perluCatatan ? " (wajib)" : " (opsional)"}</span>
        <textarea className="min-h-20 w-full rounded-xl border border-neutral-300 bg-white p-3 outline-none focus:border-[var(--biru)] focus:ring-4 focus:ring-[var(--biru-muda)]" maxLength={500} value={catatan} disabled={!bisaUbah || pending}
          placeholder="Catatan ini bisa dilihat orang tua di halaman cek status." onChange={(e) => setCatatan(e.target.value)} />
      </label>
      <Galat>{galat}</Galat>
      {tersimpan && <p className="text-sm font-semibold text-green-700">Tersimpan ✓</p>}
      {bisaUbah && <button className="btn btn-utama w-full" disabled={pending}>{pending ? "Menyimpan…" : "Simpan status"}</button>}
    </form>
  );
}
