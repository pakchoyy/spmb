"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, TriangleAlert } from "lucide-react";
import { Halaman } from "@/components/ui";
import { BantuanWa } from "@/components/bantuan-wa";

export default function Galat({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  // laporkan ke /super/galat (tanpa data pribadi: hanya pesan, alamat halaman, dan stack)
  useEffect(() => {
    fetch("/api/galat", { method: "POST", keepalive: true, body: JSON.stringify({
      pesan: `${error.message}${error.digest ? ` [${error.digest}]` : ""}`, url: location.pathname, detail: `${navigator.userAgent}\n${error.stack ?? ""}`.slice(0, 3500),
    }) }).catch(() => {});
  }, [error]);
  return (
    <Halaman ikon={TriangleAlert} judul="Ada yang tidak beres" sub="Halaman gagal dimuat. Biasanya karena sinyal; coba sekali lagi.">
      <button onClick={reset} className="btn btn-utama w-full"><RefreshCw className="size-5" aria-hidden /> Coba lagi</button>
      <Link href="/" className="btn btn-lembut w-full">Ke beranda</Link>
      <BantuanWa />
    </Halaman>
  );
}
