"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound, LogIn, MailCheck } from "lucide-react";
import { Galat, Halaman, Kolom, input, tombol } from "@/components/ui";
import { BantuanWa } from "@/components/bantuan-wa";
import TombolGoogle from "@/components/tombol-google";
import { lupaSandi, masuk } from "./actions";

export default function FormMasuk({ awal }: { awal: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sandi, setSandi] = useState("");
  const [mode, setMode] = useState<"masuk" | "lupa" | "terkirim">("masuk");
  const [galat, setGalat] = useState(awal);
  const [pending, start] = useTransition();

  function kirim(e: React.FormEvent) {
    e.preventDefault();
    setGalat("");
    start(async () => {
      try {
        if (mode === "lupa") { await lupaSandi(email); setMode("terkirim"); return; }
        const r = await masuk(email, sandi);
        if (r.ok) { router.push("/admin"); router.refresh(); } else setGalat(r.pesan);
      } catch { setGalat("Koneksi terputus. Coba lagi."); }
    });
  }

  if (mode === "terkirim") {
    return (
      <Halaman ikon={MailCheck} judul="Cek email Anda" sub="Jika email itu terdaftar, tautan untuk mengatur ulang kata sandi sudah dikirim.">
        <button className="tautan" onClick={() => setMode("masuk")}>Kembali ke halaman masuk</button>
      </Halaman>
    );
  }
  return (
    <Halaman ikon={mode === "lupa" ? KeyRound : LogIn} judul={mode === "lupa" ? "Lupa kata sandi" : "Masuk admin sekolah"} sub={mode === "lupa" ? "Isi email admin, kami kirim tautan untuk membuat kata sandi baru." : "Kelola halaman SPMB dan periksa pendaftar."}>
      {mode === "masuk" && (<>
        <TombolGoogle label="Masuk dengan Google" />
        <p className="flex items-center gap-3 text-xs font-semibold text-neutral-500 before:h-px before:flex-1 before:bg-neutral-200 after:h-px after:flex-1 after:bg-neutral-200">atau pakai email</p>
      </>)}
      <form onSubmit={kirim} className="space-y-4">
        <Kolom label="Email"><input className={input} type="email" value={email} autoComplete="email" required onChange={(e) => setEmail(e.target.value)} /></Kolom>
        {mode === "masuk" && (
          <Kolom label="Kata sandi"><input className={input} type="password" value={sandi} autoComplete="current-password" required onChange={(e) => setSandi(e.target.value)} /></Kolom>
        )}
        <Galat>{galat}</Galat>
        <button className={tombol} disabled={pending}>{pending ? "Memproses…" : mode === "lupa" ? "Kirim tautan" : "Masuk"}</button>
      </form>
      <button className="tautan block w-full text-center text-sm" onClick={() => { setGalat(""); setMode(mode === "masuk" ? "lupa" : "masuk"); }}>
        {mode === "masuk" ? "Lupa kata sandi?" : "Kembali ke halaman masuk"}
      </button>
      <div className="rounded-2xl bg-[var(--kuning-muda)] p-4 text-center">
        <p className="text-sm font-semibold">Sekolah Anda belum punya akun?</p>
        <Link className="btn btn-kuning btn-pil mt-2" href="/daftar">Daftarkan sekolah</Link>
      </div>
      <BantuanWa konteks="sekolah" />
    </Halaman>
  );
}
