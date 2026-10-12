import { IkonIg, IkonWa } from "@/components/ikon-merek";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Award, BadgeCheck, Trophy, CheckCircle2, MapPin, Search, Users } from "lucide-react";
import TeksBesar from "@/components/teks-besar";
import Bagikan from "@/components/bagikan";
import PasangApp from "@/components/pasang-app";
import { WaMelayang } from "@/components/wa-melayang";
import { cache } from "react";
import { notFound, permanentRedirect } from "next/navigation";
import { supabaseAnon } from "@/lib/supabase/anon";
import { urlAset, type Prestasi, type SekolahPublik } from "@/lib/berkas";

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
  if (!sekolah) return {};
  const desk = `Pendaftaran siswa baru (SPMB) ${sekolah.nama} secara online dari HP.${sekolah.alamat ? ` ${sekolah.alamat}.` : ""}`;
  const gambar = urlAset(sekolah.banner_path) ?? urlAset(sekolah.logo_path);
  return {
    title: { absolute: `SPMB ${sekolah.nama}` }, description: desk,
    alternates: { canonical: `/${sekolah.slug}` },
    openGraph: { title: `SPMB ${sekolah.nama}`, description: desk, type: "website", ...(gambar ? { images: [gambar] } : {}) },
  };
}

// Halaman di-cache 10 menit, jadi status jalur bisa terlambat sampai selama itu.
const kini = () => Date.now();

const fmtPendek = (t: string) => new Date(`${t}T00:00:00+07:00`).toLocaleDateString("id-ID", { day: "numeric", month: "short", timeZone: "Asia/Jakarta" });
const hariIni = () => new Date(kini() + 7 * 3600000).toISOString().slice(0, 10); // tanggal WIB

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

/** Nomor langkah bulat di depan judul bagian (alur: jadwal → jalur → berkas). */
const Langkah = ({ n }: { n: number }) => (
  <span className="mr-2 inline-grid size-7 place-items-center rounded-full align-[3px] font-sans text-sm text-white" style={{ background: "var(--aksen)" }}>{n}</span>
);

function KartuPrestasi({ p, salinan = false }: { p: Prestasi; salinan?: boolean }) {
  return (
    <li aria-hidden={salinan || undefined} className="w-60 shrink-0 snap-start overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5">
      {p.foto
        ? <Image src={urlAset(p.foto)!} alt={`Foto ${p.nama}`} width={480} height={360} sizes="240px" className="aspect-[4/3] w-full object-cover" />
        : <div className="grid aspect-[4/3] place-items-center" style={{ background: "var(--muda)" }}><Trophy className="size-12" style={{ color: "var(--aksen)" }} aria-hidden /></div>}
      <div className="p-4">
        <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--aksen)" }}>{p.judul}</p>
        <p className="mt-0.5 font-bold leading-snug">{p.nama}</p>
        {p.ket && <p className="mt-1 text-sm text-neutral-600">{p.ket}</p>}
      </div>
    </li>
  );
}

export default async function HalamanSekolah({ params }: Params) {
  const { slug } = await params;
  const { sekolah: s, baru } = await ambil(slug);
  if (!s) {
    if (baru) permanentRedirect(`/${baru}`);
    notFound();
  }

  const buka = s.status === "trial" || s.status === "aktif";
  const logo = urlAset(s.logo_path), banner = urlAset(s.banner_path);
  const ba = { x: 50, y: 50, z: 100, ...s.banner_atur };
  const wa = waLink(s.kontak_wa), ig = igLink(s.instagram), peta = petaLink(s.peta_url);
  const jadwal = s.jadwal ?? [], prestasi = s.prestasi ?? [];
  const berkas = [...new Set(s.jalur.flatMap((j) => j.syarat_berkas))];
  const periode = (j: SekolahPublik["jalur"][number]) =>
    j.buka || j.tutup ? `${fmt(j.buka) ?? "…"} – ${fmt(j.tutup) ?? "…"}` : "Mengikuti jadwal sekolah";
  // Status per jalur dengan hitung mundur (halaman di-cache maks. 10 menit; cukup untuk hitungan hari).
  const keadaan = (j: SekolahPublik["jalur"][number]) => {
    const t = kini(), b = j.buka ? new Date(j.buka).getTime() : null, c = j.tutup ? new Date(j.tutup).getTime() : null;
    const hari = (ms: number) => Math.max(1, Math.ceil(ms / 86400000));
    if (b && t < b) return { teks: `Dibuka ${hari(b - t)} hari lagi`, gaya: "bg-[var(--biru-muda)] text-[var(--biru-tua)]" };
    if (c && t > c) return { teks: "Sudah ditutup", gaya: "bg-neutral-200 text-neutral-700" };
    if (c) return { teks: hari(c - t) <= 3 ? `Ditutup ${hari(c - t)} hari lagi` : "Dibuka", gaya: hari(c - t) <= 3 ? "bg-[var(--oranye-muda)] text-[#a2401a]" : "bg-[var(--mint-muda)] text-[#0b6b52]" };
    return { teks: "Dibuka", gaya: "bg-[var(--mint-muda)] text-[#0b6b52]" };
  };
  const kartu = "rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5";

  return (
    <div style={{ "--aksen": s.warna_aksen, "--muda": "color-mix(in srgb, var(--aksen) 10%, white)" } as React.CSSProperties}
      className="flex min-h-screen flex-col">
      <header className="relative overflow-hidden px-5 pb-10 pt-5 text-white lg:pb-12 lg:pt-8"
        style={{ background: "linear-gradient(160deg, var(--aksen), color-mix(in srgb, var(--aksen) 65%, black))" }}>
        {banner && <Image src={banner} alt="" fill priority sizes="100vw" className="object-cover opacity-25"
          style={{ objectPosition: `${ba.x}% ${ba.y}%`, transform: `scale(${ba.z / 100})`, transformOrigin: `${ba.x}% ${ba.y}%` }} />}
        <div aria-hidden className="absolute -right-10 -top-10 size-40 rounded-full bg-white/10" />
        <div className="relative mx-auto max-w-2xl lg:max-w-6xl lg:py-2">
          {/* layar lebar: tombol kecil di pojok, identitas sekolah sebaris agar bagian atas tidak makan tempat */}
          <div className="flex justify-end gap-2 lg:absolute lg:right-0 lg:top-0 lg:z-10">
            <TeksBesar />
            <Bagikan judul={`SPMB ${s.nama}`} teks={`Pendaftaran siswa baru ${s.nama} sudah bisa lewat HP:`} className="btn btn-pil bg-white/15 text-white" />
          </div>
          <div className="lg:flex lg:items-center lg:gap-8">
          <div className="mt-4 grid size-28 shrink-0 place-items-center lg:mt-0 overflow-hidden bg-white shadow-lg ring-4 ring-white/30 [border-radius:2.5rem_2.5rem_1rem_1rem]">
            {logo
              ? <Image src={logo} alt={`Logo ${s.nama}`} width={224} height={224} className="size-full object-contain p-1.5" />
              : <span className="font-serif text-3xl font-bold" style={{ color: "var(--aksen)" }}>{s.nama[0]}</span>}
          </div>
          <div className="min-w-0 flex-1 lg:pr-4">
          <p className="mt-4 text-sm font-semibold opacity-90 lg:mt-0">Penerimaan siswa baru (SPMB)</p>
          <h1 className="font-serif text-3xl font-bold leading-tight">
            {s.nama}
            {s.terverifikasi && <BadgeCheck className="ml-1 inline size-6 align-[-0.1em] text-[var(--kuning)]" aria-label="Sekolah terverifikasi" />}
          </h1>
          {s.alamat && <p className="mt-1 flex gap-1 text-sm opacity-90"><MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />{s.alamat}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-2">
          {s.akreditasi && (
            <p className="inline-flex items-center gap-2 rounded-2xl bg-white px-3 py-1.5 text-sm font-bold text-neutral-900 shadow">
              <Award className="size-5" style={{ color: "var(--aksen)" }} aria-hidden />Terakreditasi {s.akreditasi}
            </p>
          )}
          <p className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold ${buka ? "bg-[var(--kuning)] text-black" : "bg-white/20"}`}>
            <span className={`size-2 rounded-full ${buka ? "bg-green-700" : "bg-white/60"}`} aria-hidden />
            {buka ? "Pendaftaran dibuka" : "Pendaftaran ditutup"}
          </p>
          </div>
          </div>
          <div className="lg:w-80 lg:shrink-0 lg:pt-10">
          {(s.jumlah ?? 0) >= 5 && (
            <p className="mt-3 flex items-center gap-2 text-sm font-semibold">
              <Users className="size-4" aria-hidden /><b className="text-base">{s.jumlah!.toLocaleString("id-ID")}</b> calon siswa sudah mendaftar
            </p>
          )}
          <div className="mt-5 grid grid-cols-2 gap-2 sm:max-w-sm lg:max-w-none">
            {buka && <Link href={`/${s.slug}/daftar`} className="btn whitespace-nowrap bg-white font-bold" style={{ color: "var(--aksen)" }}>Daftar sekarang</Link>}
            {wa && <a href={`${wa}?text=${encodeURIComponent(`Halo, saya ingin bertanya tentang SPMB ${s.nama}.`)}`} target="_blank" rel="noopener noreferrer" className="btn btn-wa whitespace-nowrap px-3"><IkonWa className="size-5" aria-hidden />Tanya via WA</a>}
          </div>
          </div>
          </div>
        </div>
      </header>

      <main className="relative mx-auto -mt-5 w-full max-w-2xl flex-1 px-4 pb-10 lg:grid lg:max-w-6xl lg:grid-cols-12 lg:items-start lg:gap-6">
        {/* layar lebar: kiri = kenali sekolah, kanan = cara mendaftar */}
        <div className="min-w-0 space-y-4 lg:col-span-7">
        {s.keunggulan.length > 0 && (
          <section className={kartu}>
            <h2 className="text-center font-serif text-xl font-bold">Keunggulan sekolah</h2>
            <ul className="mt-3 grid gap-2">
              {s.keunggulan.map((k) => (
                <li key={k} className="flex gap-3 rounded-2xl p-3" style={{ background: "var(--muda)" }}>
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0" style={{ color: "var(--aksen)" }} aria-hidden />{k}
                </li>
              ))}
            </ul>
          </section>
        )}

        {prestasi.length > 0 && (
          <section className="py-1">
            <h2 className="flex items-center justify-center gap-2 px-1 font-serif text-xl font-bold"><Trophy className="size-5" style={{ color: "var(--aksen)" }} aria-hidden />Prestasi siswa</h2>
            {s.prestasi_gerak && prestasi.length > 1 ? (
              <div className="marquee -mx-4 mt-3 overflow-hidden pb-2">
                <ul className="marquee-isi gap-3 px-2" style={{ "--durasi": `${Math.max(18, prestasi.length * 7)}s` } as React.CSSProperties}>
                  {[...prestasi, ...prestasi].map((p, i) => (
                    <KartuPrestasi key={i} p={p} salinan={i >= prestasi.length} />
                  ))}
                </ul>
              </div>
            ) : (
              <ul className="-mx-4 mt-3 flex snap-x gap-3 overflow-x-auto px-4 pb-2">
                {prestasi.map((p, i) => <KartuPrestasi key={i} p={p} />)}
              </ul>
            )}
          </section>
        )}

        {s.galeri.length > 0 && (
          <section className={kartu}>
            <h2 className="text-center font-serif text-xl font-bold">Galeri Sekolah</h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {s.galeri.map((g) => (
                <Image key={g} src={urlAset(g)!} alt="" width={400} height={300} sizes="(max-width: 640px) 50vw, 320px" className="aspect-[4/3] w-full rounded-2xl object-cover" />
              ))}
            </div>
          </section>
        )}

        </div>
        <div className="mt-4 min-w-0 space-y-4 lg:col-span-5 lg:mt-0 lg:pt-10">
        {(jadwal.length > 0 || s.jalur.length > 0 || berkas.length > 0) && (
          <div className="px-1 pt-4 text-center lg:pt-0">
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--aksen)" }}>Penerimaan siswa baru</p>
            <h2 className="font-serif text-2xl font-bold">Cara mendaftar</h2>
          </div>
        )}

        {jadwal.length > 0 && (
          <section className={kartu}>
            <h2 className="text-center font-serif text-xl font-bold"><Langkah n={1} />Jadwal SPMB</h2>
            <ol className="mt-4">
              {jadwal.map((j, i) => {
                const t = hariIni(), lewat = (j.selesai ?? j.mulai) < t, berjalan = !lewat && j.mulai <= t;
                return (
                  <li key={i} className="relative flex gap-4 pb-5 last:pb-0">
                    {i < jadwal.length - 1 && <span aria-hidden className="absolute left-[11px] top-6 h-full w-0.5" style={{ background: lewat ? "var(--aksen)" : "#e5e7eb" }} />}
                    <span aria-hidden className="relative z-[1] mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border-2"
                      style={lewat ? { background: "var(--aksen)", borderColor: "var(--aksen)" } : berjalan ? { borderColor: "var(--aksen)", background: "white" } : { borderColor: "#d1d5db", background: "white" }}>
                      {lewat ? <CheckCircle2 className="size-4 text-white" /> : berjalan && <span className="size-2.5 rounded-full" style={{ background: "var(--aksen)" }} />}
                    </span>
                    <div className={lewat ? "opacity-60" : ""}>
                      <p className="font-bold">{j.judul}{berjalan && <span className="ml-2 rounded-full px-2 py-0.5 text-xs font-bold text-white" style={{ background: "var(--aksen)" }}>Sedang berjalan</span>}</p>
                      <p className="text-sm text-neutral-600">{fmtPendek(j.mulai)}{j.selesai && j.selesai !== j.mulai ? ` – ${fmtPendek(j.selesai)}` : ""}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        {s.jalur.length > 0 && (
          <section className={kartu}>
            <h2 className="text-center font-serif text-xl font-bold"><Langkah n={jadwal.length ? 2 : 1} />Pilih jalur pendaftaran</h2>
            <div className="mt-3 grid gap-2">
              {s.jalur.map((j) => {
                const k = keadaan(j);
                return (
                  <article key={j.id} className="rounded-2xl p-4 ring-1 ring-black/5">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-bold">Jalur {j.nama}</h3>
                      <span className={`rounded-full px-3 py-0.5 text-xs font-bold ${k.gaya}`}>{k.teks}</span>
                    </div>
                    <p className="mt-1 text-sm text-neutral-600">{periode(j)}</p>
                    {j.kuota != null && (
                      <p className="mt-1 flex items-center gap-1 text-sm text-neutral-600"><Users className="size-4" aria-hidden />
                        Kuota {j.kuota}{j.sisa != null && <b className="ml-1" style={{ color: "var(--aksen)" }}>· tersisa {j.sisa}</b>}
                      </p>
                    )}
                    {buka && k.teks !== "Sudah ditutup" && !k.teks.startsWith("Dibuka ") && (
                      <Link href={`/${s.slug}/daftar?jalur=${j.id}`} className="btn btn-pil mt-3 text-white" style={{ background: "var(--aksen)" }}>
                        Daftar jalur ini <ArrowRight className="size-4" aria-hidden />
                      </Link>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {berkas.length > 0 && (
          <section className={kartu}>
            <h2 className="text-center font-serif text-xl font-bold"><Langkah n={(jadwal.length ? 1 : 0) + (s.jalur.length ? 1 : 0) + 1} />Siapkan berkas ini</h2>
            <p className="mt-1 text-sm text-neutral-600">Foto langsung dari HP juga boleh, maksimal 2 MB per berkas. Diunggah setelah mengisi formulir.</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {berkas.map((b) => <li key={b} className="rounded-full px-3 py-1 text-sm font-semibold" style={{ background: "var(--muda)" }}>{b}</li>)}
            </ul>
          </section>
        )}

        <section className={kartu}>
          <h2 className="text-center font-serif text-xl font-bold">Ada pertanyaan?</h2>
          <div className="mt-3 grid gap-2">
            {wa && <a className="btn btn-wa" href={wa} rel="noopener"><IkonWa className="size-5" aria-hidden />Chat WhatsApp sekolah</a>}
            <Link className="btn btn-lembut" href={`/${s.slug}/cek-status`}><Search className="size-5" aria-hidden />Cek status pendaftaran</Link>
            <Link href="/cara-pakai#orang-tua" className="flex items-center gap-3 rounded-2xl border-2 border-dashed p-3 transition active:scale-[.98]" style={{ background: "var(--muda)", borderColor: "color-mix(in srgb, var(--aksen) 45%, transparent)" }}>
              <span className="grid size-11 shrink-0 place-items-center rounded-xl text-white" style={{ background: "var(--aksen)" }}><BookOpen className="size-5" aria-hidden /></span>
              <span className="min-w-0 flex-1"><b className="block">Bingung cara daftar?</b><span className="text-sm text-neutral-600">Lihat panduan bergambar langkah demi langkah</span></span>
              <ArrowRight className="size-5 shrink-0" style={{ color: "var(--aksen)" }} aria-hidden />
            </Link>
            <div className="grid grid-cols-2 gap-2">
              {peta && <a className="btn btn-garis btn-pil" href={peta} rel="noopener noreferrer"><MapPin className="size-4" aria-hidden />Lihat peta</a>}
              {ig && <a className="btn btn-garis btn-pil" href={ig.url} rel="noopener noreferrer"><IkonIg className="size-4" />{ig.nama}</a>}
            </div>
          </div>
          {process.env.NEXT_PUBLIC_EMAIL_LAPOR && (
            <a className="mt-4 block text-center text-xs text-neutral-500"
              href={`mailto:${process.env.NEXT_PUBLIC_EMAIL_LAPOR}?subject=${encodeURIComponent(`Laporkan halaman /${s.slug}`)}`}>
              Laporkan halaman ini
            </a>
          )}
        </section>

        <PasangApp ikon={`/api/ikon/192?s=${s.slug}`} nama={s.nama} judul="Simpan halaman sekolah di HP" teks="Buka lagi dengan sekali ketuk untuk cek status dan info terbaru." kunci={`pasang-${s.slug}`} />
        </div>
      </main>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "School", name: s.nama,
        ...(s.alamat ? { address: s.alamat } : {}), ...(logo ? { logo } : {}),
      }).replace(/</g, "\\u003c") }} />
      <footer className="px-5 pb-28 pt-10 text-white lg:pb-10" style={{ background: "color-mix(in srgb, var(--aksen) 30%, #0f1733)" }}>
        <div className="mx-auto max-w-2xl lg:max-w-6xl">
          <div className="flex items-center gap-3">
            {logo
              ? <Image src={logo} alt="" width={96} height={96} className="size-12 rounded-2xl bg-white object-contain p-1" />
              : <span className="grid size-12 place-items-center rounded-2xl bg-white font-serif text-xl font-bold" style={{ color: "var(--aksen)" }}>{s.nama[0]}</span>}
            <div>
              <p className="font-serif text-lg font-bold leading-tight">{s.nama}</p>
              {s.akreditasi && <p className="text-xs text-white/70">Terakreditasi {s.akreditasi}</p>}
            </div>
          </div>
          {s.alamat && <p className="mt-4 flex gap-2 text-sm text-white/80"><MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />{s.alamat}</p>}
          <div className="mt-4 flex flex-wrap gap-2">
            {wa && <a className="btn btn-pil btn-wa" href={wa} target="_blank" rel="noopener noreferrer"><IkonWa className="size-4" aria-hidden />WhatsApp</a>}
            {ig && <a className="btn btn-pil bg-white/10 text-white" href={ig.url} target="_blank" rel="noopener noreferrer"><IkonIg className="size-4" />{ig.nama}</a>}
            {peta && <a className="btn btn-pil bg-white/10 text-white" href={peta} target="_blank" rel="noopener noreferrer"><MapPin className="size-4" aria-hidden />Peta</a>}
          </div>
          <nav className="mt-6 flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/80">
            <Link href={`/${s.slug}/daftar`}>Daftar</Link>
            <Link href={`/${s.slug}/cek-status`}>Cek status</Link>
            <Link href="/privasi">Privasi</Link>
          </nav>
          <p className="mt-6 border-t border-white/10 pt-3 text-[11px] text-white/40">© {new Date().getFullYear()} {s.nama}</p>
        </div>
      </footer>
      {wa && <WaMelayang href={wa} label={`Chat WhatsApp ${s.nama}`} naik />}

      <div className="fixed inset-x-0 bottom-0 z-10 border-t bg-white/95 p-3 backdrop-blur lg:hidden">
        <div className="mx-auto max-w-2xl">
          {buka
            ? <Link href={`/${s.slug}/daftar`} className="btn h-14 w-full text-lg text-white" style={{ background: "var(--aksen)" }}>Daftar sekarang</Link>
            : <p className="btn h-14 w-full bg-neutral-200 text-neutral-600">Pendaftaran ditutup</p>}
        </div>
      </div>
    </div>
  );
}
