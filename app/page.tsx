import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight, BadgeCheck, Check, CalendarClock, ChevronDown, FileUp, LayoutDashboard, MessageCircle,
  PencilRuler, QrCode, School, ShieldCheck, Smartphone, Wifi,
} from "lucide-react";
import { supabaseAnon } from "@/lib/supabase/anon";
import { supabaseService } from "@/lib/supabase/admin";
import { HOST_APP, linkWaBantuan, NAMA_APP, PESAN_WA } from "@/lib/merek";
import { Logo } from "@/components/logo";
import { Footer } from "@/components/footer";
import { SekolahMarquee, type SekolahPengguna } from "@/components/sekolah-marquee";
import { Testimoni, type TestimoniPublik } from "@/components/testimoni";
import TombolCoba from "./tombol-coba";

export const revalidate = 3600; // harga dan daftar sekolah cukup segar tiap jam

export const metadata: Metadata = {
  title: `${NAMA_APP} — Halaman SPMB sendiri untuk sekolah`,
  description: "Sekolah mendapat halaman SPMB sendiri. Orang tua daftar dari HP tanpa akun, sekolah memeriksa berkas dengan mudah.",
};

async function ambilData(): Promise<{ harga: number | null; sekolah: SekolahPengguna[]; testimoni: TestimoniPublik[] }> {
  // Gagal ambil data (mis. saat build tanpa database) tidak boleh menggagalkan beranda.
  const [harga, sekolah, testimoni] = await Promise.all([
    supabaseService().from("pengaturan").select("harga_paket").eq("id", 1).maybeSingle()
      .then((r) => r.data?.harga_paket ?? null, () => null),
    supabaseAnon().rpc("sekolah_pengguna")
      .then((r) => (r.data ?? []) as SekolahPengguna[], () => []),
    supabaseAnon().rpc("testimoni_publik")
      .then((r) => (r.data ?? []) as TestimoniPublik[], () => []),
  ]);
  return { harga, sekolah, testimoni };
}

const contoh = process.env.NEXT_PUBLIC_CONTOH_SLUG || "sdbaru";

const LANGKAH = [
  { ikon: School, warna: "var(--biru-muda)", aksen: "var(--biru)", j: "Daftar dan atur sekolah", t: "Pilih alamat halaman, isi profil, lalu atur jalur dan isian form." },
  { ikon: QrCode, warna: "var(--kuning-muda)", aksen: "#b7780a", j: "Bagikan ke orang tua", t: "Unduh QR dan tautan halaman sekolah untuk brosur, spanduk, atau grup WhatsApp." },
  { ikon: BadgeCheck, warna: "var(--mint-muda)", aksen: "var(--mint)", j: "Periksa dari HP", t: "Lihat pendaftar baru, buka berkasnya, lalu tetapkan Diterima, Cadangan, atau Ditolak." },
];

const FITUR = [
  { ikon: School, warna: "var(--biru-muda)", aksen: "var(--biru)", j: "Halaman sekolah sendiri", t: `Alamat ${HOST_APP}/nama-sekolah, lengkap dengan logo, warna, keunggulan, jalur, jadwal, dan galeri.` },
  { ikon: PencilRuler, warna: "var(--ungu-muda)", aksen: "var(--ungu)", j: "Form sesuai kebutuhan", t: "Tambah, ubah, dan urutkan isian sesuka sekolah. Jalur Domisili, Afirmasi, Prestasi, dan Mutasi bisa dipakai atau tidak." },
  { ikon: FileUp, warna: "var(--oranye-muda)", aksen: "var(--oranye)", j: "Berkas dari HP", t: "Foto dikecilkan otomatis. Kalau gagal terkirim, cukup unggah ulang tanpa mengisi form dari awal." },
  { ikon: LayoutDashboard, warna: "var(--mint-muda)", aksen: "var(--mint)", j: "Mudah diperiksa", t: "Daftar tugas hari ini, pencarian, catatan alasan, peringatan data ganda, tombol WhatsApp, cetak, dan unduh ke Excel." },
  { ikon: ShieldCheck, warna: "var(--kuning-muda)", aksen: "#b7780a", j: "Data anak lebih aman", t: "Berkas disimpan tertutup dan hanya dibuka sekolah lewat tautan sementara. Sekolah hanya melihat datanya sendiri." },
  { ikon: Wifi, warna: "var(--biru-muda)", aksen: "var(--biru)", j: "Ringan di sinyal lemah", t: "Isian tersimpan di HP orang tua bila sinyal putus, dan halaman sekolah dibuat ringan." },
];

const DAPAT = [
  <>Halaman SPMB sendiri: <b>{HOST_APP}/nama-sekolah</b></>,
  <>Orang tua <b>unggah berkas langsung dari HP</b>, tanpa akun</>,
  <>Jalur pendaftaran bebas diatur (domisili, afirmasi, prestasi, mutasi)</>,
  <><b>Tanpa batas</b> jumlah pendaftar</>,
  <>Garis waktu jadwal SPMB, prestasi siswa, dan galeri di halaman sekolah</>,
  <>Tombol <b>WhatsApp sekolah</b> untuk konsultasi orang tua</>,
  <>Unduh data pendaftar ke <b>Excel</b> kapan saja</>,
];

const FAQ = [
  ["Apakah orang tua perlu membuat akun?", "Tidak. Orang tua mengisi form, mengunggah berkas, lalu mendapat nomor pendaftaran. Status bisa dicek dengan nomor itu dan tanggal lahir anak."],
  ["Bagaimana cara berlangganan?", "Beli paket tahunan memakai email admin sekolah. Kode aktivasi dikirim ke email itu, lalu dimasukkan di menu Langganan."],
  ["Bagaimana jika langganan habis?", "Ada masa tenggang 3 hari: data masih bisa dilihat, tetapi pendaftaran ditutup. Setelah itu halaman pendaftaran nonaktif, data tetap tersimpan dan bisa diunduh ke Excel."],
  ["Apakah zonasi atau nilai dihitung otomatis?", "Belum. Sekolah menetapkan hasil setelah memeriksa data dan berkas, lalu bisa menghubungi orang tua lewat tombol WhatsApp."],
  ["Berapa lama data disimpan?", "Selama sekolah berlangganan, dan tetap tersimpan setelah nonaktif. Admin bisa mengarsipkan atau menghapus data tahun lalu."],
];

function Ilustrasi() {
  // HP dengan form singkat dan tanda centang: gambaran "daftar dari HP".
  return (
    <svg viewBox="0 0 220 240" aria-hidden className="mx-auto h-56 w-auto">
      <circle cx="170" cy="50" r="38" fill="var(--kuning)" opacity=".35" />
      <circle cx="40" cy="190" r="30" fill="var(--mint)" opacity=".2" />
      <rect x="55" y="20" width="110" height="200" rx="22" fill="#14204a" />
      <rect x="63" y="34" width="94" height="172" rx="14" fill="#fff" />
      <rect x="75" y="50" width="50" height="8" rx="4" fill="var(--biru)" />
      {[72, 100, 128].map((y) => (
        <g key={y}>
          <rect x="75" y={y} width="70" height="6" rx="3" fill="#d6dcf5" />
          <rect x="75" y={y + 10} width="70" height="12" rx="4" fill="var(--biru-muda)" />
        </g>
      ))}
      <rect x="75" y="160" width="70" height="20" rx="8" fill="var(--biru)" />
      <circle cx="165" cy="170" r="22" fill="var(--mint)" />
      <path d="M155 170l7 7 13-14" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const Judul = ({ kecil, children }: { kecil?: string; children: React.ReactNode }) => (
  <div className="text-center">
    {kecil && <p className="text-sm font-bold uppercase tracking-wide text-[var(--biru)]">{kecil}</p>}
    <h2 className="mt-1 font-serif text-3xl font-bold">{children}</h2>
  </div>
);

export default async function Beranda() {
  const { harga, sekolah, testimoni } = await ambilData();
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-black/5 bg-[var(--background)]/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-3">
          <Logo />
          <div className="flex items-center gap-2">
            <Link href="/cara-pakai" className="btn btn-pil text-[var(--biru)]">Cara pakai</Link>
            <Link href="/masuk" className="btn btn-garis btn-pil">Masuk</Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="hero-latar relative overflow-hidden px-5 pb-10 pt-8">
          <div className="mx-auto grid max-w-4xl items-center gap-6 sm:grid-cols-2">
            <div className="muncul text-center sm:text-left">
              <p className="inline-flex items-center gap-1.5 rounded-full bg-[var(--kuning-muda)] px-3 py-1 text-sm font-bold text-[#8a5a00]">
                <CalendarClock className="size-4" aria-hidden /> SPMB online untuk sekolah
              </p>
              <h1 className="mt-3 font-serif text-4xl font-bold leading-tight sm:text-5xl">Web SPMB <span className="relative whitespace-nowrap text-[var(--biru)]">Custom<svg aria-hidden viewBox="0 0 120 10" preserveAspectRatio="none" className="absolute -bottom-1 left-0 h-2.5 w-full text-[var(--kuning)]"><path d="M2 7c30-5 80-6 116-2" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" /></svg></span> untuk sekolah anda</h1>
              <p className="mt-3 text-lg text-neutral-700">Orang tua daftar dari HP tanpa akun. Sekolah memeriksa berkas dengan mudah.</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <TombolCoba className="btn btn-utama h-14 text-lg">Daftarkan sekolah <ArrowRight className="size-5" aria-hidden /></TombolCoba>
                {contoh && <Link href={`/${contoh}`} className="btn btn-lembut h-14">Lihat contoh halaman</Link>}
              </div>
              <ul className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-neutral-600 sm:justify-start">
                <li className="flex items-center gap-1"><BadgeCheck className="size-4 text-[var(--mint)]" aria-hidden /> Tanpa kartu kredit</li>
                <li className="flex items-center gap-1"><Smartphone className="size-4 text-[var(--mint)]" aria-hidden /> Cukup pakai HP</li>
              </ul>
            </div>
            <Ilustrasi />
          </div>
        </section>

        <SekolahMarquee sekolah={sekolah} />
        <Testimoni daftar={testimoni} />

        <section className="bg-[var(--biru)] px-5 py-10 text-white">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-center font-serif text-3xl font-bold">Mulai dalam tiga langkah</h2>
            <ol className="mt-6 grid gap-3 sm:grid-cols-3">
              {LANGKAH.map((l, i) => (
                <li key={l.j} className="rounded-3xl bg-white p-5 text-[var(--foreground)]">
                  <div className="flex items-center gap-3">
                    <span className="grid size-11 place-items-center rounded-2xl" style={{ background: l.warna, color: l.aksen }}><l.ikon className="size-6" aria-hidden /></span>
                    <span className="text-sm font-bold text-neutral-500">Langkah {i + 1}</span>
                  </div>
                  <h3 className="mt-3 text-lg font-bold">{l.j}</h3>
                  <p className="mt-1 text-neutral-700">{l.t}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="px-5 py-10">
          <div className="mx-auto max-w-4xl">
            <Judul kecil="Fitur">Yang sekolah dapatkan</Judul>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {FITUR.map((f) => (
                <li key={f.j} className="flex gap-4 rounded-3xl p-5" style={{ background: f.warna }}>
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white" style={{ color: f.aksen }}><f.ikon className="size-6" aria-hidden /></span>
                  <div>
                    <h3 className="font-bold">{f.j}</h3>
                    <p className="mt-1 text-sm text-neutral-700">{f.t}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="bg-[#14204a] px-5 py-10">
          <div className="mx-auto max-w-2xl rounded-[2rem] bg-white p-6 sm:p-8">
            <h2 className="font-serif text-2xl font-bold">Apa yang sekolah dapatkan</h2>
            <ul className="mt-5 space-y-4">
              {DAPAT.map((x, i) => (
                <li key={i} className="flex gap-3 text-lg leading-snug">
                  <Check className="mt-0.5 size-6 shrink-0 text-[var(--mint)]" strokeWidth={3} aria-hidden /><span>{x}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="bg-[var(--kuning-muda)] px-5 py-10">
          <div className="mx-auto max-w-sm text-center">
            <Judul kecil="Harga">Satu paket, semua fitur</Judul>
            <div className="mt-6 rounded-[2rem] bg-white p-6 shadow-sm ring-2 ring-[var(--kuning)]">
              <p className="font-semibold text-neutral-600">Paket tahunan</p>
              {harga
                ? <p className="mt-1 font-serif text-4xl font-bold">Rp{harga.toLocaleString("id-ID")}<span className="text-base font-normal text-neutral-600"> / tahun</span></p>
                : <p className="mt-1 font-serif text-2xl font-bold">Tanyakan harga terbaik</p>}
              <ul className="mt-4 space-y-2 text-left">
                {["Pendaftar tanpa batas jumlah", "Semua fitur, tanpa biaya tambahan", "Data bisa diunduh kapan saja"].map((x) => (
                  <li key={x} className="flex gap-2"><BadgeCheck className="size-5 shrink-0 text-[var(--mint)]" aria-hidden />{x}</li>
                ))}
              </ul>
              <div className="mt-6 grid gap-2">
                <TombolCoba className="btn btn-utama w-full">Daftarkan sekolah</TombolCoba>
                {!harga && (
                  <a href={linkWaBantuan(PESAN_WA.harga)} target="_blank" rel="noopener noreferrer" className="btn btn-wa w-full">
                    <MessageCircle className="size-5" aria-hidden /> Tanya harga lewat WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 py-10">
          <div className="mx-auto max-w-2xl">
            <Judul kecil="Tanya jawab">Pertanyaan umum</Judul>
            <div className="mt-6 space-y-2">
              {FAQ.map(([q, a]) => (
                <details key={q} className="group rounded-2xl bg-white p-4 ring-1 ring-black/5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold [&::-webkit-details-marker]:hidden">
                    {q}
                    <ChevronDown className="size-5 shrink-0 text-[var(--biru)] transition group-open:rotate-180" aria-hidden />
                  </summary>
                  <p className="mt-2 text-neutral-700">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer iklan />
    </div>
  );
}
