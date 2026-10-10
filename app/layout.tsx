import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const judul = Fraunces({ variable: "--font-judul", subsets: ["latin"] });
const isi = Plus_Jakarta_Sans({ variable: "--font-isi", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gerbang — SPMB untuk banyak sekolah",
  description: "Pendaftaran SPMB (dulu PPDB) online untuk sekolah: coba gratis 7 hari.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${judul.variable} ${isi.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
