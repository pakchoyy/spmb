"use client";

import { useEffect, useState } from "react";
import { cekSlugAksi } from "@/app/daftar/actions";
import { SLUG_RE } from "@/lib/slug";
import { HOST_APP } from "@/lib/merek";

type Cek = { slug: string; tersedia: boolean; saran: string[] };

/** Kolom alamat halaman dengan pengecekan langsung: Tersedia / Sudah dipakai + saran. */
export default function SlugField({ nilai, onUbah }: { nilai: string; onUbah: (s: string) => void }) {
  const [hasil, setHasil] = useState<Cek | null>(null);

  useEffect(() => {
    if (!SLUG_RE.test(nilai)) return;
    let batal = false;
    const t = setTimeout(async () => {
      try {
        const r = await cekSlugAksi(nilai);
        if (!batal) setHasil({ slug: nilai, ...r });
      } catch { /* koneksi putus: server tetap memeriksa saat kirim */ }
    }, 350);
    return () => { batal = true; clearTimeout(t); };
  }, [nilai]);

  const valid = SLUG_RE.test(nilai);
  const cek = hasil && hasil.slug === nilai ? hasil : null;
  return (
    <div>
      <label className="block">
        <span className="text-sm font-semibold">Alamat halaman sekolah</span>
        <div className="flex items-center rounded-xl border border-neutral-300 bg-white pl-3 focus-within:border-[var(--biru)] focus-within:ring-4 focus-within:ring-[var(--biru-muda)]">
          <span className="text-neutral-500">{HOST_APP}/</span>
          <input className="h-12 min-w-0 flex-1 rounded-xl px-1 text-base outline-none" value={nilai} maxLength={40}
            autoCapitalize="none" autoCorrect="off" spellCheck={false}
            onChange={(e) => onUbah(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} />
        </div>
      </label>
      <p className="mt-1 min-h-5 text-sm" aria-live="polite">
        {!nilai ? <span className="text-neutral-600">Huruf kecil, angka, tanda hubung; 3–40 karakter.</span>
          : !valid ? <span className="text-red-700">Minimal 3 karakter, tidak diawali atau diakhiri tanda hubung.</span>
          : !cek ? <span className="text-neutral-600">Memeriksa…</span>
          : cek.tersedia ? <span className="font-semibold text-green-700">Tersedia ✓</span>
          : <span className="text-red-700">Sudah dipakai.{" "}
              {cek.saran.map((s) => <button key={s} type="button" className="mr-2 tautan" onClick={() => onUbah(s)}>{s}</button>)}
            </span>}
      </p>
      <p className="mt-1 text-xs text-neutral-500">Alamat ini dikunci setelah dibagikan. Mengubahnya nanti lewat permintaan ke pemilik aplikasi.</p>
    </div>
  );
}
