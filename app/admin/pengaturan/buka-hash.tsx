"use client";

import { useEffect } from "react";

/** Membuka bagian akordeon sesuai #hash di alamat (mis. dari Panduan awal). */
export default function BukaHash() {
  useEffect(() => {
    const buka = () => {
      const el = document.getElementById(location.hash.slice(1));
      if (el instanceof HTMLDetailsElement) { el.open = true; el.scrollIntoView({ block: "start" }); }
    };
    buka();
    addEventListener("hashchange", buka);
    return () => removeEventListener("hashchange", buka);
  }, []);
  return null;
}
