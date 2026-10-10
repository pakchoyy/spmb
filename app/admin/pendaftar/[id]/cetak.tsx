"use client";

export default function Cetak({ label = "Cetak" }: { label?: string }) {
  return <button type="button" onClick={() => window.print()} className="h-10 rounded-lg border px-4 text-sm font-semibold print:hidden">{label}</button>;
}
