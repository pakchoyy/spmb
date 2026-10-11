import type { LucideIcon } from "lucide-react";
import { Logo } from "./logo";

export const input = "h-12 w-full rounded-xl border border-neutral-300 bg-white px-3 text-base outline-none transition focus:border-[var(--biru)] focus:ring-4 focus:ring-[var(--biru-muda)]";
export const tombol = "btn btn-utama w-full";

export function Kolom({ label, bantu, children }: { label: string; bantu?: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold">{label}</span>
      {children}
      {bantu && <span className="mt-1 block text-sm">{bantu}</span>}
    </label>
  );
}

export const Galat = ({ children }: { children?: React.ReactNode }) =>
  children ? <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{children}</p> : null;

/** Kerangka halaman form singkat (masuk, daftar, aktivasi): kartu dengan pita berwarna dan ikon. */
export const Halaman = ({ judul, sub, ikon: Ikon, children }: { judul: string; sub?: string; ikon?: LucideIcon; children: React.ReactNode }) => (
  <main className="mx-auto w-full max-w-md px-4 py-6">
    <div className="mb-4 flex justify-center"><Logo /></div>
    <div className="muncul overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5">
      <div className="relative overflow-hidden bg-[var(--biru)] px-6 pb-6 pt-7 text-white">
        <div aria-hidden className="absolute -right-6 -top-6 size-28 rounded-full bg-white/10" />
        <div aria-hidden className="absolute -bottom-10 right-10 size-20 rounded-full bg-[var(--kuning)]/30" />
        {Ikon && <span className="mb-3 grid size-11 place-items-center rounded-2xl bg-white/15"><Ikon className="size-6" aria-hidden /></span>}
        <h1 className="font-serif text-2xl font-bold leading-tight">{judul}</h1>
        {sub && <p className="mt-1 text-white/85">{sub}</p>}
      </div>
      <div className="space-y-4 p-6">{children}</div>
    </div>
  </main>
);
