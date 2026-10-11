"use client";

import { useState, useTransition } from "react";
import { ClipboardCheck } from "lucide-react";
import Unggah from "../daftar/unggah";
import { kirimDaftarUlang, type DaftarUlang } from "./actions";

const tgl = (iso: string) => new Date(iso).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Jakarta" });

export default function FormDaftarUlang({ slug, nomor, du, sudahPada, berkas, format }: {
  slug: string; nomor: string; du: DaftarUlang; sudahPada: string | null; berkas: string[]; format: string[];
}) {
  const [lahir, setLahir] = useState("");
  const [isi, setIsi] = useState<Record<string, string>>({});
  const [galat, setGalat] = useState("");
  const [selesai, setSelesai] = useState(sudahPada);
  const [pending, start] = useTransition();
  const input = "h-12 w-full rounded-xl border border-neutral-300 bg-white px-3 text-base";
  const isian = du.isian ?? [], syarat = du.berkas ?? [];

  return (
    <section className="space-y-3 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 print:hidden">
      <h2 className="flex items-center gap-2 font-serif text-xl font-bold"><ClipboardCheck className="size-6 text-[var(--mint)]" aria-hidden />Daftar ulang</h2>
      {du.info && <p className="whitespace-pre-line text-sm text-neutral-700">{du.info}</p>}
      {du.tenggat && <p className="text-sm">Batas: <b>{tgl(du.tenggat)} WIB</b></p>}
      {selesai && <p className="rounded-2xl bg-[var(--mint-muda)] p-3 text-sm font-semibold text-[#0b6b52]">✓ Daftar ulang terkirim {tgl(selesai)}. Anda masih bisa memperbarui isian.</p>}
      <form className="space-y-3" onSubmit={(e) => {
        e.preventDefault(); setGalat("");
        start(async () => {
          const r = await kirimDaftarUlang(slug, nomor, lahir, isi).catch(() => ({ ok: false as const, pesan: "Koneksi terputus. Coba lagi." }));
          if (r.ok) setSelesai(new Date().toISOString()); else setGalat(r.pesan);
        });
      }}>
        <label className="block"><span className="mb-1 block text-sm font-semibold">Tanggal lahir anak (untuk keamanan)</span>
          <input type="date" required className={input} value={lahir} onChange={(e) => setLahir(e.target.value)} /></label>
        {isian.map((k) => (
          <label key={k} className="block"><span className="mb-1 block text-sm font-semibold">{k}</span>
            <input className={input} required maxLength={500} value={isi[k] ?? ""} onChange={(e) => setIsi({ ...isi, [k]: e.target.value })} /></label>
        ))}
        {galat && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{galat}</p>}
        <button className="btn btn-utama w-full" disabled={pending}>{pending ? "Mengirim…" : selesai ? "Perbarui daftar ulang" : "Kirim daftar ulang"}</button>
      </form>
      {syarat.length > 0 && (lahir
        ? <Unggah slug={slug} nomor={nomor} tglLahir={lahir} syarat={syarat} sudah={berkas} format={format} />
        : <p className="text-sm text-neutral-600">Isi tanggal lahir di atas untuk mengunggah berkas daftar ulang: {syarat.join(", ")}.</p>)}
    </section>
  );
}
