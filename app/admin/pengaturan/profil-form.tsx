"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Galat, Kolom, input, tombol } from "@/components/ui";
import { useAksi } from "@/components/aksi";
import { simpanProfil } from "./actions";

// Tema jadi: semua cukup gelap agar teks putih di header tetap terbaca.
const TEMA = [
  { nama: "Biru", warna: "#2449d8" }, { nama: "Hijau", warna: "#0f7a4f" }, { nama: "Merah", warna: "#c0262d" },
  { nama: "Ungu", warna: "#6a3fc4" }, { nama: "Toska", warna: "#0e7490" }, { nama: "Cokelat", warna: "#8a4b16" },
];

export type Profil = {
  nama: string; alamat: string | null; warna_aksen: string; kontak_wa: string | null; peta_url: string | null;
  instagram: string | null; keunggulan: string[]; format_berkas: string[]; tampil_kuota: boolean; tampil_di_beranda: boolean; tampil_jumlah: boolean; akreditasi: string | null;
};

export default function ProfilForm({ awal, bisaUbah }: { awal: Profil; bisaUbah: boolean }) {
  const [f, setF] = useState({
    nama: awal.nama, alamat: awal.alamat ?? "", warna: awal.warna_aksen, wa: awal.kontak_wa ?? "",
    peta: awal.peta_url ?? "", instagram: awal.instagram ?? "", format: awal.format_berkas, tampilKuota: awal.tampil_kuota, tampilDiBeranda: awal.tampil_di_beranda, tampilJumlah: awal.tampil_jumlah, akreditasi: awal.akreditasi ?? "",
    keunggulan: [...awal.keunggulan, "", "", "", "", ""].slice(0, 5),
  });
  const { pending, galat, tersimpan, jalankan } = useAksi();
  const set = (p: Partial<typeof f>) => setF((x) => ({ ...x, ...p }));

  return (
    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); jalankan(() => simpanProfil({ ...f, keunggulan: f.keunggulan })); }}>
      <fieldset disabled={!bisaUbah || pending} className="space-y-4">
        <Kolom label="Nama sekolah"><input className={input} value={f.nama} maxLength={150} onChange={(e) => set({ nama: e.target.value })} /></Kolom>
        <Kolom label="Alamat"><input className={input} value={f.alamat} maxLength={300} onChange={(e) => set({ alamat: e.target.value })} /></Kolom>
        <Kolom label="Akreditasi (boleh kosong)" bantu={<span className="text-neutral-600">Contoh: A (Unggul). Tampil sebagai lencana di halaman sekolah.</span>}>
          <input className={input} value={f.akreditasi} maxLength={40} placeholder="A (Unggul)" onChange={(e) => set({ akreditasi: e.target.value })} />
        </Kolom>
        <div>
          <span className="mb-1 block text-sm font-semibold">Tema warna halaman</span>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {TEMA.map((t) => {
              const pilih = f.warna.toLowerCase() === t.warna;
              return (
                <button key={t.warna} type="button" aria-pressed={pilih} onClick={() => set({ warna: t.warna })}
                  className={`overflow-hidden rounded-2xl text-left text-xs font-semibold ring-2 transition ${pilih ? "ring-[var(--foreground)]" : "ring-black/10"}`}>
                  <span className="block h-10" style={{ background: `linear-gradient(160deg, ${t.warna}, color-mix(in srgb, ${t.warna} 65%, black))` }} />
                  <span className="flex items-center justify-between px-2 py-1.5">{t.nama}{pilih && <Check className="size-4" aria-hidden />}</span>
                </button>
              );
            })}
          </div>
          <details className="mt-2 text-sm">
            <summary className="cursor-pointer text-neutral-600">Warna lain (sesuai logo)</summary>
            <div className="mt-2 flex items-center gap-3">
              <input type="color" aria-label="Pilih warna sendiri" className="size-12 cursor-pointer rounded-xl border-2 border-neutral-200" value={f.warna} onChange={(e) => set({ warna: e.target.value })} />
              <code>{f.warna}</code>
            </div>
          </details>
        </div>
        <Kolom label="WhatsApp sekolah" bantu={<span className="text-neutral-600">Contoh 081234567890. Orang tua mengetuk untuk chat.</span>}>
          <input className={input} inputMode="tel" value={f.wa} onChange={(e) => set({ wa: e.target.value })} />
        </Kolom>
        <Kolom label="Link peta (Google Maps)"><input className={input} inputMode="url" value={f.peta} placeholder="https://maps.app.goo.gl/…" onChange={(e) => set({ peta: e.target.value })} /></Kolom>
        <Kolom label="Instagram"><input className={input} value={f.instagram} placeholder="@namasekolah" onChange={(e) => set({ instagram: e.target.value })} /></Kolom>

        <div>
          <span className="text-sm font-semibold">Keunggulan sekolah (0–5)</span>
          <div className="mt-1 space-y-2">
            {f.keunggulan.map((k, i) => (
              <input key={i} className={input} value={k} maxLength={120} placeholder={`Keunggulan ${i + 1}`}
                onChange={(e) => set({ keunggulan: f.keunggulan.map((x, n) => (n === i ? e.target.value : x)) })} />
            ))}
          </div>
        </div>

        <div className="space-y-2 rounded-2xl bg-[var(--biru-muda)] p-4">
          <label className="flex items-start gap-3"><input type="checkbox" className="mt-1 size-5" checked={f.tampilKuota} onChange={(e) => set({ tampilKuota: e.target.checked })} />
            <span><b>Tampilkan sisa kuota</b><span className="block text-sm text-neutral-600">Orang tua melihat &ldquo;tersisa 12&rdquo; di setiap jalur.</span></span></label>
          <label className="flex items-start gap-3"><input type="checkbox" className="mt-1 size-5" checked={f.tampilJumlah} onChange={(e) => set({ tampilJumlah: e.target.checked })} />
            <span><b>Tampilkan jumlah pendaftar</b><span className="block text-sm text-neutral-600">Orang tua melihat &ldquo;120 calon siswa sudah mendaftar&rdquo;. Muncul setelah ada 5 pendaftar.</span></span></label>
          <label className="flex items-start gap-3"><input type="checkbox" className="mt-1 size-5" checked={f.tampilDiBeranda} onChange={(e) => set({ tampilDiBeranda: e.target.checked })} />
            <span><b>Tampilkan sekolah di beranda SPMB Zone</b><span className="block text-sm text-neutral-600">Nama dan logo ikut di deretan sekolah pengguna (hanya saat berlangganan).</span></span></label>
        </div>
        <div>
          <span className="text-sm font-semibold">Format berkas yang diterima</span>
          <div className="mt-1 flex gap-4">
            {["pdf", "jpg", "png"].map((x) => (
              <label key={x} className="flex items-center gap-2">
                <input type="checkbox" className="size-5" checked={f.format.includes(x)}
                  onChange={(e) => set({ format: e.target.checked ? [...f.format, x] : f.format.filter((y) => y !== x) })} />
                {x.toUpperCase()}
              </label>
            ))}
          </div>
          <p className="mt-1 text-xs text-neutral-500">Ukuran maksimal 2 MB per berkas, tidak bisa diubah.</p>
        </div>
      </fieldset>
      <Galat>{galat}</Galat>
      {tersimpan && <p className="text-sm font-semibold text-green-700">Tersimpan ✓</p>}
      {bisaUbah && <button className={tombol} disabled={pending}>{pending ? "Menyimpan…" : "Simpan profil"}</button>}
    </form>
  );
}
