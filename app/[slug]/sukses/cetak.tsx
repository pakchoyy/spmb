"use client";

export default function Cetak() {
  return (
    <button type="button" onClick={() => window.print()} className="h-12 w-full rounded-lg border font-medium print:hidden">
      Unduh bukti (PDF)
    </button>
  );
}
