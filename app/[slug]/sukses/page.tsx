import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Search } from "lucide-react";
import { supabaseAnon } from "@/lib/supabase/anon";
import type { SekolahPublik } from "@/lib/berkas";
import AksiBukti from "./cetak";

export const dynamic = "force-dynamic";

export default async function Sukses({ params, searchParams }: {
  params: Promise<{ slug: string }>; searchParams: Promise<{ nomor?: string }>;
}) {
  const { slug } = await params;
  const { nomor } = await searchParams;
  const { data } = await supabaseAnon().rpc("sekolah_publik", { p_slug: slug });
  const s = data as SekolahPublik | null;
  if (!s || !nomor || !/^[0-9A-Z-]{4,20}$/.test(nomor)) notFound();
  return (
    <main className="mx-auto max-w-md space-y-4 p-4" style={{ "--aksen": s.warna_aksen } as React.CSSProperties}>
      <div className="muncul pt-4 text-center print:hidden">
        <CheckCircle2 className="mx-auto size-14 text-[var(--mint)]" aria-hidden />
        <h1 className="mt-2 font-serif text-2xl font-bold">Pendaftaran terkirim!</h1>
        <p className="mt-1 text-neutral-600">Simpan bukti ini. Sekolah akan menghubungi Anda lewat WhatsApp.</p>
      </div>

      {/* Kartu tiket: bentuk gerbang di atas, sobekan di tengah. */}
      <section id="tiket" className="overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-black/5">
        <div className="px-5 pb-5 pt-6 text-center text-white" style={{ background: "linear-gradient(160deg, var(--aksen), color-mix(in srgb, var(--aksen) 65%, black))" }}>
          <p className="text-xs font-bold uppercase tracking-widest opacity-80">Bukti pendaftaran SPMB</p>
          <p className="mt-1 font-serif text-xl font-bold">{s.nama}</p>
        </div>
        <div className="relative border-t-2 border-dashed border-neutral-200">
          <span aria-hidden className="absolute -left-3 -top-3 size-6 rounded-full bg-[var(--background)]" />
          <span aria-hidden className="absolute -right-3 -top-3 size-6 rounded-full bg-[var(--background)]" />
        </div>
        <div className="p-5 text-center">
          <p className="text-sm text-neutral-600">Nomor pendaftaran</p>
          <p className="font-mono text-4xl font-bold tracking-wider" style={{ color: "var(--aksen)" }}>{nomor}</p>
          <p className="mt-3 text-sm text-neutral-600">Simpan nomor ini untuk cek status pendaftaran.</p>
        </div>
      </section>

      <AksiBukti nomor={nomor} sekolah={s.nama} slug={slug} warna={s.warna_aksen} />
      <Link className="btn btn-lembut w-full print:hidden" href={`/${slug}/cek-status`}><Search className="size-5" aria-hidden />Cek status pendaftaran</Link>
    </main>
  );
}
