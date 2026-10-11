"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { normalWa, type SekolahPublik } from "@/lib/berkas";
import { kirimPendaftaran } from "./actions";
import Unggah from "./unggah";
import { Check, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import TeksBesar from "@/components/teks-besar";

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
    // nomor WA dari pendaftaran sebelumnya di HP ini (mis. adik-kakak) diisikan otomatis
    const waLama = baca<string>("yukmasuk:wa");
    if (dr) setD({ ...KOSONG, ...dr });
    else if (waLama) setD({ ...KOSONG, wa: waLama });
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
        simpan("yukmasuk:wa", d.wa);
        if (syarat.length) { simpan(kr, t); setTerkirim(t); } else selesai(t.nomor);
      } catch {
        setGalat("Koneksi terputus. Data Anda aman di HP ini, coba kirim lagi.");
      }
    });
  }
  function selesai(nomor: string) { hapus(kr); router.push(`/${sekolah.slug}/sukses?nomor=${encodeURIComponent(nomor)}`); }

  const gaya = { "--aksen": sekolah.warna_aksen } as React.CSSProperties;
  const input = "h-12 w-full rounded-xl border border-neutral-300 bg-white px-3 text-base outline-none focus:border-[var(--aksen)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--aksen)_15%,white)]";
  const kepala = (
    <div className="px-4 pb-6 pt-4 text-white" style={{ background: "linear-gradient(160deg, var(--aksen), color-mix(in srgb, var(--aksen) 65%, black))" }}>
      <div className="mx-auto flex max-w-md items-center justify-between gap-2">
        <a href={`/${sekolah.slug}`} className="flex items-center gap-1 text-sm font-semibold text-white/90"><ChevronLeft className="size-4" aria-hidden />{sekolah.nama}</a>
        <TeksBesar />
      </div>
    </div>
  );

  if (terkirim) {
    return (
      <div style={gaya}>{kepala}
      <main className="mx-auto -mt-3 max-w-md space-y-4 px-4 pb-24">
        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <p className="flex items-center gap-2 font-bold text-[#0b6b52]"><CheckCircle2 className="size-5" aria-hidden />Data terkirim</p>
          <p className="mt-2 text-sm text-neutral-600">Nomor pendaftaran</p>
          <p className="font-mono text-2xl font-bold tracking-wider">{terkirim.nomor}</p>
          <p className="mt-2 text-sm">Satu langkah lagi: unggah berkas di bawah ini.</p>
        </div>
        <Unggah slug={sekolah.slug} nomor={terkirim.nomor} tglLahir={terkirim.tglLahir} syarat={syarat}
          sudah={[]} format={sekolah.format_berkas} onSelesai={() => selesai(terkirim.nomor)} />
      </main></div>
    );
  }

  const nama = langkah[d.step];
  return (
    <div style={gaya}>{kepala}
    <main className="mx-auto -mt-3 max-w-md px-4 pb-28">
      <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
      <h1 className="font-serif text-xl font-bold">Formulir pendaftaran</h1>
      <ol className="mt-4 flex items-start" aria-label={`Langkah ${d.step + 1} dari ${langkah.length}`}>
        {langkah.map((l, i) => (
          <li key={l} className="flex flex-1 flex-col items-center gap-1 text-center text-xs font-semibold">
            <span className={`grid size-8 place-items-center rounded-full text-sm font-bold ${i <= d.step ? "text-white" : "bg-neutral-200 text-neutral-500"}`}
              style={i <= d.step ? { background: "var(--aksen)" } : undefined} aria-current={i === d.step ? "step" : undefined}>
              {i < d.step ? <Check className="size-4" aria-hidden /> : i + 1}
            </span>
            <span className={i === d.step ? "" : "text-neutral-500"}>{l}</span>
          </li>
        ))}
      </ol>

      <div className="mt-5 space-y-4">
        {nama === "Data anak" && (<>
          {sekolah.jalur.length > 0 && (
            <fieldset>
              <legend className="mb-1 text-sm font-semibold">Pilih jalur pendaftaran</legend>
              <div className="grid grid-cols-2 gap-2">
                {sekolah.jalur.map((j) => (
                  <label key={j.id} className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 p-3 font-semibold ${d.jalur === j.id ? "" : "border-neutral-200"}`}
                    style={d.jalur === j.id ? { borderColor: "var(--aksen)", background: "color-mix(in srgb, var(--aksen) 8%, white)" } : undefined}>
                    <input type="radio" name="jalur" className="size-4 accent-[var(--aksen)]" checked={d.jalur === j.id} onChange={() => set({ jalur: j.id })} />{j.nama}
                  </label>
                ))}
              </div>
            </fieldset>
          )}
          {syarat.length > 0 && <p className="rounded-xl bg-[var(--kuning-muda)] p-3 text-sm"><b>Siapkan berkas:</b> {syarat.join(", ")}. Diunggah setelah data dikirim.</p>}
          <label className="block"><span className="mb-1 block text-sm font-semibold">Nama lengkap anak</span>
            <input className={input} placeholder="Contoh: Budi Santoso" value={d.namaAnak} maxLength={100} autoComplete="off" onChange={(e) => set({ namaAnak: e.target.value })} /></label>
          <label className="block"><span className="mb-1 block text-sm font-semibold">Tanggal lahir anak</span>
            <input type="date" className={input} value={d.tglLahir} max={new Date().toISOString().slice(0, 10)} onChange={(e) => set({ tglLahir: e.target.value })} /></label>
          <label className="block"><span className="mb-1 block text-sm font-semibold">Nomor WhatsApp orang tua</span>
            <input className={input} type="tel" inputMode="tel" autoComplete="tel" placeholder="081234567890" value={d.wa} maxLength={20} onChange={(e) => set({ wa: e.target.value })} />
            <span className="mt-1 block text-sm text-neutral-600">Sekolah akan menghubungi Anda lewat nomor ini.</span></label>
        </>)}

        {nama === "Data tambahan" && sekolah.form.map((f) => (
          <label key={f.id} className="block"><span className="mb-1 block text-sm font-semibold">{f.label}{f.wajib ? "" : " (boleh dikosongkan)"}</span>
            {f.tipe === "paragraf" ? <textarea className="min-h-24 w-full rounded-xl border border-neutral-300 p-3 text-base" maxLength={500} value={d.isian[f.id] ?? ""} onChange={(e) => set({ isian: { ...d.isian, [f.id]: e.target.value } })} />
            : f.tipe === "pilihan" ? <select className={input} value={d.isian[f.id] ?? ""} onChange={(e) => set({ isian: { ...d.isian, [f.id]: e.target.value } })}><option value="">Pilih</option>{f.opsi?.map((o) => <option key={o}>{o}</option>)}</select>
            : <input className={input} type={f.tipe === "angka" ? "number" : f.tipe === "tanggal" ? "date" : "text"} inputMode={f.tipe === "angka" ? "numeric" : undefined} maxLength={500} value={d.isian[f.id] ?? ""} onChange={(e) => set({ isian: { ...d.isian, [f.id]: e.target.value } })} />}
          </label>
        ))}

        {nama === "Tinjau" && (<>
          <p className="text-sm text-neutral-600">Periksa lagi sebelum dikirim. Ketuk Kembali bila ada yang salah.</p>
          <dl className="divide-y rounded-2xl bg-neutral-50 text-sm ring-1 ring-black/5">
            {jalur && <Baris k="Jalur" v={jalur.nama} />}
            <Baris k="Nama anak" v={d.namaAnak} />
            <Baris k="Tanggal lahir" v={d.tglLahir ? new Date(d.tglLahir + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : ""} />
            <Baris k="WhatsApp" v={d.wa} />
            {sekolah.form.filter((f) => d.isian[f.id]).map((f) => <Baris key={f.id} k={f.label} v={d.isian[f.id]} />)}
          </dl>
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" className="mt-1 size-5" checked={d.setuju} onChange={(e) => set({ setuju: e.target.checked })} />
            <span>Saya orang tua/wali anak ini dan menyetujui data anak diproses {sekolah.nama} hanya untuk keperluan SPMB, sesuai <a className="tautan" href="/privasi" target="_blank" rel="noopener">Kebijakan Privasi</a>.</span>
          </label>
          {sitekey && <div className="cf-turnstile" data-sitekey={sitekey} data-callback="onTurnstile" />}
        </>)}
      </div>

      {galat && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{galat}</p>}
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t bg-white/95 p-3 backdrop-blur">
        <div className="mx-auto flex max-w-md gap-2">
          {d.step > 0 && <button type="button" className="btn btn-pil h-12 border-2 border-neutral-300 bg-white" onClick={() => { setGalat(""); set({ step: d.step - 1 }); }}><ChevronLeft className="size-4" aria-hidden />Kembali</button>}
          {nama !== "Tinjau"
            ? <button type="button" className="btn h-12 flex-1 text-white" style={{ background: "var(--aksen)" }} onClick={lanjut}>Lanjut <ChevronRight className="size-5" aria-hidden /></button>
            : <button type="button" disabled={pending} className="btn h-12 flex-1 text-white" style={{ background: "var(--aksen)" }} onClick={kirim}>{pending ? "Mengirim…" : "Kirim pendaftaran"}</button>}
        </div>
      </div>
    </main></div>
  );
}

const Baris = ({ k, v }: { k: string; v: string }) => (
  <div className="flex justify-between gap-4 p-3"><dt className="text-neutral-600">{k}</dt><dd className="text-right font-medium">{v}</dd></div>
);
