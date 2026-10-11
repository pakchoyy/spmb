import Image from "next/image";
import { Quote, Star } from "lucide-react";
import { urlAset } from "@/lib/berkas";

export type TestimoniPublik = { nama: string; jabatan: string | null; rating: number; isi: string; sekolah: string; logo_path: string | null };

const WARNA = [
  { latar: "var(--biru-muda)", aksen: "var(--biru)" },
  { latar: "var(--mint-muda)", aksen: "var(--mint)" },
  { latar: "var(--kuning-muda)", aksen: "#b7780a" },
  { latar: "var(--ungu-muda)", aksen: "var(--ungu)" },
];

export const Bintang = ({ n, ukuran = "size-4" }: { n: number; ukuran?: string }) => (
  <span className="flex gap-0.5" aria-label={`${n} dari 5 bintang`}>
    {[1, 2, 3, 4, 5].map((i) => <Star key={i} className={`${ukuran} ${i <= n ? "fill-[var(--kuning)] text-[var(--kuning)]" : "text-neutral-300"}`} aria-hidden />)}
  </span>
);

/** Testimoni sekolah pengguna; tidak tampil sama sekali bila belum ada. */
export function Testimoni({ daftar }: { daftar: TestimoniPublik[] }) {
  if (!daftar.length) return null;
  return (
    <section className="px-5 py-10" aria-labelledby="judul-testimoni">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-wide text-[var(--biru)]">Testimoni</p>
          <h2 id="judul-testimoni" className="mt-1 font-serif text-3xl font-bold">Kata sekolah pengguna</h2>
        </div>
        <ul className="-mx-5 mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
          {daftar.map((t, i) => {
            const w = WARNA[i % WARNA.length];
            const logo = urlAset(t.logo_path);
            return (
              <li key={`${t.sekolah}-${i}`} className="flex w-[85%] shrink-0 snap-center flex-col rounded-3xl p-5 sm:w-auto" style={{ background: w.latar }}>
                <div className="flex items-center justify-between">
                  <Bintang n={t.rating} />
                  <Quote className="size-6 opacity-40" style={{ color: w.aksen }} aria-hidden />
                </div>
                <blockquote className="mt-3 flex-1 text-neutral-800">&ldquo;{t.isi}&rdquo;</blockquote>
                <div className="mt-4 flex items-center gap-3">
                  {logo
                    ? <Image src={logo} alt="" width={40} height={40} className="size-10 rounded-xl bg-white object-contain p-1" />
                    : <span className="grid size-10 place-items-center rounded-xl bg-white font-bold" style={{ color: w.aksen }}>{t.sekolah[0]}</span>}
                  <div className="min-w-0 text-sm">
                    <p className="truncate font-bold">{t.nama}{t.jabatan && <span className="font-normal text-neutral-600"> · {t.jabatan}</span>}</p>
                    <p className="truncate text-neutral-600">{t.sekolah}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
