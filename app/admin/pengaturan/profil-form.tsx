"use client";

import { useState } from "react";
import { Galat, Kolom, input, tombol } from "@/components/ui";
import { useAksi } from "@/components/aksi";
import { simpanProfil } from "./actions";

export type Profil = {
  nama: string; alamat: string | null; warna_aksen: string; kontak_wa: string | null; peta_url: string | null;
  instagram: string | null; keunggulan: string[]; format_berkas: string[];
};

export default function ProfilForm({ awal, bisaUbah }: { awal: Profil; bisaUbah: boolean }) {
  const [f, setF] = useState({
    nama: awal.nama, alamat: awal.alamat ?? "", warna: awal.warna_aksen, wa: awal.kontak_wa ?? "",
    peta: awal.peta_url ?? "", instagram: awal.instagram ?? "", format: awal.format_berkas,
    keunggulan: [...awal.keunggulan, "", "", "", "", ""].slice(0, 5),
  });
  const { pending, galat, tersimpan, jalankan } = useAksi();
  const set = (p: Partial<typeof f>) => setF((x) => ({ ...x, ...p }));

  return (
    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); jalankan(() => simpanProfil({ ...f, keunggulan: f.keunggulan })); }}>
      <fieldset disabled={!bisaUbah || pending} className="space-y-4">
        <Kolom label="Nama sekolah"><input className={input} value={f.nama} maxLength={150} onChange={(e) => set({ nama: e.target.value })} /></Kolom>
        <Kolom label="Alamat"><input className={input} value={f.alamat} maxLength={300} onChange={(e) => set({ alamat: e.target.value })} /></Kolom>
        <Kolom label="Warna utama halaman" bantu={<span className="text-neutral-600">Ambil dari warna logo sekolah.</span>}>
          <div className="flex items-center gap-3">
            <input type="color" className="size-12 rounded border" value={f.warna} onChange={(e) => set({ warna: e.target.value })} />
            <code>{f.warna}</code>
          </div>
        </Kolom>
        <Kolom label="WhatsApp panitia" bantu={<span className="text-neutral-600">Contoh 081234567890. Orang tua mengetuk untuk chat.</span>}>
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
