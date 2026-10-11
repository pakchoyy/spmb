"use client";

import { Galat } from "@/components/ui";
import { useAksi } from "@/components/aksi";
import { urlAset } from "@/lib/berkas";
import { hapusGambar, unggahGambar } from "./actions";

type Jenis = "logo" | "banner" | "galeri";

/** Perkecil dan ubah ke WebP di browser sebelum diunggah, supaya ringan di HP orang tua. */
async function siapkan(file: File, sisiMaks: number): Promise<File> {
  const bmp = await createImageBitmap(file);
  const skala = Math.min(1, sisiMaks / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * skala);
  c.height = Math.round(bmp.height * skala);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  const blob = await new Promise<Blob | null>((r) => c.toBlob(r, "image/webp", 0.82));
  if (!blob) return file;
  return new File([blob], "gambar.webp", { type: "image/webp" });
}

function Pilih({ jenis, label, sisi, aksi }: { jenis: Jenis; label: string; sisi: number; aksi: ReturnType<typeof useAksi> }) {
  return (
    <label className="flex h-12 cursor-pointer items-center justify-center rounded-lg border border-dashed text-sm font-semibold">
      {aksi.pending ? "Memproses…" : label}
      <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={aksi.pending}
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (!f) return;
          aksi.jalankan(async () => {
            const kecil = await siapkan(f, sisi);
            const fd = new FormData();
            fd.set("file", kecil);
            return unggahGambar(jenis, fd);
          });
        }} />
    </label>
  );
}

export default function GambarForm({ logo, banner, galeri, bisaUbah }: {
  logo: string | null; banner: string | null; galeri: { id: string; path: string }[]; bisaUbah: boolean;
}) {
  const aLogo = useAksi(), aBanner = useAksi(), aGaleri = useAksi(), aHapus = useAksi();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold">Logo</h3>
        {logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={urlAset(logo)!} alt="Logo" className="mt-2 size-20 rounded-lg border bg-white object-contain p-1" />
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
        {banner && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={urlAset(banner)!} alt="Banner" className="mt-2 aspect-[16/7] w-full rounded-lg border object-cover" />
        )}
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
              <img src={urlAset(g.path)!} alt="" loading="lazy" className="aspect-square w-full rounded-lg border object-cover" />
              {bisaUbah && (
                <button aria-label="Hapus foto" className="absolute right-1 top-1 size-7 rounded-full bg-black/70 text-white"
                  onClick={() => aHapus.jalankan(() => hapusGambar("galeri", g.id))}>×</button>
              )}
            </div>
          ))}
        </div>
        {bisaUbah && galeri.length < 6 && <div className="mt-2"><Pilih jenis="galeri" label="Tambah foto" sisi={1280} aksi={aGaleri} /></div>}
        <Galat>{aGaleri.galat || aHapus.galat}</Galat>
      </div>
    </div>
  );
}
