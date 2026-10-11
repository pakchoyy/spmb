"use client";

import Link from "next/link";
import { RefreshCw, TriangleAlert } from "lucide-react";
import { Halaman } from "@/components/ui";
import { BantuanWa } from "@/components/bantuan-wa";

export default function Galat({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Halaman ikon={TriangleAlert} judul="Ada yang tidak beres" sub="Halaman gagal dimuat. Biasanya karena sinyal; coba sekali lagi.">
      <button onClick={reset} className="btn btn-utama w-full"><RefreshCw className="size-5" aria-hidden /> Coba lagi</button>
      <Link href="/" className="btn btn-lembut w-full">Ke beranda</Link>
      <BantuanWa />
    </Halaman>
  );
}
