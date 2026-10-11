import { IkonWa } from "@/components/ikon-merek";
import type { Metadata } from "next";
import Link from "next/link";
import { HeartHandshake, Lightbulb, ShieldCheck, Smartphone } from "lucide-react";
import { Logo } from "@/components/logo";
import { Footer } from "@/components/footer";
import { linkWaBantuan, NAMA_APP, PESAN_WA, TAGLINE, TIKTOK } from "@/lib/merek";

export const metadata: Metadata = { title: `Tentang ${NAMA_APP}`, description: `${NAMA_APP}: ${TAGLINE}. Dibuat oleh guru, untuk sekolah.` };

const NILAI = [
  { ikon: Smartphone, warna: "var(--biru-muda)", j: "Cukup dari HP", t: "Orang tua daftar dan unggah berkas dari HP. Admin memeriksa juga dari HP." },
  { ikon: ShieldCheck, warna: "var(--mint-muda)", j: "Data anak dijaga", t: "Berkas tertutup, hanya dibuka sekolah lewat tautan sementara." },
  { ikon: HeartHandshake, warna: "var(--kuning-muda)", j: "Dibuat bersama sekolah", t: "Fitur baru lahir dari permintaan admin sekolah pengguna." },
];

export default function Tentang() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-black/5 bg-[var(--background)]/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Logo />
          <Link href="/masuk" className="btn btn-garis btn-pil">Masuk</Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 space-y-6 px-4 py-8">
        <section>
          <p className="text-sm font-bold text-[var(--biru)]">Tentang kami</p>
          <h1 className="mt-1 font-serif text-3xl font-bold leading-tight">{TAGLINE}</h1>
          <p className="mt-3 text-lg text-neutral-700">
            {NAMA_APP} membantu sekolah punya halaman SPMB sendiri: orang tua mendaftar dari HP tanpa akun, sekolah memeriksa berkas dengan mudah.
            Tidak perlu server, tidak perlu instalasi.
          </p>
        </section>

        <ul className="grid gap-3 sm:grid-cols-3">
          {NILAI.map((n) => (
            <li key={n.j} className="rounded-3xl p-5" style={{ background: n.warna }}>
              <n.ikon className="size-7 text-[var(--biru-tua)]" aria-hidden />
              <h2 className="mt-3 font-bold">{n.j}</h2>
              <p className="mt-1 text-sm text-neutral-700">{n.t}</p>
            </li>
          ))}
        </ul>

        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <h2 className="font-serif text-xl font-bold">Siapa di balik {NAMA_APP}?</h2>
          <p className="mt-2 text-neutral-700">
            Dibuat oleh <a href={TIKTOK} target="_blank" rel="noopener noreferrer" className="tautan font-semibold">pak.choyy</a>, sebagai bagian dari{" "}
            <a href="https://www.bantuguruyuk.web.id/?utm_source=spmbzone&utm_medium=tentang" target="_blank" rel="noopener" className="tautan font-semibold">Bantu Guru Yuk</a>:
            kumpulan alat sederhana untuk meringankan pekerjaan guru dan sekolah.
          </p>
        </section>

        <section className="grid gap-2 sm:grid-cols-2">
          <a href={linkWaBantuan(PESAN_WA.umum)} target="_blank" rel="noopener noreferrer" className="btn btn-wa"><IkonWa className="size-5" aria-hidden />Hubungi kami</a>
          <a href={linkWaBantuan(PESAN_WA.saran)} target="_blank" rel="noopener noreferrer" className="btn btn-lembut"><Lightbulb className="size-5" aria-hidden />Kritik &amp; saran</a>
        </section>
      </main>

      <Footer iklan />
    </div>
  );
}
