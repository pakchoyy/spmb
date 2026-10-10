export const input = "h-12 w-full rounded-lg border border-neutral-300 bg-white px-3 text-base";
export const tombol = "h-12 w-full rounded-lg bg-[var(--biru)] font-bold text-white disabled:opacity-50";

export function Kolom({ label, bantu, children }: { label: string; bantu?: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      {children}
      {bantu && <span className="mt-1 block text-sm">{bantu}</span>}
    </label>
  );
}

export const Galat = ({ children }: { children?: React.ReactNode }) =>
  children ? <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{children}</p> : null;

export const Halaman = ({ judul, sub, children }: { judul: string; sub?: string; children: React.ReactNode }) => (
  <main className="mx-auto w-full max-w-md px-5 py-10">
    <h1 className="font-serif text-3xl font-bold">{judul}</h1>
    {sub && <p className="mt-2 text-neutral-600">{sub}</p>}
    <div className="mt-6 space-y-4">{children}</div>
  </main>
);
