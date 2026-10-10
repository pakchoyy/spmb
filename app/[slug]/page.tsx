import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { notFound, permanentRedirect } from "next/navigation";
import { supabaseAnon } from "@/lib/supabase/anon";
import { urlAset, type SekolahPublik } from "@/lib/berkas";

export const revalidate = 600; // cache 10 menit; dihapus saat admin mengubah profil
export const generateStaticParams = () => []; // aktifkan ISR: halaman dibuat saat pertama dibuka lalu di-cache

type Params = { params: Promise<{ slug: string }> };

const ambil = cache(async (slug: string) => {
  const db = supabaseAnon();
  const { data } = await db.rpc("sekolah_publik", { p_slug: slug });
  if (data) return { sekolah: data as SekolahPublik, baru: null };
  const { data: baru } = await db.rpc("slug_pengalihan", { p_slug: slug });
  return { sekolah: null, baru: (baru as string | null) ?? null };
});

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { sekolah } = await ambil((await params).slug);
  return sekolah
    ? { title: `SPMB ${sekolah.nama}`, description: `Pendaftaran SPMB online ${sekolah.nama}.` }
    : {};
}

// Halaman di-cache 10 menit, jadi status jalur bisa terlambat sampai selama itu.
const kini = () => Date.now();

const fmt = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" }) : null;

// Data dari admin sekolah diperlakukan tidak tepercaya sebelum jadi link.
const waLink = (n: string | null) => {
  const d = (n ?? "").replace(/\D/g, "").replace(/^0/, "62");
  return d.length >= 9 ? `https://wa.me/${d}` : null;
};
const igLink = (h: string | null) => {
  const u = (h ?? "").trim().replace(/^@/, "");
  return /^[A-Za-z0-9._]{1,30}$/.test(u) ? { url: `https://instagram.com/${u}`, nama: `@${u}` } : null;
};
const petaLink = (u: string | null) => (u && /^https:\/\//.test(u) ? u : null);

export default async function HalamanSekolah({ params }: Params) {
  const { slug } = await params;
  const { sekolah: s, baru } = await ambil(slug);
  if (!s) {
    if (baru) permanentRedirect(`/${baru}`);
    notFound();
  }

  const buka = s.status === "trial" || s.status === "aktif";
  const logo = urlAset(s.logo_path), banner = urlAset(s.banner_path);
  const wa = waLink(s.kontak_wa), ig = igLink(s.instagram), peta = petaLink(s.peta_url);
  const berkas = [...new Set(s.jalur.flatMap((j) => j.syarat_berkas))];
  const periode = (j: SekolahPublik["jalur"][number]) =>
    j.buka || j.tutup ? `${fmt(j.buka) ?? "…"} – ${fmt(j.tutup) ?? "…"}` : "Mengikuti jadwal sekolah";
  const jalurBuka = (j: SekolahPublik["jalur"][number]) => {
    const t = kini();
    return (!j.buka || new Date(j.buka).getTime() <= t) && (!j.tutup || new Date(j.tutup).getTime() >= t);
  };

  return (
    <div style={{ "--aksen": s.warna_aksen, "--muda": "color-mix(in srgb, var(--aksen) 8%, white)" } as React.CSSProperties}
      className="mx-auto w-full max-w-2xl pb-28">
      <header className="relative overflow-hidden px-5 pb-8 pt-10 text-white"
        style={{ background: "linear-gradient(160deg, var(--aksen), color-mix(in srgb, var(--aksen) 70%, black))" }}>
        {banner && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={banner} alt="" className="absolute inset-0 size-full object-cover opacity-25" />
        )}
        <div className="relative">
          <div className="grid size-20 place-items-center overflow-hidden bg-white [border-radius:2.5rem_2.5rem_0.75rem_0.75rem]">
            {logo
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={logo} alt={`Logo ${s.nama}`} className="size-full object-contain p-2" />
              : <span className="font-serif text-3xl font-bold" style={{ color: "var(--aksen)" }}>{s.nama[0]}</span>}
          </div>
          <p className="mt-4 text-sm opacity-90">SPMB (dulu PPDB)</p>
          <h1 className="font-serif text-3xl font-bold leading-tight">{s.nama}</h1>
          {s.alamat && <p className="mt-1 text-sm opacity-90">{s.alamat}</p>}
          <p className={`mt-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold ${buka ? "bg-[var(--kuning)] text-black" : "bg-white/20"}`}>
            {buka ? "Pendaftaran BUKA" : "Pendaftaran TUTUP"}
          </p>
        </div>
      </header>

      {s.keunggulan.length > 0 && (
        <section className="bg-white px-5 py-8">
          <h2 className="font-serif text-xl font-bold">Keunggulan sekolah</h2>
          <ul className="mt-4 grid gap-3">
            {s.keunggulan.map((k) => (
              <li key={k} className="flex gap-3 rounded-xl border p-4" style={{ background: "var(--muda)" }}>
                <span aria-hidden className="mt-0.5 font-bold" style={{ color: "var(--aksen)" }}>✓</span>{k}
              </li>
            ))}
          </ul>
        </section>
      )}

      {s.jalur.length > 0 && (
        <section className="px-5 py-8">
          <h2 className="font-serif text-xl font-bold">Jalur dan jadwal</h2>
          <div className="mt-4 grid gap-3">
            {s.jalur.map((j) => (
              <article key={j.id} className="rounded-xl border bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-bold">Jalur {j.nama}</h3>
                  <span className={`rounded-full px-3 py-0.5 text-xs font-bold ${jalurBuka(j) ? "bg-green-100 text-green-800" : "bg-neutral-200 text-neutral-700"}`}>
                    {jalurBuka(j) ? "Dibuka" : "Belum/ditutup"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-neutral-600">{periode(j)}{j.kuota != null && ` · Kuota ${j.kuota}`}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {berkas.length > 0 && (
        <section className="bg-white px-5 py-8">
          <h2 className="font-serif text-xl font-bold">Siapkan berkas ini</h2>
          <p className="mt-1 text-sm text-neutral-600">Foto atau scan, maksimal 2 MB per berkas.</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {berkas.map((b) => <li key={b} className="rounded-full border px-3 py-1 text-sm" style={{ background: "var(--muda)" }}>{b}</li>)}
          </ul>
        </section>
      )}

      {s.galeri.length > 0 && (
        <section className="px-5 py-8">
          <h2 className="font-serif text-xl font-bold">Galeri</h2>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {s.galeri.map((g) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={g} src={urlAset(g)!} alt="" loading="lazy" decoding="async" className="aspect-[4/3] w-full rounded-xl object-cover" />
            ))}
          </div>
        </section>
      )}

      <section className="bg-white px-5 py-8">
        <h2 className="font-serif text-xl font-bold">Hubungi panitia</h2>
        <div className="mt-4 grid gap-2">
          {wa && <a className="flex h-12 items-center justify-center rounded-lg border font-medium" href={wa} rel="noopener">WhatsApp panitia</a>}
          {peta && <a className="flex h-12 items-center justify-center rounded-lg border font-medium" href={peta} rel="noopener noreferrer">Lihat peta</a>}
          {ig && <a className="flex h-12 items-center justify-center rounded-lg border font-medium" href={ig.url} rel="noopener noreferrer">Instagram {ig.nama}</a>}
          <Link className="flex h-12 items-center justify-center rounded-lg border font-medium" href={`/${s.slug}/cek-status`}>Cek status pendaftaran</Link>
        </div>
        {process.env.NEXT_PUBLIC_EMAIL_LAPOR && (
          <a className="mt-6 block text-center text-sm text-neutral-500 underline"
            href={`mailto:${process.env.NEXT_PUBLIC_EMAIL_LAPOR}?subject=${encodeURIComponent(`Laporkan halaman /${s.slug}`)}`}>
            Laporkan halaman ini
          </a>
        )}
      </section>

      <div className="fixed inset-x-0 bottom-0 border-t bg-white p-3">
        <div className="mx-auto max-w-2xl">
          {buka
            ? <Link href={`/${s.slug}/daftar`} className="flex h-14 items-center justify-center rounded-xl text-lg font-bold text-white" style={{ background: "var(--aksen)" }}>Daftar sekarang</Link>
            : <p className="flex h-14 items-center justify-center rounded-xl bg-neutral-200 font-bold text-neutral-600">Pendaftaran ditutup</p>}
        </div>
      </div>
    </div>
  );
}
