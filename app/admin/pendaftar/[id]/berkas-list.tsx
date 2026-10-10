"use client";

import { Galat } from "@/components/ui";
import { useAksi } from "@/components/aksi";
import { tautBerkas } from "../actions";

type Berkas = { id: string; jenis: string; ukuran: number };

export default function BerkasList({ syarat, berkas }: { syarat: string[]; berkas: Berkas[] }) {
  const aksi = useAksi();
  const jenis = [...new Set([...syarat, ...berkas.map((b) => b.jenis)])];
  async function buka(id: string) {
    // jendela dibuka dulu (gestur klik) supaya tidak diblokir popup blocker
    const w = window.open("", "_blank");
    aksi.jalankan(async () => {
      const r = await tautBerkas(id);
      if (r.ok && w) { w.location.href = r.url; return { ok: true }; }
      w?.close();
      return r.ok ? { ok: false, pesan: "Izinkan jendela baru untuk membuka berkas." } : r;
    });
  }
  return (
    <div className="space-y-2">
      {jenis.length === 0 && <p className="text-sm text-neutral-600">Jalur ini tidak meminta berkas.</p>}
      {jenis.map((j) => {
        const b = berkas.find((x) => x.jenis === j);
        return (
          <div key={j} className="flex items-center justify-between gap-3 rounded-lg border bg-white p-3">
            <div><p className="font-medium">{j}</p><p className="text-sm text-neutral-600">{b ? `${Math.round(b.ukuran / 1024)} KB` : "Belum diunggah"}</p></div>
            {b && <button className="h-10 rounded-lg border px-4 text-sm font-semibold" disabled={aksi.pending} onClick={() => buka(b.id)}>Buka</button>}
          </div>
        );
      })}
      <Galat>{aksi.galat}</Galat>
    </div>
  );
}
