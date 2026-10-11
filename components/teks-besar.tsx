"use client";

import { useEffect, useState } from "react";

const KUNCI = "yukmasuk:teks-besar";

/** Tombol A+ untuk memperbesar tulisan; pilihan disimpan di HP. */
export default function TeksBesar({ className = "" }: { className?: string }) {
  const [aktif, setAktif] = useState(false);
  useEffect(() => {
    let v = false;
    try { v = localStorage.getItem(KUNCI) === "1"; } catch {}
    document.documentElement.classList.toggle("teks-besar", v);
    setAktif(v); // eslint-disable-line react-hooks/set-state-in-effect -- membaca pilihan tersimpan di klien
  }, []);
  function ubah() {
    const v = !aktif;
    setAktif(v);
    document.documentElement.classList.toggle("teks-besar", v);
    try { localStorage.setItem(KUNCI, v ? "1" : "0"); } catch {}
  }
  return (
    <button type="button" onClick={ubah} aria-pressed={aktif} aria-label={aktif ? "Kecilkan tulisan" : "Besarkan tulisan"}
      className={`btn btn-pil font-serif ${aktif ? "bg-white text-[var(--biru)]" : "bg-white/15 text-current"} ${className}`}>
      {aktif ? "A−" : "A+"}
    </button>
  );
}
