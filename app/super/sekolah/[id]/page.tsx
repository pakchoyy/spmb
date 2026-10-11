import Link from "next/link";
import { notFound } from "next/navigation";
import { wajibPemilik } from "@/lib/pemilik";
import { tglId } from "@/lib/pendaftar";
import Aksi from "./aksi";

export const dynamic = "force-dynamic";

type Baris = {
  id: string; slug: string; nama: string; npsn: string | null; email: string | null; dibuat_pada: string; status: string;
  trial_until: string | null; active_until: string | null; dibatalkan: boolean; nonaktif: boolean; jumlah_pendaftar: number; diajak_oleh: string | null;
};

export default async function DetailSekolah({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const { svc } = await wajibPemilik();
  const { data } = await svc.rpc("ringkasan_sekolah");
  const s = ((data ?? []) as Baris[]).find((x) => x.id === id);
  if (!s) notFound();
  const { data: verif } = await svc.from("sekolah").select("terverifikasi").eq("id", id).single();
  const { data: kode } = await svc.from("kode_aktivasi").select("kode,dibuat_pada,dipakai_pada").eq("sekolah_id", id).order("dibuat_pada", { ascending: false }).limit(10);
  const { data: log } = await svc.from("log_langganan").select("id,peristiwa,detail,waktu").eq("sekolah_id", id).order("waktu", { ascending: false }).limit(15);

  return (
    <main className="mx-auto w-full max-w-2xl space-y-6 px-5 py-8">
      <Link className="text-sm tautan" href="/super">← Semua sekolah</Link>
      <header>
        <h1 className="font-serif text-2xl font-bold">{s.nama}</h1>
        <p className="text-sm text-neutral-600"><Link className="tautan" href={`/${s.slug}`}>/{s.slug}</Link> · NPSN {s.npsn ?? "-"}</p>
      </header>

      <dl className="divide-y rounded-xl border bg-white text-sm">
        {[["Email admin", s.email ?? "-"], ["Status", `${s.status}${s.dibatalkan ? " (dibatalkan)" : ""}${s.nonaktif ? " (dinonaktifkan)" : ""}`],
          ["Masa coba sampai", s.trial_until ? tglId(s.trial_until) : "-"], ["Aktif sampai", s.active_until ? tglId(s.active_until) : "-"],
          ["Pendaftar", String(s.jumlah_pendaftar)], ["Mendaftar", tglId(s.dibuat_pada, true)], ["Kode ajakan masuk", s.diajak_oleh ?? "-"]].map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 p-3"><dt className="text-neutral-600">{k}</dt><dd className="break-all text-right font-medium">{v}</dd></div>
        ))}
      </dl>

      <Aksi id={s.id} slug={s.slug} email={s.email ?? ""} dibatalkan={s.dibatalkan} nonaktif={s.nonaktif} terverifikasi={!!verif?.terverifikasi} />

      <section>
        <h2 className="mb-2 font-serif text-lg font-bold">Kode aktivasi</h2>
        <ul className="divide-y rounded-xl border bg-white text-sm">
          {(kode ?? []).map((k) => (
            <li key={k.kode} className="flex justify-between gap-2 p-3">
              <code>{k.kode}</code><span className="text-neutral-600">{k.dipakai_pada ? `dipakai ${tglId(k.dipakai_pada)}` : `belum dipakai · dibuat ${tglId(k.dibuat_pada)}`}</span>
            </li>
          ))}
          {!kode?.length && <li className="p-3 text-neutral-600">Belum ada kode.</li>}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 font-serif text-lg font-bold">Catatan</h2>
        <ul className="divide-y rounded-xl border bg-white text-sm">
          {(log ?? []).map((l) => (
            <li key={l.id} className="p-3"><div className="flex justify-between gap-2"><b>{l.peristiwa}</b><span className="text-neutral-500">{tglId(l.waktu, true)}</span></div>
              {l.detail && <p className="break-all text-xs text-neutral-600">{JSON.stringify(l.detail)}</p>}</li>
          ))}
          {!log?.length && <li className="p-3 text-neutral-600">Belum ada catatan.</li>}
        </ul>
      </section>
    </main>
  );
}
