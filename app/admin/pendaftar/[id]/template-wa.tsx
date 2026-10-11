"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { TEMPLATE_WA, type DataTemplate } from "@/lib/template-wa";

export default function TemplateWa({ wa, data, awal }: { wa: string; data: DataTemplate; awal: string }) {
  const [pilih, setPilih] = useState(awal);
  const [teks, setTeks] = useState(() => TEMPLATE_WA.find((t) => t.id === awal)!.teks(data));
  const ganti = (id: string) => { setPilih(id); setTeks(TEMPLATE_WA.find((t) => t.id === id)!.teks(data)); };

  return (
    <div className="space-y-3">
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {TEMPLATE_WA.map((t) => (
          <button key={t.id} type="button" aria-pressed={pilih === t.id} onClick={() => ganti(t.id)}
            className={`btn btn-pil shrink-0 whitespace-nowrap ${pilih === t.id ? "bg-[var(--biru)] text-white" : "btn-lembut"}`}>{t.label}</button>
        ))}
      </div>
      <textarea className="min-h-44 w-full rounded-2xl border border-neutral-300 bg-white p-3 text-sm" value={teks} onChange={(e) => setTeks(e.target.value)} aria-label="Isi pesan" />
      <a className="btn btn-wa w-full" href={`${wa}?text=${encodeURIComponent(teks)}`} target="_blank" rel="noopener noreferrer">
        <MessageCircle className="size-5" aria-hidden />Kirim lewat WhatsApp
      </a>
    </div>
  );
}
