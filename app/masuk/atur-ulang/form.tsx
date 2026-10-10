"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Galat, Halaman, Kolom, input, tombol } from "@/components/ui";
import { aturSandiBaru } from "../actions";

export default function FormAtur() {
  const router = useRouter();
  const [sandi, setSandi] = useState("");
  const [galat, setGalat] = useState("");
  const [pending, start] = useTransition();
  return (
    <Halaman judul="Kata sandi baru">
      <form className="space-y-4" onSubmit={(e) => {
        e.preventDefault(); setGalat("");
        start(async () => {
          try { const r = await aturSandiBaru(sandi); if (r.ok) router.push("/admin"); else setGalat(r.pesan); }
          catch { setGalat("Koneksi terputus. Coba lagi."); }
        });
      }}>
        <Kolom label="Kata sandi baru"><input className={input} type="password" value={sandi} minLength={8} autoComplete="new-password" required onChange={(e) => setSandi(e.target.value)} /></Kolom>
        <Galat>{galat}</Galat>
        <button className={tombol} disabled={pending}>Simpan</button>
      </form>
    </Halaman>
  );
}
