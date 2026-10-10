"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Galat, Halaman, Kolom, input, tombol } from "@/components/ui";
import Turnstile from "@/components/turnstile";
import { mintaKode } from "./actions";

export default function FormAktivasi({ sitekey }: { sitekey: string | null }) {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [galat, setGalat] = useState("");
  const [terkirim, setTerkirim] = useState(false);
  const [pending, start] = useTransition();

  if (terkirim) {
    return (
      <Halaman judul="Cek email Anda" sub={`Jika ${email} adalah email admin sekolah yang terdaftar, kode aktivasi sudah dikirim.`}>
        <p>Kode berbentuk <b>SPMB-XXXXX</b>. Masukkan di menu <b>Langganan</b> setelah masuk ke aplikasi. Tidak ada email? Periksa folder spam, dan pastikan memakai email yang sama dengan akun sekolah. Satu email bisa meminta maksimal 3 kode per hari.</p>
        <Link className="underline" href="/admin/langganan">Buka halaman Langganan</Link>
      </Halaman>
    );
  }
  return (
    <Halaman judul="Aktifkan langganan" sub="Terima kasih sudah membeli. Isi email admin sekolah, kami kirim kode aktivasi.">
      <form className="space-y-4" onSubmit={(e) => {
        e.preventDefault(); setGalat("");
        start(async () => {
          try { const r = await mintaKode(email, token); if (r.ok) setTerkirim(true); else setGalat(r.pesan); }
          catch { setGalat("Koneksi terputus. Coba lagi."); }
        });
      }}>
        <Kolom label="Email admin sekolah" bantu={<span className="text-neutral-600">Email yang dipakai mendaftar di aplikasi dan membeli di Lynk.</span>}>
          <input className={input} type="email" value={email} autoComplete="email" required onChange={(e) => setEmail(e.target.value)} />
        </Kolom>
        <Turnstile sitekey={sitekey} onToken={setToken} />
        <Galat>{galat}</Galat>
        <button className={tombol} disabled={pending || (!!sitekey && !token)}>{pending ? "Memproses…" : "Kirim kode aktivasi"}</button>
      </form>
    </Halaman>
  );
}
