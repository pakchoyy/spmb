"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Galat, Halaman, Kolom, input, tombol } from "@/components/ui";
import SlugField from "@/components/slug-field";
import { buatSlug } from "@/lib/slug";
import { lengkapiSekolah } from "../actions";

export default function Lengkapi({ nama: n0, npsn }: { nama: string; npsn: string }) {
  const router = useRouter();
  const [nama, setNama] = useState(n0);
  const [slug, setSlug] = useState(buatSlug(n0));
  const [galat, setGalat] = useState("");
  const [pending, start] = useTransition();

  function kirim(e: React.FormEvent) {
    e.preventDefault();
    setGalat("");
    start(async () => {
      try {
        const r = await lengkapiSekolah({ nama, slug, npsn });
        if (r.ok) router.push("/admin"); else setGalat(r.pesan);
      } catch { setGalat("Koneksi terputus. Coba lagi."); }
    });
  }
  return (
    <Halaman judul="Lengkapi sekolah" sub="Alamat halaman yang Anda pilih tadi sudah dipakai sekolah lain. Pilih alamat baru.">
      <form onSubmit={kirim} className="space-y-4">
        <Kolom label="Nama sekolah"><input className={input} value={nama} required onChange={(e) => setNama(e.target.value)} /></Kolom>
        <SlugField nilai={slug} onUbah={setSlug} />
        <Galat>{galat}</Galat>
        <button className={tombol} disabled={pending}>{pending ? "Memproses…" : "Simpan"}</button>
      </form>
    </Halaman>
  );
}
