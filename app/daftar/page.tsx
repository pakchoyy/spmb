import type { Metadata } from "next";
import FormDaftarSekolah from "./form";

export const metadata: Metadata = { title: "Daftar sekolah" };

export default async function Daftar({ searchParams }: { searchParams: Promise<{ ref?: string; t?: string; email?: string }> }) {
  const { ref, t, email } = await searchParams;
  // t = token aktivasi BGY Store: pembeli yang belum punya akun daftar dulu, lalu kembali ke aktivasi
  const token = /^[0-9a-f]{8,64}$/.test(t ?? "") ? t! : "";
  return <FormDaftarSekolah kodeAwal={(ref ?? "").slice(0, 12)} token={token} emailAwal={(email ?? "").slice(0, 200)} />;
}
