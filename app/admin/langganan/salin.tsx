"use client";

import { Copy, Link2 } from "lucide-react";
import { tampilkanToast } from "@/components/toast";

export default function SalinTeks({ teks, label, ikon = false }: { teks: string; label: string; ikon?: boolean }) {
  return (
    <button type="button" className="btn btn-pil btn-lembut shrink-0" onClick={async () => {
      try { await navigator.clipboard.writeText(teks); tampilkanToast("Tersalin"); } catch { tampilkanToast("Gagal menyalin", true); }
    }}>
      {ikon ? <Link2 className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}{label}
    </button>
  );
}
