"use client";

import { useState } from "react";
import { Galat, input } from "@/components/ui";
import { useAksi } from "@/components/aksi";
import { beriMasaAktif, gantiEmail, gantiSlug, setBatal, setNonaktif, setVerifikasi } from "../../actions";

function Kartu({ judul, bantu, children }: { judul: string; bantu?: string; children: React.ReactNode }) {
  return <section className="space-y-3 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5"><div><h2 className="font-bold">{judul}</h2>{bantu && <p className="text-sm text-neutral-600">{bantu}</p>}</div>{children}</section>;
}
const tbl = "h-12 w-full rounded-2xl border-2 font-semibold disabled:opacity-50";

export default function Aksi({ id, slug, email, dibatalkan, nonaktif, terverifikasi }: { id: string; slug: string; email: string; dibatalkan: boolean; nonaktif: boolean; terverifikasi: boolean }) {
  const [sl, setSl] = useState(slug);
  const [em, setEm] = useState(email);
  const [hari, setHari] = useState("30");
  const status = useAksi(), aSlug = useAksi(), aEmail = useAksi(), aHari = useAksi();

  return (
    <div className="space-y-4">
      <Kartu judul="Sekolah terverifikasi" bantu="Centang biru di halaman sekolah. Beri setelah NPSN dan kontak sekolah dicek.">
        <button className={`${tbl} ${terverifikasi ? "border-neutral-400" : "border-[var(--biru)] text-[var(--biru)]"}`} disabled={status.pending}
          onClick={() => status.jalankan(() => setVerifikasi(id, !terverifikasi))}>
          {terverifikasi ? "Cabut tanda terverifikasi" : "Tandai terverifikasi"}
        </button>
      </Kartu>

      <Kartu judul="Status sekolah" bantu="Batalkan bila email pembelian di Lynk tidak cocok. Sekolah tidak bisa membuka dirinya sendiri dengan kode baru.">
        <div className="grid gap-2">
          <button className={`${tbl} ${dibatalkan ? "border-green-700 text-green-800" : "border-red-700 text-red-800"}`} disabled={status.pending}
            onClick={() => confirm(dibatalkan ? "Pulihkan langganan?" : "Batalkan langganan sekolah ini?") && status.jalankan(() => setBatal(id, !dibatalkan))}>
            {dibatalkan ? "Pulihkan langganan" : "Batalkan langganan"}
          </button>
          <button className={`${tbl} ${nonaktif ? "border-green-700 text-green-800" : "border-red-700 text-red-800"}`} disabled={status.pending}
            onClick={() => confirm(nonaktif ? "Aktifkan kembali sekolah?" : "Nonaktifkan sekolah ini? Beranda admin dan form langsung ditutup.") && status.jalankan(() => setNonaktif(id, !nonaktif))}>
            {nonaktif ? "Aktifkan kembali sekolah" : "Nonaktifkan sekolah"}
          </button>
        </div>
        <Galat>{status.galat}</Galat>
      </Kartu>

      <Kartu judul="Beri masa aktif" bantu="Untuk sekolah percontohan atau kompensasi. Ditambahkan dari tanggal berakhir saat ini.">
        <div className="flex gap-2">
          <input className={input} inputMode="numeric" value={hari} onChange={(e) => setHari(e.target.value.replace(/\D/g, ""))} aria-label="Jumlah hari" />
          <button className="btn btn-utama shrink-0" disabled={aHari.pending}
            onClick={() => aHari.jalankan(() => beriMasaAktif(id, Number(hari)))}>Tambah hari</button>
        </div>
        <Galat>{aHari.galat}</Galat>{aHari.tersimpan && <p className="text-sm font-semibold text-green-700">Tersimpan ✓</p>}
      </Kartu>

      <Kartu judul="Ganti alamat halaman" bantu="Atas permintaan sekolah. Alamat lama dialihkan otomatis supaya QR yang sudah tercetak tetap hidup.">
        <input className={input} value={sl} autoCapitalize="none" spellCheck={false} onChange={(e) => setSl(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} />
        <button className="btn btn-garis w-full" disabled={aSlug.pending}
          onClick={() => sl === slug ? alert("Ketik alamat baru dulu di kolom atas.") : confirm(`Ganti /${slug} menjadi /${sl}?`) && aSlug.jalankan(() => gantiSlug(id, sl))}>Ganti alamat</button>
        <Galat>{aSlug.galat}</Galat>{aSlug.tersimpan && <p className="text-sm font-semibold text-green-700">Tersimpan ✓</p>}
      </Kartu>

      <Kartu judul="Ganti email admin" bantu="Pastikan permintaan benar dari pihak sekolah. Email baru langsung aktif tanpa konfirmasi, dan kata sandi tidak berubah.">
        <input className={input} type="email" value={em} onChange={(e) => setEm(e.target.value)} />
        <button className="btn btn-garis w-full" disabled={aEmail.pending}
          onClick={() => em.trim().toLowerCase() === email ? alert("Ketik email baru dulu di kolom atas.") : confirm(`Ganti email admin menjadi ${em}?`) && aEmail.jalankan(() => gantiEmail(id, em))}>Ganti email</button>
        <Galat>{aEmail.galat}</Galat>{aEmail.tersimpan && <p className="text-sm font-semibold text-green-700">Tersimpan ✓</p>}
      </Kartu>
    </div>
  );
}
