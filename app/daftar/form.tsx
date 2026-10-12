"use client";

import { InfoTrial } from "@/components/info-trial";
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MailCheck, School } from "lucide-react";
import { Galat, Halaman, Kolom, input, tombol } from "@/components/ui";
import { BantuanWa } from "@/components/bantuan-wa";
import TombolGoogle from "@/components/tombol-google";
import SlugField from "@/components/slug-field";
import { buatSlug } from "@/lib/slug";
import { daftarSekolah } from "./actions";

export default function FormDaftarSekolah({ kodeAwal, token = "", emailAwal = "" }: { kodeAwal: string; token?: string; emailAwal?: string }) {
  const [f, setF] = useState({ nama: "", slug: "", npsn: "", email: emailAwal, sandi: "", kodeRef: kodeAwal, setuju: false });
  const [slugManual, setSlugManual] = useState(false);
  const [galat, setGalat] = useState("");
  const [selesai, setSelesai] = useState(false);
  const router = useRouter();
  const [pending, start] = useTransition();
  const set = (p: Partial<typeof f>) => setF((x) => ({ ...x, ...p }));

  function kirim(e: React.FormEvent) {
    e.preventDefault();
    setGalat("");
    start(async () => {
      try {
        const r = await daftarSekolah(f);
        if (!r.ok) setGalat(r.pesan);
        else if (r.langsung) { router.push(token ? `/admin/langganan?t=${token}` : "/admin"); router.refresh(); }
        else setSelesai(true);
      } catch { setGalat("Koneksi terputus. Coba lagi."); }
    });
  }

  if (selesai) {
    return (
      <Halaman ikon={MailCheck} judul="Cek email Anda" sub={`Kami mengirim tautan konfirmasi ke ${f.email}.`}>
        <p>Klik tautan di email itu untuk mengaktifkan akun. Tidak ada email? Periksa folder spam.</p>
        <Link className="tautan" href="/masuk">Sudah konfirmasi? Masuk</Link>
      </Halaman>
    );
  }

  return (
    <Halaman ikon={School} judul="Daftarkan sekolah" sub="Buat halaman SPMB sekolah Anda. Mulai dengan masa coba 7 hari.">
      {token
        ? <p className="rounded-2xl bg-[var(--mint-muda)] p-3 text-sm text-[#0b6b52]"><b>Terima kasih sudah membeli!</b> Daftarkan sekolah dulu, setelah itu Anda langsung diarahkan untuk mengaktifkan paket.</p>
        : <InfoTrial />}
      <ol className="grid grid-cols-3 gap-2 text-center text-xs font-semibold">
        {["Isi data sekolah", "Atur halaman", "Bagikan ke orang tua"].map((t, i) => (
          <li key={t} className="rounded-xl bg-[var(--biru-muda)] px-2 py-2 text-[var(--biru-tua)]"><span className="block text-base font-bold">{i + 1}</span>{t}</li>
        ))}
      </ol>
      <TombolGoogle label="Daftar cepat dengan Google" />
      <p className="flex items-center gap-3 text-xs font-semibold text-neutral-500 before:h-px before:flex-1 before:bg-neutral-200 after:h-px after:flex-1 after:bg-neutral-200">atau isi formulir</p>
      <form onSubmit={kirim} className="space-y-4">
        <Kolom label="Nama sekolah">
          <input className={input} value={f.nama} maxLength={150} autoComplete="organization" required
            onChange={(e) => set({ nama: e.target.value, ...(slugManual ? {} : { slug: buatSlug(e.target.value) }) })} />
        </Kolom>
        <SlugField nilai={f.slug} onUbah={(s) => { setSlugManual(true); set({ slug: s }); }} />
        <Kolom label="NPSN sekolah" bantu={<span className="text-neutral-600">8 angka. Satu NPSN hanya bisa didaftarkan satu kali. Cek di referensi.data.kemdikbud.go.id bila lupa.</span>}>
          <input className={input} value={f.npsn} inputMode="numeric" maxLength={8} onChange={(e) => set({ npsn: e.target.value.replace(/\D/g, "") })} />
        </Kolom>
        <Kolom label="Email admin" bantu={<span className="text-neutral-600">Satu email untuk satu sekolah. Dipakai untuk masuk dan kode aktivasi.</span>}>
          <input className={input} type="email" value={f.email} autoComplete="email" required onChange={(e) => set({ email: e.target.value })} />
        </Kolom>
        <Kolom label="Kata sandi" bantu={<span className="text-neutral-600">Minimal 8 karakter.</span>}>
          <input className={input} type="password" value={f.sandi} minLength={8} autoComplete="new-password" required onChange={(e) => set({ sandi: e.target.value })} />
        </Kolom>
        <Kolom label="Kode ajakan (opsional)">
          <input className={input} value={f.kodeRef} maxLength={12} autoCapitalize="characters" onChange={(e) => set({ kodeRef: e.target.value })} />
        </Kolom>
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" className="mt-1 size-5" checked={f.setuju} onChange={(e) => set({ setuju: e.target.checked })} />
          <span>Saya mewakili sekolah ini dan menyetujui <Link className="tautan" href="/syarat" target="_blank">Syarat dan Ketentuan</Link> serta <Link className="tautan" href="/privasi" target="_blank">Kebijakan Privasi</Link>.</span>
        </label>
        <Galat>{galat}</Galat>
        <button className={tombol} disabled={pending || !f.setuju}>{pending ? "Memproses…" : "Buat akun sekolah"}</button>
      </form>
      <p className="text-center text-sm">Sudah punya akun? <Link className="tautan" href="/masuk">Masuk</Link></p>
      <BantuanWa konteks="sekolah" />
    </Halaman>
  );
}
