import { Kembali } from "@/components/kembali";
import Link from "next/link";
import { notFound } from "next/navigation";
import { wajibPemilik } from "@/lib/pemilik";
import { tglId } from "@/lib/pendaftar";
import Aksi from "./aksi";
import Pencairan from "./pencairan";

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
  const [{ data: verif }, { data: set }] = await Promise.all([
    svc.from("sekolah").select("terverifikasi,kode_ajakan,komisi_dicairkan").eq("id", id).single(),
    svc.from("pengaturan").select("komisi_nominal").eq("id", 1).single(),
  ]);
  const { data: diajak } = await svc.from("sekolah").select("id,nama,langganan(active_until,dibatalkan)").eq("diajak_oleh", verif?.kode_ajakan ?? "-").neq("id", id);
  const berbayar = (diajak ?? []).filter((d) => {
    const l = (Array.isArray(d.langganan) ? d.langganan[0] : d.langganan) as { active_until: string | null; dibatalkan: boolean } | null;
    return !!l?.active_until && !l.dibatalkan;
  }).length;
  const komisi = berbayar * (set?.komisi_nominal ?? 0), dicairkan = verif?.komisi_dicairkan ?? 0;
  const { data: kode } = await svc.from("kode_aktivasi").select("kode,dibuat_pada,dipakai_pada").eq("sekolah_id", id).order("dibuat_pada", { ascending: false }).limit(10);
  const { data: log } = await svc.from("log_langganan").select("id,peristiwa,detail,waktu").eq("sekolah_id", id).order("waktu", { ascending: false }).limit(15);

  return (
    <main className="mx-auto w-full max-w-2xl space-y-4 px-4 pb-6 pt-4">
      <Kembali href="/super">Semua sekolah</Kembali>
      <header>
        <h1 className="font-serif text-2xl font-bold">{s.nama}</h1>
        <p className="text-sm text-neutral-600"><Link className="tautan" href={`/${s.slug}`}>/{s.slug}</Link> · NPSN {s.npsn ?? "-"}</p>
      </header>

      <dl className="divide-y divide-neutral-100 rounded-3xl bg-white text-sm shadow-sm ring-1 ring-black/5">
        {[["Email admin", s.email ?? "-"], ["Status", `${s.status}${s.dibatalkan ? " (dibatalkan)" : ""}${s.nonaktif ? " (dinonaktifkan)" : ""}`],
          ["Masa coba sampai", s.trial_until ? tglId(s.trial_until) : "-"], ["Aktif sampai", s.active_until ? tglId(s.active_until) : "-"],
          ["Pendaftar", String(s.jumlah_pendaftar)], ["Mendaftar", tglId(s.dibuat_pada, true)], ["Kode ajakan masuk", s.diajak_oleh ?? "-"]].map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 p-3"><dt className="text-neutral-600">{k}</dt><dd className="break-all text-right font-medium">{v}</dd></div>
        ))}
      </dl>

      <section className="space-y-3 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
        <h2 className="font-bold">Komisi ajakan · kode {verif?.kode_ajakan}</h2>
        <p className="text-sm">Mengajak {(diajak ?? []).length} sekolah, {berbayar} berlangganan. Komisi Rp{komisi.toLocaleString("id-ID")}, dicairkan Rp{dicairkan.toLocaleString("id-ID")}, <b>saldo Rp{Math.max(0, komisi - dicairkan).toLocaleString("id-ID")}</b>.</p>
        {komisi - dicairkan > 0 && <Pencairan id={s.id} saldo={komisi - dicairkan} />}
      </section>

      <Aksi id={s.id} slug={s.slug} email={s.email ?? ""} dibatalkan={s.dibatalkan} nonaktif={s.nonaktif} terverifikasi={!!verif?.terverifikasi} />

      <section>
        <h2 className="mb-2 font-serif text-xl font-bold">Kode aktivasi</h2>
        <ul className="divide-y divide-neutral-100 rounded-3xl bg-white text-sm shadow-sm ring-1 ring-black/5">
          {(kode ?? []).map((k) => (
            <li key={k.kode} className="flex justify-between gap-2 p-3">
              <code>{k.kode}</code><span className="text-neutral-600">{k.dipakai_pada ? `dipakai ${tglId(k.dipakai_pada)}` : `belum dipakai · dibuat ${tglId(k.dibuat_pada)}`}</span>
            </li>
          ))}
          {!kode?.length && <li className="p-3 text-neutral-600">Belum ada kode.</li>}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 font-serif text-xl font-bold">Catatan</h2>
        <ul className="divide-y divide-neutral-100 rounded-3xl bg-white text-sm shadow-sm ring-1 ring-black/5">
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
