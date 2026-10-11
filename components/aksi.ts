"use client";

import { useState, useTransition } from "react";
import { tampilkanToast } from "./toast";

type Hasil = { ok: true } | { ok: false; pesan: string };

/** Menjalankan Server Action dengan status proses, pesan galat, dan penanda "tersimpan". */
export function useAksi() {
  const [pending, start] = useTransition();
  const [galat, setGalat] = useState("");
  const [tersimpan, setTersimpan] = useState(false);
  const jalankan = (fn: () => Promise<Hasil>, sukses?: () => void) => {
    setGalat(""); setTersimpan(false);
    start(async () => {
      try {
        const r = await fn();
        if (r.ok) { setTersimpan(true); tampilkanToast("Tersimpan"); sukses?.(); }
        else { setGalat(r.pesan); tampilkanToast(r.pesan, true); }
      } catch { setGalat("Koneksi terputus. Coba lagi."); tampilkanToast("Koneksi terputus. Coba lagi.", true); }
    });
  };
  return { pending, galat, tersimpan, jalankan };
}
