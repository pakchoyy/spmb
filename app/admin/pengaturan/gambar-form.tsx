"use client";

import { useState } from "react";
import { Galat } from "@/components/ui";
import { useAksi } from "@/components/aksi";
import { urlAset } from "@/lib/berkas";
import { hapusGambar, unggahGambar } from "./actions";
import AturBanner, { type BannerAtur } from "./atur-banner";

type Jenis = "logo" | "banner" | "galeri";

/** Perkecil dan ubah ke WebP di browser sebelum diunggah, supaya ringan di HP orang tua. */
export async function siapkan(file: File, sisiMaks: number): Promise<File> {
  // Format yang tidak bisa dibaca browser (mis. HEIC) dikirim apa adanya; server yang menolak dengan pesan jelas.
  const bmp = await createImageBitmap(file).catch(() => null);
  if (!bmp) return file;
  const skala = Math.min(1, sisiMaks / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * skala);
  c.height = Math.round(bmp.height * skala);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  const blob = await new Promise<Blob | null>((r) => c.toBlob(r, "image/webp", 0.82));
  if (!blob) return file;
  return new File([blob], "gambar.webp", { type: "image/webp" });
}

function Pilih({ jenis, label, sisi, aksi, maks = 1 }: { jenis: Jenis; label: string; sisi: number; aksi: ReturnType<typeof useAksi>; maks?: number }) {
  const [progres, setProgres] = useState("");
  return (
    <label className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--biru)]/40 bg-[var(--biru-muda)] text-[var(--biru-tua)] text-sm font-semibold">
      {aksi.pending ? (progres || "Memproses…") : label}
      <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={aksi.pending} multiple={maks > 1}
        onChange={(e) => {
          const pilihan = Array.from(e.target.files ?? []).slice(0, maks);
          e.target.value = "";
          if (!pilihan.length) return;
          aksi.jalankan(async () => {
            // Satu per satu supaya tiap kiriman tetap di bawah batas ukuran Server Action.
            for (const [i, f] of pilihan.entries()) {
              if (pilihan.length > 1) setProgres(`Mengunggah ${i + 1}/${pilihan.length}…`);
              const fd = new FormData();
              fd.set("file", await siapkan(f, sisi));
              const r = await unggahGambar(jenis, fd);
              if (!r.ok) { setProgres(""); return pilihan.length > 1 ? { ok: false as const, pesan: `Foto ke-${i + 1}: ${r.pesan}` } : r; }
            }
            setProgres("");
            return { ok: true as const };
          });
        }} />
    </label>
  );
}

export default function GambarForm({ logo, banner, bannerAtur, warna, galeri, bisaUbah }: {
  logo: string | null; banner: string | null; bannerAtur: BannerAtur; warna: string; galeri: { id: string; path: string }[]; bisaUbah: boolean;
}) {
  const aLogo = useAksi(), aBanner = useAksi(), aGaleri = useAksi(), aHapus = useAksi();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold">Logo</h3>
        {logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={urlAset(logo)!} alt="Logo" className="mt-2 size-20 rounded-2xl bg-white object-contain p-1 ring-1 ring-black/10" />
        )}
        {bisaUbah && (
          <div className="mt-2 grid gap-2">
            <Pilih jenis="logo" label={logo ? "Ganti logo" : "Pasang logo"} sisi={512} aksi={aLogo} />
            {logo && <button className="text-sm tautan" onClick={() => aHapus.jalankan(() => hapusGambar("logo"))}>Hapus logo</button>}
            <Galat>{aLogo.galat}</Galat>
          </div>
        )}
      </div>

      <div>
        <h3 className="font-semibold">Banner foto (1)</h3>
        <p className="text-sm text-neutral-600">Foto gedung atau kegiatan sekolah. Tampil samar di belakang nama sekolah.</p>
        {banner && (bisaUbah
          ? <div className="mt-2"><AturBanner key={banner} src={urlAset(banner)!} awal={bannerAtur} warna={warna} /></div>
          // eslint-disable-next-line @next/next/no-img-element
          : <img src={urlAset(banner)!} alt="Banner" className="mt-2 aspect-[16/7] w-full rounded-2xl object-cover ring-1 ring-black/10" />)}
        {bisaUbah && (
          <div className="mt-2 grid gap-2">
            <Pilih jenis="banner" label={banner ? "Ganti banner" : "Pasang banner"} sisi={1600} aksi={aBanner} />
            {banner && <button className="text-sm tautan" onClick={() => aHapus.jalankan(() => hapusGambar("banner"))}>Hapus banner</button>}
            <Galat>{aBanner.galat}</Galat>
          </div>
        )}
      </div>

      <div>
        <h3 className="font-semibold">Galeri ({galeri.length}/6)</h3>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {galeri.map((g) => (
            <div key={g.id} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={urlAset(g.path)!} alt="" loading="lazy" className="aspect-square w-full rounded-2xl object-cover ring-1 ring-black/10" />
              {bisaUbah && (
                <button aria-label="Hapus foto" className="absolute right-1 top-1 size-7 rounded-full bg-black/70 text-white"
                  onClick={() => aHapus.jalankan(() => hapusGambar("galeri", g.id))}>×</button>
              )}
            </div>
          ))}
        </div>
        {bisaUbah && galeri.length < 6 && <div className="mt-2"><Pilih jenis="galeri" label={`Tambah foto (bisa pilih ${6 - galeri.length} sekaligus)`} sisi={1280} aksi={aGaleri} maks={6 - galeri.length} /></div>}
        <Galat>{aGaleri.galat || aHapus.galat}</Galat>
      </div>
    </div>
  );
}
