"use client";

import { useEffect } from "react";

/** Mendaftarkan service worker (hanya di produksi, agar tidak mengganggu pengembangan). */
export default function RegistrasiSw() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  return null;
}
