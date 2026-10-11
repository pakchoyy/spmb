"use client";

import { useRef } from "react";
import { Trophy } from "lucide-react";
import { Galat, Kolom, input, tombol } from "@/components/ui";
import { useAksi } from "@/components/aksi";
import { urlAset, type Prestasi } from "@/lib/berkas";
import { siapkan } from "./gambar-form";
import { hapusPrestasi, tambahPrestasi } from "./actions";

export default function PrestasiForm({ daftar, bisaUbah }: { daftar: Prestasi[]; bisaUbah: boolean }) {
  const tambah = useAksi(), hapus = useAksi();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="space-y-4">
      {daftar.length > 0 && (
        <ul className="space-y-2">
          {daftar.map((p, i) => (
            <li key={i} className="flex items-center gap-3 rounded-2xl p-2 ring-1 ring-black/10">
              {p.foto
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={urlAset(p.foto)!} alt="" className="size-14 rounded-xl object-cover" />
                : <span className="grid size-14 place-items-center rounded-xl bg-[var(--kuning-muda)]"><Trophy className="size-6 text-[#b7780a]" aria-hidden /></span>}
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{p.judul}</p>
                <p className="truncate text-sm text-neutral-600">{p.nama}</p>
              </div>
              {bisaUbah && <button className="text-sm tautan" disabled={hapus.pending} onClick={() => hapus.jalankan(() => hapusPrestasi(i))}>Hapus</button>}
            </li>
          ))}
        </ul>
      )}
      <Galat>{hapus.galat}</Galat>

      {bisaUbah && daftar.length < 12 && (
        <form ref={formRef} className="space-y-3 rounded-2xl bg-[var(--kuning-muda)]/60 p-4"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            tambah.jalankan(async () => {
              const f = fd.get("file");
              if (f instanceof File && f.size > 0) fd.set("file", await siapkan(f, 1080));
              return tambahPrestasi(fd);
            }, () => formRef.current?.reset());
          }}>
          <p className="font-bold">Tambah prestasi ({daftar.length}/12)</p>
          <fieldset disabled={tambah.pending} className="space-y-3">
            <Kolom label="Gelar"><input name="judul" className={input} maxLength={60} placeholder="Juara 1 / Medali Emas" required /></Kolom>
            <Kolom label="Nama siswa"><input name="nama" className={input} maxLength={80} required /></Kolom>
            <Kolom label="Lomba (boleh kosong)"><input name="ket" className={input} maxLength={160} placeholder="Olimpiade Sains Kota 2025" /></Kolom>
            <Kolom label="Foto (boleh kosong)"><input name="file" type="file" accept="image/jpeg,image/png,image/webp" className="text-sm" /></Kolom>
          </fieldset>
          <Galat>{tambah.galat}</Galat>
          <button className={tombol} disabled={tambah.pending}>{tambah.pending ? "Menyimpan…" : "Tambah prestasi"}</button>
        </form>
      )}
    </div>
  );
}
