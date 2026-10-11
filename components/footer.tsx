import { IkonWa } from "@/components/ikon-merek";
import Link from "next/link";
import Script from "next/script";
import { Lightbulb } from "lucide-react";
import { Logo } from "./logo";
import { linkWaBantuan, NAMA_APP, PESAN_WA, TAGLINE, TIKTOK } from "@/lib/merek";
import { WaMelayang } from "./wa-melayang";

/** Footer bersama. `iklan` memuat bar info Bantu Guru Yuk (tidak dipakai di form orang tua dan halaman admin). */
export function Footer({ iklan = false }: { iklan?: boolean }) {
  return (
    <>
      {iklan && <div data-bgy-info data-bgy-info-static />}
      <footer className="bg-[#14204a] px-5 pb-8 pt-10 text-white/80">
        <div className="mx-auto max-w-4xl">
          <Logo terang />
          <p className="mt-3 max-w-sm text-sm">{TAGLINE}. Orang tua daftar dari HP, sekolah memeriksa berkas dengan mudah.</p>

          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            <a href={linkWaBantuan(PESAN_WA.umum)} target="_blank" rel="noopener noreferrer" className="btn btn-wa btn-pil justify-start">
              <IkonWa className="size-4" aria-hidden /> Ada kendala? Chat WhatsApp
            </a>
            <a href={linkWaBantuan(PESAN_WA.saran)} target="_blank" rel="noopener noreferrer" className="btn btn-pil justify-start bg-white/10 text-white">
              <Lightbulb className="size-4" aria-hidden /> Kritik &amp; saran
            </a>
          </div>

          <nav className="mt-8 grid grid-cols-2 gap-y-2 text-sm sm:grid-cols-3">
            <Link href="/cara-pakai" className="hover:text-white">Cara pakai</Link>
            <Link href="/tentang" className="hover:text-white">Tentang</Link>
            <Link href="/daftar" className="hover:text-white">Daftar sekolah</Link>
            <Link href="/masuk" className="hover:text-white">Masuk admin</Link>
            <Link href="/syarat" className="hover:text-white">Syarat &amp; Ketentuan</Link>
            <Link href="/privasi" className="hover:text-white">Kebijakan Privasi</Link>
          </nav>

          <p className="mt-8 border-t border-white/10 pt-4 text-xs text-white/50">
            © {new Date().getFullYear()} {NAMA_APP} · Bagian dari{" "}
            <a href="https://www.bantuguruyuk.web.id/?utm_source=spmbzone&utm_medium=footer" target="_blank" rel="noopener" className="font-semibold text-white/80">Bantu Guru Yuk</a>
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-white/60">
            Created by
            <a href={TIKTOK} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 font-semibold text-white hover:bg-white/20">
              <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor" aria-hidden><path d="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.7a5.7 5.7 0 1 0 4.9 5.7V9a7.4 7.4 0 0 0 4.3 1.4V7.3a4.3 4.3 0 0 1-3.2-1.5z" /></svg>
              pak.choyy
            </a>
          </p>
        </div>
      </footer>
      {iklan && <WaMelayang />}
      {iklan && <Script src="https://www.bantuguruyuk.web.id/bgy-info.js" strategy="lazyOnload" />}
    </>
  );
}
