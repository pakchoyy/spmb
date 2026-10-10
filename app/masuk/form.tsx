"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Galat, Halaman, Kolom, input, tombol } from "@/components/ui";
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
      <Halaman judul="Cek email Anda" sub="Jika email itu terdaftar, link untuk mengatur ulang kata sandi sudah dikirim.">
        <button className="underline" onClick={() => setMode("masuk")}>Kembali ke halaman masuk</button>
      </Halaman>
    );
  }
  return (
    <Halaman judul={mode === "lupa" ? "Lupa kata sandi" : "Masuk"} sub={mode === "lupa" ? "Isi email admin, kami kirim link pengaturan ulang." : "Untuk admin sekolah."}>
      <form onSubmit={kirim} className="space-y-4">
        <Kolom label="Email"><input className={input} type="email" value={email} autoComplete="email" required onChange={(e) => setEmail(e.target.value)} /></Kolom>
        {mode === "masuk" && (
          <Kolom label="Kata sandi"><input className={input} type="password" value={sandi} autoComplete="current-password" required onChange={(e) => setSandi(e.target.value)} /></Kolom>
        )}
        <Galat>{galat}</Galat>
        <button className={tombol} disabled={pending}>{pending ? "Memproses…" : mode === "lupa" ? "Kirim link" : "Masuk"}</button>
      </form>
      <div className="flex justify-between text-sm">
        <button className="underline" onClick={() => { setGalat(""); setMode(mode === "masuk" ? "lupa" : "masuk"); }}>
          {mode === "masuk" ? "Lupa kata sandi?" : "Kembali"}
        </button>
        <Link className="underline" href="/daftar">Belum punya akun? Coba gratis</Link>
      </div>
    </Halaman>
  );
}
