import Link from "next/link";
import Script from "next/script";
import { MessageCircle, Lightbulb } from "lucide-react";
import { Logo } from "./logo";
import { linkWaBantuan, NAMA_APP, PESAN_WA } from "@/lib/merek";

/** Footer bersama. `iklan` memuat bar info Bantu Guru Yuk (tidak dipakai di form orang tua dan halaman admin). */
export function Footer({ iklan = false }: { iklan?: boolean }) {
  return (
    <>
      {iklan && <div data-bgy-info data-bgy-info-static />}
      <footer className="bg-[#14204a] px-5 pb-8 pt-10 text-white/80">
        <div className="mx-auto max-w-4xl">
          <Logo terang />
          <p className="mt-3 max-w-sm text-sm">Halaman SPMB sendiri untuk sekolah. Orang tua daftar dari HP, sekolah memeriksa berkas dengan mudah.</p>

          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            <a href={linkWaBantuan(PESAN_WA.umum)} target="_blank" rel="noopener noreferrer" className="btn btn-wa btn-pil justify-start">
              <MessageCircle className="size-4" aria-hidden /> Ada kendala? Chat WhatsApp
            </a>
            <a href={linkWaBantuan(PESAN_WA.saran)} target="_blank" rel="noopener noreferrer" className="btn btn-pil justify-start bg-white/10 text-white">
              <Lightbulb className="size-4" aria-hidden /> Kritik &amp; saran
            </a>
          </div>

          <nav className="mt-8 grid grid-cols-2 gap-y-2 text-sm sm:grid-cols-5">
            <Link href="/cara-pakai" className="hover:text-white">Cara pakai</Link>
            <Link href="/daftar" className="hover:text-white">Daftar sekolah</Link>
            <Link href="/masuk" className="hover:text-white">Masuk admin</Link>
            <Link href="/syarat" className="hover:text-white">Syarat &amp; Ketentuan</Link>
            <Link href="/privasi" className="hover:text-white">Kebijakan Privasi</Link>
          </nav>

          <p className="mt-8 border-t border-white/10 pt-4 text-xs text-white/50">
            © {new Date().getFullYear()} {NAMA_APP} · Bagian dari{" "}
            <a href="https://www.bantuguruyuk.web.id/?utm_source=yukmasuk&utm_medium=footer" target="_blank" rel="noopener" className="font-semibold text-white/80">Bantu Guru Yuk</a>
          </p>
        </div>
      </footer>
      {iklan && <Script src="https://www.bantuguruyuk.web.id/bgy-info.js" strategy="lazyOnload" />}
    </>
  );
}
