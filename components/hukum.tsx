import Link from "next/link";
import { EMAIL_KONTAK, MASIH_DRAF, TANGGAL_BERLAKU } from "@/lib/hukum";

export function KerangkaHukum({ judul, children }: { judul: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-10">
      <Link href="/" className="text-sm underline">← Beranda</Link>
      <h1 className="mt-4 font-serif text-3xl font-bold">{judul}</h1>
      <p className="mt-1 text-sm text-neutral-600">Berlaku sejak {TANGGAL_BERLAKU}</p>
      {MASIH_DRAF && (
        <p role="note" className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          <b>Draf.</b> Dokumen ini belum ditinjau ahli hukum dan dapat berubah. Bagian bertanda <mark>[DIISI]</mark> menunggu keputusan penyedia.
        </p>
      )}
      <article className="mt-6 space-y-6 leading-relaxed">{children}</article>
      <p className="mt-10 border-t pt-4 text-sm text-neutral-600">
        Pertanyaan: {EMAIL_KONTAK ? <a className="underline" href={`mailto:${EMAIL_KONTAK}`}>{EMAIL_KONTAK}</a> : <mark>[DIISI: email kontak]</mark>}
        {" · "}<Link className="underline" href="/syarat">Syarat dan Ketentuan</Link>{" · "}<Link className="underline" href="/privasi">Kebijakan Privasi</Link>
      </p>
    </main>
  );
}

export const Pasal = ({ no, judul, children }: { no: number; judul: string; children: React.ReactNode }) => (
  <section>
    <h2 className="font-serif text-xl font-bold">{no}. {judul}</h2>
    <div className="mt-2 space-y-2">{children}</div>
  </section>
);

export const Daftar = ({ butir }: { butir: React.ReactNode[] }) => (
  <ul className="list-disc space-y-1 pl-5">{butir.map((b, i) => <li key={i}>{b}</li>)}</ul>
);
