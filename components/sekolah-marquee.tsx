import Image from "next/image";
import Link from "next/link";
import { urlAset } from "@/lib/berkas";

export type SekolahPengguna = { slug: string; nama: string; logo_path: string | null };

/** Deretan sekolah pengguna yang bergerak dari kanan ke kiri. Disembunyikan bila kurang dari 3 sekolah. */
export function SekolahMarquee({ sekolah }: { sekolah: SekolahPengguna[] }) {
  if (sekolah.length < 3) return null;
  const isi = [...sekolah, ...sekolah]; // digandakan agar putaran mulus
  return (
    <section className="py-8" aria-label="Sekolah yang memakai Yuk Masuk!">
      <p className="px-5 text-center text-sm font-semibold text-neutral-600">Sudah dipakai {sekolah.length} sekolah</p>
      <div className="marquee mt-4 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
        <ul className="marquee-isi gap-3" style={{ "--durasi": `${Math.max(20, sekolah.length * 4)}s` } as React.CSSProperties}>
          {isi.map((s, i) => {
            const logo = urlAset(s.logo_path);
            return (
              <li key={`${s.slug}-${i}`} aria-hidden={i >= sekolah.length}>
                <Link href={`/${s.slug}`} tabIndex={i >= sekolah.length ? -1 : undefined}
                  className="flex h-14 items-center gap-2 whitespace-nowrap rounded-2xl bg-white px-4 shadow-sm ring-1 ring-black/5">
                  {logo
                    ? <Image src={logo} alt="" width={32} height={32} className="size-8 rounded-lg object-contain" />
                    : <span className="grid size-8 place-items-center rounded-lg bg-[var(--biru-muda)] font-bold text-[var(--biru)]">{s.nama[0]}</span>}
                  <span className="text-sm font-semibold">{s.nama}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
