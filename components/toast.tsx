"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, CircleAlert } from "lucide-react";

type Pesan = { id: number; teks: string; galat?: boolean };

/** Tampilkan notifikasi singkat dari mana saja: tampilkanToast("Tersimpan"). */
export function tampilkanToast(teks: string, galat = false) {
  window.dispatchEvent(new CustomEvent("yukmasuk:toast", { detail: { teks, galat } }));
}

export default function Toaster() {
  const [daftar, setDaftar] = useState<Pesan[]>([]);
  useEffect(() => {
    const dengar = (e: Event) => {
      const { teks, galat } = (e as CustomEvent<{ teks: string; galat?: boolean }>).detail;
      const id = Date.now() + Math.random();
      setDaftar((d) => [...d.slice(-2), { id, teks, galat }]);
      setTimeout(() => setDaftar((d) => d.filter((x) => x.id !== id)), 2600);
    };
    window.addEventListener("yukmasuk:toast", dengar);
    return () => window.removeEventListener("yukmasuk:toast", dengar);
  }, []);
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex flex-col items-center gap-2 px-4">
      {daftar.map((p) => (
        <p key={p.id} className={`muncul flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-lg ${p.galat ? "bg-red-700" : "bg-[#14204a]"}`}>
          {p.galat ? <CircleAlert className="size-4" aria-hidden /> : <CheckCircle2 className="size-4 text-[var(--mint)]" aria-hidden />}{p.teks}
        </p>
      ))}
    </div>
  );
}
