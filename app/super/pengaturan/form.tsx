"use client";

import { useState } from "react";
import { Galat, Kolom, input, tombol } from "@/components/ui";
import { useAksi } from "@/components/aksi";
import { simpanPengaturan } from "../actions";

export default function Form({ awal }: { awal: { lynk: string; harga: string; komisi: string; batas: string } }) {
  const [f, setF] = useState(awal);
  const { pending, galat, tersimpan, jalankan } = useAksi();
  const num = (k: "harga" | "komisi" | "batas") => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value.replace(/\D/g, "") });
  return (
    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); jalankan(() => simpanPengaturan(f)); }}>
      <Kolom label="Link produk di BGY Store" bantu={<span className="text-neutral-600">Tombol Beli di halaman langganan sekolah, mis. https://bgy-store.vercel.app/produk/…</span>}>
        <input className={input} inputMode="url" value={f.lynk} placeholder="https://bgy-store.vercel.app/produk/…" onChange={(e) => setF({ ...f, lynk: e.target.value })} />
      </Kolom>
      <Kolom label="Harga paket 1 tahun (Rp)"><input className={input} inputMode="numeric" value={f.harga} onChange={num("harga")} /></Kolom>
      <Kolom label="Komisi per sekolah berlangganan (Rp)" bantu={<span className="text-neutral-600">Nominal dikunci per transaksi; perubahan hanya berlaku untuk pembayaran berikutnya.</span>}>
        <input className={input} inputMode="numeric" value={f.komisi} onChange={num("komisi")} />
      </Kolom>
      <Kolom label="Batas pencairan (Rp)"><input className={input} inputMode="numeric" value={f.batas} onChange={num("batas")} /></Kolom>
      <Galat>{galat}</Galat>
      {tersimpan && <p className="text-sm font-semibold text-green-700">Tersimpan ✓</p>}
      <button className={tombol} disabled={pending}>{pending ? "Menyimpan…" : "Simpan"}</button>
    </form>
  );
}
