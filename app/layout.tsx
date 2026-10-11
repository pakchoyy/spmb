import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import RegistrasiSw from "@/components/registrasi-sw";
import "./globals.css";

const judul = Fraunces({ variable: "--font-judul", subsets: ["latin"] });
const isi = Plus_Jakarta_Sans({ variable: "--font-isi", subsets: ["latin"] });

export const viewport: Viewport = { themeColor: "#2449d8" };

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://spmbz.web.id"),
  title: "SPMB Zone — Web SPMB Custom untuk sekolah anda",
  description: "Pendaftaran SPMB online untuk sekolah. Halaman SPMB sendiri, periksa berkas dengan mudah.",
  icons: { icon: [{ url: "/api/ikon/192", type: "image/png" }], apple: "/api/ikon/180" },
  appleWebApp: { capable: true, title: "SPMB Zone", statusBarStyle: "default" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${judul.variable} ${isi.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}<RegistrasiSw /><Analytics /></body>
    </html>
  );
}
