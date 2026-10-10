import type { Metadata } from "next";
import FormMasuk from "./form";

export const metadata: Metadata = { title: "Masuk admin sekolah" };

export default async function Masuk({ searchParams }: { searchParams: Promise<{ galat?: string }> }) {
  const { galat } = await searchParams;
  return <FormMasuk awal={galat === "link" ? "Link tidak valid atau sudah kedaluwarsa. Minta link baru." : ""} />;
}
