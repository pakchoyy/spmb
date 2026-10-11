"use client";

import { useState } from "react";
import { Galat, input } from "@/components/ui";
import { useAksi } from "@/components/aksi";
import { catatPencairan } from "../../actions";

export default function Pencairan({ id, saldo }: { id: string; saldo: number }) {
  const [n, setN] = useState(String(saldo));
  const a = useAksi();
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input className={input} inputMode="numeric" value={n} onChange={(e) => setN(e.target.value.replace(/\D/g, ""))} aria-label="Jumlah dicairkan" />
        <button className="btn btn-utama shrink-0" disabled={a.pending} onClick={() => confirm(`Catat pencairan Rp${Number(n).toLocaleString("id-ID")}?`) && a.jalankan(() => catatPencairan(id, Number(n)))}>Catat dibayar</button>
      </div>
      <Galat>{a.galat}</Galat>
    </div>
  );
}
