"use client";

import { useState } from "react";
import { Copy, RefreshCw } from "lucide-react";
import { useAksi } from "@/components/aksi";
import { Galat } from "@/components/ui";
import { gantiTokenAktivasi } from "../actions";

/** Tautan yang ditempel di produk BGY Store sebagai halaman setelah bayar. */
export default function TautanAktivasi({ url }: { url: string }) {
  const [salin, setSalin] = useState(false);
  const a = useAksi();
  return (
    <section className="space-y-3 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
      <h2 className="font-bold">Tautan setelah bayar (untuk BGY Store)</h2>
      <p className="text-sm text-neutral-600">Tempel di produk SPMB Zone di BGY Store sebagai tautan yang diterima pembeli setelah bayar. Pembeli mengisi email admin sekolah → dapat kode sekali pakai yang berlaku 1 jam.</p>
      <code className="block break-all rounded-2xl bg-neutral-50 p-3 text-xs">{url}</code>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" className="btn btn-pil btn-lembut" onClick={async () => { await navigator.clipboard.writeText(url).catch(() => {}); setSalin(true); }}>
          <Copy className="size-4" aria-hidden />{salin ? "Tersalin ✓" : "Salin tautan"}
        </button>
        <button type="button" className="btn btn-pil border-2 border-red-200 bg-white text-red-700" disabled={a.pending}
          onClick={() => confirm("Ganti token? Tautan lama di BGY Store langsung tidak berlaku, jadi perbarui produknya.") && a.jalankan(() => gantiTokenAktivasi())}>
          <RefreshCw className="size-4" aria-hidden />Ganti token
        </button>
      </div>
      <p className="text-xs text-neutral-500">Ganti token bila tautan tersebar. Setiap kode yang dibuat tercatat di Catatan terbaru (kode_dibuat) untuk dicocokkan dengan pesanan.</p>
      <Galat>{a.galat}</Galat>
    </section>
  );
}
