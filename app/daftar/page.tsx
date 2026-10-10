import type { Metadata } from "next";
import FormDaftarSekolah from "./form";

export const metadata: Metadata = { title: "Daftar sekolah — coba gratis 7 hari" };

export default async function Daftar({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref } = await searchParams;
  return <FormDaftarSekolah kodeAwal={(ref ?? "").slice(0, 12)} />;
}
