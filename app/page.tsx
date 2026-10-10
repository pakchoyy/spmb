import Link from "next/link";

export default function Beranda() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Gerbang — SPMB untuk banyak sekolah</h1>
      <Link className="underline" href="/daftar">Coba gratis 7 hari</Link>
    </main>
  );
}
