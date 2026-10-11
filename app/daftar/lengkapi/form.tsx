"use client";

import { InfoTrial } from "@/components/info-trial";
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { School } from "lucide-react";
import { Galat, Halaman, Kolom, input, tombol } from "@/components/ui";
import SlugField from "@/components/slug-field";
import { BantuanWa } from "@/components/bantuan-wa";
import { buatSlug } from "@/lib/slug";
import { lengkapiSekolah } from "../actions";

export default function Lengkapi({ nama: n0, npsn: npsn0, dariGoogle, email, kodeAwal }:
  { nama: string; npsn: string; dariGoogle: boolean; email: string; kodeAwal: string }) {
  const router = useRouter();
  const [nama, setNama] = useState(n0);
  const [slug, setSlug] = useState(buatSlug(n0));
  const [slugManual, setSlugManual] = useState(false);
  const [npsn, setNpsn] = useState(npsn0);
  const [kodeRef, setKodeRef] = useState(kodeAwal);
  const [setuju, setSetuju] = useState(!dariGoogle);
  const [galat, setGalat] = useState("");
  const [pending, start] = useTransition();

  function kirim(e: React.FormEvent) {
    e.preventDefault();
    setGalat("");
    start(async () => {
      try {
        const r = await lengkapiSekolah({ nama, slug, npsn, kodeRef, setuju });
        if (r.ok) { router.push("/admin"); router.refresh(); } else setGalat(r.pesan);
      } catch { setGalat("Koneksi terputus. Coba lagi."); }
    });
  }
  return (
    <Halaman ikon={School} judul={dariGoogle ? "Satu langkah lagi" : "Lengkapi sekolah"}
      sub={dariGoogle ? `Masuk sebagai ${email}. Isi data sekolah untuk membuat halaman SPMB.` : "Alamat halaman yang Anda pilih tadi sudah dipakai sekolah lain. Pilih alamat baru."}>
      {dariGoogle && <InfoTrial />}
      <form onSubmit={kirim} className="space-y-4">
        <Kolom label="Nama sekolah">
          <input className={input} value={nama} required maxLength={150} placeholder="Contoh: SD Negeri 1 Menteng"
            onChange={(e) => { setNama(e.target.value); if (!slugManual) setSlug(buatSlug(e.target.value)); }} />
        </Kolom>
        <SlugField nilai={slug} onUbah={(s) => { setSlugManual(true); setSlug(s); }} />
        {dariGoogle && (<>
          <Kolom label="NPSN sekolah (8 angka)">
            <input className={input} value={npsn} inputMode="numeric" maxLength={8} onChange={(e) => setNpsn(e.target.value.replace(/\D/g, ""))} />
          </Kolom>
          <Kolom label="Kode ajakan (boleh dikosongkan)">
            <input className={input} value={kodeRef} maxLength={12} autoCapitalize="characters" onChange={(e) => setKodeRef(e.target.value)} />
          </Kolom>
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" className="mt-1 size-5" checked={setuju} onChange={(e) => setSetuju(e.target.checked)} />
            <span>Saya mewakili sekolah ini dan menyetujui <Link className="tautan" href="/syarat" target="_blank">Syarat dan Ketentuan</Link> serta <Link className="tautan" href="/privasi" target="_blank">Kebijakan Privasi</Link>.</span>
          </label>
        </>)}
        <Galat>{galat}</Galat>
        <button className={tombol} disabled={pending || !setuju}>{pending ? "Memproses…" : "Buat halaman sekolah"}</button>
      </form>
      <BantuanWa konteks="sekolah" />
    </Halaman>
  );
}
