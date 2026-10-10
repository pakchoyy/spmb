import { notFound } from "next/navigation";
import { supabaseAnon } from "@/lib/supabase/anon";
import type { SekolahPublik } from "@/lib/berkas";
import Cetak from "./cetak";

export const dynamic = "force-dynamic";

export default async function Sukses({ params, searchParams }: {
  params: Promise<{ slug: string }>; searchParams: Promise<{ nomor?: string }>;
}) {
  const { slug } = await params;
  const { nomor } = await searchParams;
  const { data } = await supabaseAnon().rpc("sekolah_publik", { p_slug: slug });
  const s = data as SekolahPublik | null;
  if (!s || !nomor) notFound();
  return (
    <main className="mx-auto max-w-md space-y-4 p-4">
      <section className="rounded-xl border p-5 text-center" style={{ borderColor: s.warna_aksen }}>
        <p className="text-sm text-neutral-600">Bukti pendaftaran SPMB</p>
        <h1 className="mt-1 text-lg font-semibold">{s.nama}</h1>
        <p className="mt-4 text-sm">Nomor pendaftaran</p>
        <p className="text-3xl font-bold tracking-wider">{nomor}</p>
        <p className="mt-4 text-sm text-neutral-600">Simpan nomor ini. Cek status dengan nomor dan tanggal lahir anak.</p>
      </section>
      <Cetak />
      <a className="block text-center underline print:hidden" href={`/${slug}/cek-status`}>Cek status pendaftaran</a>
    </main>
  );
}
