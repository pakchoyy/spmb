import { notFound } from "next/navigation";
import Link from "next/link";
import { supabaseAnon } from "@/lib/supabase/anon";
import type { SekolahPublik } from "@/lib/berkas";
import FormDaftar from "./form";

export const dynamic = "force-dynamic"; // status langganan harus selalu segar

export default async function Daftar({ params, searchParams }: PageProps<"/[slug]/daftar">) {
  const { slug } = await params;
  const { jalur } = await searchParams;
  const { data } = await supabaseAnon().rpc("sekolah_publik", { p_slug: slug });
  const sekolah = data as SekolahPublik | null;
  if (!sekolah) notFound();

  if (sekolah.status !== "trial" && sekolah.status !== "aktif") {
    return (
      <main className="mx-auto max-w-md p-6">
        <h1 className="text-xl font-semibold">Pendaftaran ditutup</h1>
        <p className="mt-2">Pendaftaran {sekolah.nama} sedang tidak dibuka.</p>
        <Link className="mt-4 inline-block tautan" href={`/${slug}`}>Kembali ke halaman sekolah</Link>
      </main>
    );
  }
  return <FormDaftar sekolah={sekolah} jalurAwal={typeof jalur === "string" ? jalur : null} sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY ?? null} />;
}
