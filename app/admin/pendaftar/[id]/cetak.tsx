"use client";

import { Printer } from "lucide-react";

export default function Cetak({ label = "Cetak" }: { label?: string }) {
  return (
    <button type="button" onClick={() => window.print()} className="btn btn-pil border-2 border-neutral-300 bg-white print:hidden">
      <Printer className="size-4" aria-hidden />{label}
    </button>
  );
}
