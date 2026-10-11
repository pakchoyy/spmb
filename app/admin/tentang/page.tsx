import type { Metadata } from "next";
import {
  CalendarDays, Calculator, ClipboardCheck, ExternalLink, FileText, KeyRound, Layers, Lightbulb, MessageCircle,
  NotebookPen, PencilLine, Puzzle, ScrollText, Target,
} from "lucide-react";
import Link from "next/link";
import { linkWaBantuan, NAMA_APP, TIKTOK } from "@/lib/merek";

export const metadata: Metadata = { title: "Tentang" };

const BGY = "https://www.bantuguruyuk.web.id";
const utm = (u: string) => `${u}${u.includes("?") ? "&" : "?"}utm_source=spmbzone&utm_medium=admin`;

// Alat di Bantu Guru Yuk, dikelompokkan seperti di situsnya.
const ALAT = [
  { grup: "Persiapan mengajar", isi: [
    { n: "Presensi Digital", t: "Absensi siswa, rekap per bulan", u: "https://presiswa.bantuguruyuk.web.id", i: ClipboardCheck, w: "var(--mint-muda)" },
    { n: "Draft TP", t: "Tujuan Pembelajaran sesuai CP terbaru", u: `${BGY}/draft-tp/`, i: Target, w: "var(--biru-muda)" },
    { n: "Modul Ajar", t: "Modul ajar & RPP lengkap", u: `${BGY}/modul-ajar`, i: NotebookPen, w: "var(--ungu-muda)" },
    { n: "Prompt LKPD", t: "LKPD, poster, infografis, flashcard", u: `${BGY}/lkpd`, i: Layers, w: "var(--kuning-muda)" },
  ] },
  { grup: "Pembelajaran", isi: [
    { n: "Buat Soal", t: "Soal PG, isian & uraian, ekspor Word/PDF", u: `${BGY}/soal`, i: PencilLine, w: "var(--oranye-muda)" },
    { n: "Modul Kokurikuler", t: "Sesuai Panduan Kokurikuler 2025", u: `${BGY}/kokurikuler`, i: Puzzle, w: "var(--mint-muda)" },
  ] },
  { grup: "Administrasi", isi: [
    { n: "Katrol Nilai", t: "Hitung & katrol nilai otomatis", u: `${BGY}/katrol-nilai`, i: Calculator, w: "var(--biru-muda)" },
    { n: "Teks Sekolah", t: "Undangan, pemberitahuan, surat ortu", u: `${BGY}/teks-sekolah/`, i: ScrollText, w: "var(--kuning-muda)" },
    { n: "Dokumen Resmi", t: "Surat dan dokumen sekolah", u: `${BGY}/dokumen/`, i: FileText, w: "var(--ungu-muda)" },
    { n: "Buat Jadwal", t: "Jadwal pelajaran sekolah", u: "https://bjadwal.bantuguruyuk.web.id", i: CalendarDays, w: "var(--oranye-muda)" },
    { n: "Simpan Sandi", t: "Akun digital guru, terenkripsi PIN", u: `${BGY}/sandi/`, i: KeyRound, w: "var(--mint-muda)" },
  ] },
];

export default function Tentang() {
  return (
    <main className="mx-auto w-full max-w-2xl space-y-5 px-4 pb-6 pt-4">
      <section className="overflow-hidden rounded-3xl bg-[#14204a] text-white">
        <div className="p-5">
          <p className="text-sm text-white/70">{NAMA_APP} dibuat oleh</p>
          <div className="mt-2 flex items-center gap-3">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white font-serif text-2xl font-bold text-[#14204a]">PC</span>
            <div>
              <p className="font-serif text-2xl font-bold">Pak Choyy</p>
              <p className="text-sm text-white/80">Guru & pembuat Bantu Guru Yuk</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-white/85">
            {NAMA_APP} adalah bagian dari <b>Bantu Guru Yuk</b>: alat digital gratis untuk meringankan pekerjaan guru, dari menyiapkan modul sampai administrasi kelas.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <a href={TIKTOK} target="_blank" rel="noopener noreferrer" className="btn btn-pil bg-white text-[#14204a]">
              <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden><path d="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.7a5.7 5.7 0 1 0 4.9 5.7V9a7.4 7.4 0 0 0 4.3 1.4V7.3a4.3 4.3 0 0 1-3.2-1.5z" /></svg>
              @pak.choyy
            </a>
            <a href={linkWaBantuan("Halo Pak Choyy, saya admin sekolah pengguna SPMB Zone. ")} target="_blank" rel="noopener noreferrer" className="btn btn-wa btn-pil">
              <MessageCircle className="size-4" aria-hidden />WhatsApp
            </a>
          </div>
        </div>
        <a href={utm(BGY)} target="_blank" rel="noopener" className="flex items-center justify-between gap-2 bg-[var(--kuning)] px-5 py-3 font-bold text-[#14204a]">
          Buka Bantu Guru Yuk <ExternalLink className="size-4" aria-hidden />
        </a>
      </section>

      {ALAT.map((g) => (
        <section key={g.grup}>
          <h2 className="mb-2 px-1 font-bold">{g.grup}</h2>
          <ul className="grid grid-cols-2 gap-2">
            {g.isi.map((a) => (
              <li key={a.n}>
                <a href={utm(a.u)} target="_blank" rel="noopener" className="flex h-full flex-col rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/5 active:scale-[.98]">
                  <span className="grid size-10 place-items-center rounded-xl" style={{ background: a.w }}><a.i className="size-5 text-[var(--biru-tua)]" aria-hidden /></span>
                  <span className="mt-2 font-bold leading-tight">{a.n}</span>
                  <span className="mt-0.5 text-xs text-neutral-600">{a.t}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <Link href="/admin/masukan" className="flex items-center gap-3 rounded-3xl bg-[var(--ungu-muda)] p-4">
        <Lightbulb className="size-6 shrink-0 text-[var(--ungu)]" aria-hidden />
        <span><b className="block">Punya ide untuk {NAMA_APP}?</b><span className="text-sm text-neutral-700">Minta fitur atau beri saran</span></span>
      </Link>
      <p className="text-center text-xs text-neutral-500"><Link href="/syarat" className="tautan">Syarat</Link> · <Link href="/privasi" className="tautan">Privasi</Link></p>
    </main>
  );
}
