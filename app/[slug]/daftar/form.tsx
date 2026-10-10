"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { normalWa, type SekolahPublik } from "@/lib/berkas";
import { kirimPendaftaran } from "./actions";
import Unggah from "./unggah";

type Draft = { step: number; jalur: string; namaAnak: string; tglLahir: string; wa: string; isian: Record<string, string>; setuju: boolean };
type Terkirim = { nomor: string; tglLahir: string };
const KOSONG: Draft = { step: 0, jalur: "", namaAnak: "", tglLahir: "", wa: "", isian: {}, setuju: false };

const baca = <T,>(k: string): T | null => {
  try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : null; } catch { return null; }
};
const simpan = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const hapus = (k: string) => { try { localStorage.removeItem(k); } catch {} };

export default function FormDaftar({ sekolah, sitekey }: { sekolah: SekolahPublik; sitekey: string | null }) {
  const router = useRouter();
  const kd = `draft:${sekolah.slug}`, kr = `reg:${sekolah.slug}`;
  const [d, setD] = useState<Draft>(KOSONG);
  const [terkirim, setTerkirim] = useState<Terkirim | null>(null);
  const [galat, setGalat] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const siap = useRef(false);

  // pulihkan draf dan pendaftaran yang belum selesai unggah (sinyal putus / HP tertutup)
  useEffect(() => {
    const dr = baca<Draft>(kd), rg = baca<Terkirim>(kr);
    /* eslint-disable react-hooks/set-state-in-effect -- membaca localStorage hanya bisa di klien */
    if (dr) setD({ ...KOSONG, ...dr });
    if (rg) setTerkirim(rg);
    /* eslint-enable react-hooks/set-state-in-effect */
    siap.current = true;
  }, [kd, kr]);
  useEffect(() => { if (siap.current) simpan(kd, d); }, [d, kd]);

  useEffect(() => {
    if (!sitekey) return;
    (window as unknown as { onTurnstile?: (t: string) => void }).onTurnstile = setToken;
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    s.async = true;
    document.head.appendChild(s);
    return () => s.remove();
  }, [sitekey]);

  const jalur = sekolah.jalur.find((j) => j.id === d.jalur);
  const syarat = jalur?.syarat_berkas ?? [];
  const langkah = ["Data anak", ...(sekolah.form.length ? ["Data tambahan"] : []), "Tinjau"];
  const set = (p: Partial<Draft>) => setD((x) => ({ ...x, ...p }));

  function valid(): string {
    const nama = langkah[d.step];
    if (nama === "Data anak") {
      if (sekolah.jalur.length && !d.jalur) return "Pilih jalur pendaftaran.";
      if (d.namaAnak.trim().length < 2) return "Isi nama lengkap anak.";
      if (!d.tglLahir) return "Isi tanggal lahir anak.";
      if (!normalWa(d.wa)) return "Isi nomor WhatsApp orang tua yang benar.";
    }
    if (nama === "Data tambahan") {
      const f = sekolah.form.find((x) => x.wajib && !d.isian[x.id]?.trim());
      if (f) return `Isi "${f.label}".`;
    }
    return "";
  }
  const lanjut = () => { const e = valid(); setGalat(e); if (!e) set({ step: d.step + 1 }); };

  function kirim() {
    if (!d.setuju) return setGalat("Centang persetujuan privasi untuk melanjutkan.");
    if (sitekey && !token) return setGalat("Selesaikan verifikasi di atas.");
    setGalat("");
    start(async () => {
      try {
        const r = await kirimPendaftaran(sekolah.slug, {
          jalur: d.jalur || null, namaAnak: d.namaAnak, tglLahir: d.tglLahir, wa: d.wa,
          isian: d.isian, setuju: d.setuju, turnstile: token,
        });
        if (!r.ok) return setGalat(r.pesan);
        const t = { nomor: r.nomor!, tglLahir: d.tglLahir };
        hapus(kd);
        if (syarat.length) { simpan(kr, t); setTerkirim(t); } else selesai(t.nomor);
      } catch {
        setGalat("Koneksi terputus. Data Anda aman di HP ini, coba kirim lagi.");
      }
    });
  }
  function selesai(nomor: string) { hapus(kr); router.push(`/${sekolah.slug}/sukses?nomor=${encodeURIComponent(nomor)}`); }

  const gaya = { "--aksen": sekolah.warna_aksen } as React.CSSProperties;
  const input = "h-12 w-full rounded-lg border px-3 text-base";

  if (terkirim) {
    return (
      <main style={gaya} className="mx-auto max-w-md space-y-4 p-4 pb-24">
        <h1 className="text-xl font-semibold">Unggah berkas</h1>
        <p>Nomor pendaftaran Anda <b>{terkirim.nomor}</b>. Catat nomor ini. Lengkapi berkas berikut.</p>
        <Unggah slug={sekolah.slug} nomor={terkirim.nomor} tglLahir={terkirim.tglLahir} syarat={syarat}
          sudah={[]} format={sekolah.format_berkas} onSelesai={() => selesai(terkirim.nomor)} />
      </main>
    );
  }

  const nama = langkah[d.step];
  return (
    <main style={gaya} className="mx-auto max-w-md p-4 pb-28">
      <h1 className="text-lg font-semibold">{sekolah.nama}</h1>
      <p className="text-sm text-neutral-600">Langkah {d.step + 1} dari {langkah.length}: {nama}</p>
      <div className="mt-1 h-1 rounded bg-neutral-200"><div className="h-1 rounded bg-[var(--aksen)]" style={{ width: `${((d.step + 1) / langkah.length) * 100}%` }} /></div>

      <div className="mt-5 space-y-4">
        {nama === "Data anak" && (<>
          {sekolah.jalur.length > 0 && (
            <label className="block"><span className="text-sm font-medium">Jalur pendaftaran</span>
              <select className={input} value={d.jalur} onChange={(e) => set({ jalur: e.target.value })}>
                <option value="">Pilih jalur</option>
                {sekolah.jalur.map((j) => <option key={j.id} value={j.id}>{j.nama}</option>)}
              </select></label>
          )}
          {syarat.length > 0 && <p className="rounded-lg bg-neutral-100 p-3 text-sm">Berkas yang diminta: {syarat.join(", ")}. Diunggah setelah data dikirim.</p>}
          <label className="block"><span className="text-sm font-medium">Nama lengkap anak</span>
            <input className={input} value={d.namaAnak} maxLength={100} autoComplete="off" onChange={(e) => set({ namaAnak: e.target.value })} /></label>
          <label className="block"><span className="text-sm font-medium">Tanggal lahir anak</span>
            <input type="date" className={input} value={d.tglLahir} max={new Date().toISOString().slice(0, 10)} onChange={(e) => set({ tglLahir: e.target.value })} /></label>
          <label className="block"><span className="text-sm font-medium">WhatsApp orang tua</span>
            <input className={input} type="tel" inputMode="tel" autoComplete="tel" placeholder="081234567890" value={d.wa} maxLength={20} onChange={(e) => set({ wa: e.target.value })} />
            <span className="mt-1 block text-xs text-neutral-600">Dipakai panitia untuk menghubungi Anda.</span></label>
        </>)}

        {nama === "Data tambahan" && sekolah.form.map((f) => (
          <label key={f.id} className="block"><span className="text-sm font-medium">{f.label}{f.wajib ? "" : " (opsional)"}</span>
            {f.tipe === "paragraf" ? <textarea className="min-h-24 w-full rounded-lg border p-3 text-base" maxLength={500} value={d.isian[f.id] ?? ""} onChange={(e) => set({ isian: { ...d.isian, [f.id]: e.target.value } })} />
            : f.tipe === "pilihan" ? <select className={input} value={d.isian[f.id] ?? ""} onChange={(e) => set({ isian: { ...d.isian, [f.id]: e.target.value } })}><option value="">Pilih</option>{f.opsi?.map((o) => <option key={o}>{o}</option>)}</select>
            : <input className={input} type={f.tipe === "angka" ? "number" : f.tipe === "tanggal" ? "date" : "text"} inputMode={f.tipe === "angka" ? "numeric" : undefined} maxLength={500} value={d.isian[f.id] ?? ""} onChange={(e) => set({ isian: { ...d.isian, [f.id]: e.target.value } })} />}
          </label>
        ))}

        {nama === "Tinjau" && (<>
          <dl className="divide-y rounded-lg border text-sm">
            {jalur && <Baris k="Jalur" v={jalur.nama} />}
            <Baris k="Nama anak" v={d.namaAnak} />
            <Baris k="Tanggal lahir" v={d.tglLahir} />
            <Baris k="WhatsApp" v={d.wa} />
            {sekolah.form.filter((f) => d.isian[f.id]).map((f) => <Baris key={f.id} k={f.label} v={d.isian[f.id]} />)}
          </dl>
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" className="mt-1 size-5" checked={d.setuju} onChange={(e) => set({ setuju: e.target.checked })} />
            <span>Saya menyetujui data anak diproses {sekolah.nama} hanya untuk keperluan SPMB, sesuai kebijakan privasi.</span>
          </label>
          {sitekey && <div className="cf-turnstile" data-sitekey={sitekey} data-callback="onTurnstile" />}
        </>)}
      </div>

      {galat && <p role="alert" className="mt-4 text-sm text-red-700">{galat}</p>}

      <div className="fixed inset-x-0 bottom-0 flex gap-2 border-t bg-white p-3">
        {d.step > 0 && <button type="button" className="h-12 rounded-lg border px-5" onClick={() => { setGalat(""); set({ step: d.step - 1 }); }}>Kembali</button>}
        {nama !== "Tinjau"
          ? <button type="button" className="h-12 flex-1 rounded-lg bg-[var(--aksen)] font-medium text-white" onClick={lanjut}>Lanjut</button>
          : <button type="button" disabled={pending} className="h-12 flex-1 rounded-lg bg-[var(--aksen)] font-medium text-white disabled:opacity-50" onClick={kirim}>{pending ? "Mengirim…" : "Kirim pendaftaran"}</button>}
      </div>
    </main>
  );
}

const Baris = ({ k, v }: { k: string; v: string }) => (
  <div className="flex justify-between gap-4 p-3"><dt className="text-neutral-600">{k}</dt><dd className="text-right font-medium">{v}</dd></div>
);
