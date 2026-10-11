"use client";

import { useState } from "react";
import { Bug, Lightbulb, MessageSquareHeart } from "lucide-react";
import { Galat, tombol } from "@/components/ui";
import { useAksi } from "@/components/aksi";
import { kirimMasukan } from "./actions";

const JENIS = [
  { id: "fitur", label: "Minta fitur", ikon: Lightbulb, warna: "var(--kuning-muda)", contoh: "Contoh: tolong tambah jalur pindahan dengan syarat surat mutasi." },
  { id: "saran", label: "Kritik & saran", ikon: MessageSquareHeart, warna: "var(--ungu-muda)", contoh: "Apa yang kurang nyaman atau bisa dibuat lebih mudah?" },
  { id: "masalah", label: "Lapor masalah", ikon: Bug, warna: "var(--oranye-muda)", contoh: "Ceritakan apa yang terjadi, di halaman mana, dan pakai HP apa." },
] as const;

export default function FormMasukan() {
  const [jenis, setJenis] = useState<string>("fitur");
  const [isi, setIsi] = useState("");
  const { pending, galat, tersimpan, jalankan } = useAksi();
  const j = JENIS.find((x) => x.id === jenis)!;

  return (
    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); jalankan(() => kirimMasukan(jenis, isi), () => setIsi("")); }}>
      <div className="grid grid-cols-3 gap-2">
        {JENIS.map((x) => (
          <button key={x.id} type="button" aria-pressed={jenis === x.id} onClick={() => setJenis(x.id)}
            className={`flex flex-col items-center gap-1 rounded-2xl p-3 text-center text-sm font-semibold ring-2 ${jenis === x.id ? "ring-[var(--biru)]" : "ring-transparent"}`}
            style={{ background: x.warna }}>
            <x.ikon className="size-6" aria-hidden />{x.label}
          </button>
        ))}
      </div>
      <textarea className="min-h-36 w-full rounded-2xl border border-neutral-300 bg-white p-3 text-base" maxLength={1000}
        placeholder={j.contoh} value={isi} onChange={(e) => setIsi(e.target.value)} aria-label="Isi masukan" />
      <Galat>{galat}</Galat>
      {tersimpan && <p className="rounded-2xl bg-[var(--mint-muda)] p-3 text-sm font-semibold text-[#0b6b52]">Terima kasih! Masukan Anda sudah kami terima dan akan dibaca.</p>}
      <button className={tombol} disabled={pending}>{pending ? "Mengirim…" : "Kirim"}</button>
    </form>
  );
}
