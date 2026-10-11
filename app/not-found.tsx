import Link from "next/link";
import { SearchX } from "lucide-react";
import { Halaman } from "@/components/ui";
import { BantuanWa } from "@/components/bantuan-wa";

export default function TidakAda() {
  return (
    <Halaman ikon={SearchX} judul="Halaman tidak ditemukan" sub="Mungkin alamatnya salah ketik, atau halaman sekolah sudah dipindah.">
      <Link href="/" className="btn btn-utama w-full">Ke beranda</Link>
      <BantuanWa />
    </Halaman>
  );
}
