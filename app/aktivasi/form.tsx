"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { BadgeCheck, Copy, KeyRound } from "lucide-react";
import { Galat, Halaman, Kolom, input, tombol } from "@/components/ui";
import Turnstile from "@/components/turnstile";
import { mintaKode } from "./actions";

export default function FormAktivasi({ token, sitekey }: { token: string; sitekey: string | null }) {
  const [email, setEmail] = useState("");
  const [ts, setTs] = useState<string | null>(null);
  const [galat, setGalat] = useState("");
  const [kode, setKode] = useState<string | null>(null);
  const [tersalin, setTersalin] = useState(false);
  const [pending, start] = useTransition();

  if (kode) {
    return (
      <Halaman ikon={KeyRound} judul="Kode aktivasi Anda" sub={`Untuk ${email}. Salin lalu masukkan di menu Langganan sebelum 1 jam.`}>
        <div className="rounded-2xl bg-[var(--biru-muda)] p-4 text-center">
          <p className="font-mono text-3xl font-bold tracking-widest text-[var(--biru-tua)]">{kode}</p>
          <p className="mt-1 text-xs text-[var(--biru-tua)]/80">Sekali pakai · berlaku 1 jam</p>
        </div>
        <button type="button" className="btn btn-lembut w-full" onClick={async () => {
          try { await navigator.clipboard.writeText(kode); setTersalin(true); } catch {}
        }}><Copy className="size-5" aria-hidden />{tersalin ? "Tersalin ✓" : "Salin kode"}</button>
        <Link className={tombol} href="/admin/langganan">Buka Langganan & masukkan kode</Link>
        <p className="text-sm text-neutral-600">Belum masuk? Masuk dulu dengan akun admin sekolah, lalu buka menu <b>Langganan</b> → <b>Punya kode aktivasi?</b></p>
      </Halaman>
    );
  }
  return (
    <Halaman ikon={BadgeCheck} judul="Aktifkan langganan" sub="Terima kasih sudah membeli! Isi email admin sekolah untuk mendapatkan kode aktivasi.">
      <form className="space-y-4" onSubmit={(e) => {
        e.preventDefault(); setGalat("");
        start(async () => {
          try { const r = await mintaKode(email, token, ts); if (r.ok) setKode(r.kode); else setGalat(r.pesan); }
          catch { setGalat("Koneksi terputus. Coba lagi."); }
        });
      }}>
        <Kolom label="Email admin sekolah" bantu={<span className="text-neutral-600">Email yang dipakai saat mendaftarkan sekolah di SPMB Zone.</span>}>
          <input className={input} type="email" value={email} autoComplete="email" required onChange={(e) => setEmail(e.target.value)} />
        </Kolom>
        <Turnstile sitekey={sitekey} onToken={setTs} />
        <Galat>{galat}</Galat>
        <button className={tombol} disabled={pending || (!!sitekey && !ts)}>{pending ? "Memeriksa…" : "Dapatkan kode aktivasi"}</button>
        <p className="text-xs text-neutral-500">Kode hanya bisa dipakai sekali dan berlaku 1 jam.</p>
      </form>
    </Halaman>
  );
}
