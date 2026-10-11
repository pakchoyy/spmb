import Link from "next/link";
import { wajibPemilik } from "@/lib/pemilik";
import { tglId } from "@/lib/pendaftar";

export const dynamic = "force-dynamic";

type Baris = {
  id: string; slug: string; nama: string; email: string | null; dibuat_pada: string; status: string;
  trial_until: string | null; active_until: string | null; dibatalkan: boolean; nonaktif: boolean; jumlah_pendaftar: number;
};
const WARNA: Record<string, string> = {
  trial: "bg-blue-100 text-blue-800", aktif: "bg-green-100 text-green-800",
  tenggang: "bg-amber-100 text-amber-900", nonaktif: "bg-red-100 text-red-800",
};
const STATUS = ["trial", "aktif", "tenggang", "nonaktif"];

export default async function Super({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const { status, q } = await searchParams;
  const { svc } = await wajibPemilik();
  const [{ data }, { data: log }] = await Promise.all([
    svc.rpc("ringkasan_sekolah"),
    svc.from("log_langganan").select("id,sekolah_id,peristiwa,detail,waktu").order("waktu", { ascending: false }).limit(25),
  ]);
  const semua = (data ?? []) as Baris[];
  const hitung = (s: string) => semua.filter((x) => x.status === s).length;
  const kata = (q ?? "").trim().toLowerCase();
  const tampil = semua.filter((x) =>
    (!status || x.status === status) &&
    (!kata || `${x.nama} ${x.slug} ${x.email ?? ""}`.toLowerCase().includes(kata)));
  const nama = new Map(semua.map((x) => [x.id, x.nama]));

  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 px-5 py-8">
      <header className="flex items-start justify-between gap-4">
        <div><p className="text-sm text-neutral-600">Pemilik aplikasi</p><h1 className="font-serif text-2xl font-bold">Pantau sekolah</h1></div>
        <form action="/keluar" method="post"><button className="btn btn-pil border-2 border-neutral-300 bg-white">Keluar</button></form>
      </header>

      <nav className="flex gap-2 text-sm"><Link className="btn btn-pil btn-lembut" href="/super/pengaturan">Pengaturan harga & komisi</Link></nav>

      <section className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        <Link href="/super" className="rounded-2xl bg-white p-3 text-center shadow-sm ring-1 ring-black/5"><p className="text-2xl font-bold">{semua.length}</p><p className="text-xs text-neutral-600">Semua</p></Link>
        {STATUS.map((s) => (
          <Link key={s} href={`/super?status=${s}`} className={`rounded-xl border bg-white p-3 text-center ${status === s ? "border-2 border-[var(--biru)]" : ""}`}>
            <p className="text-2xl font-bold">{hitung(s)}</p><p className="text-xs capitalize text-neutral-600">{s}</p>
          </Link>
        ))}
      </section>

      <form action="/super" className="flex gap-2">
        <input name="q" defaultValue={q} placeholder="Cari nama, alamat, atau email" className="h-12 min-w-0 flex-1 rounded-xl border border-neutral-300 bg-white px-3" />
        {status && <input type="hidden" name="status" value={status} />}
        <button className="btn btn-utama">Cari</button>
      </form>

      <ul className="space-y-2">
        {tampil.map((s) => (
          <li key={s.id}>
            <Link href={`/super/sekolah/${s.id}`} className="block rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0"><p className="truncate font-semibold">{s.nama}</p><p className="truncate text-sm text-neutral-600">/{s.slug} · {s.email ?? "-"}</p></div>
                <span className={`shrink-0 rounded-full px-3 py-0.5 text-xs font-bold ${WARNA[s.status]}`}>{s.status}{s.dibatalkan && " · batal"}</span>
              </div>
              <p className="mt-1 text-xs text-neutral-600">
                Berakhir {tglId(s.active_until ?? s.trial_until ?? s.dibuat_pada)} · {s.jumlah_pendaftar} pendaftar · daftar {tglId(s.dibuat_pada)}
              </p>
            </Link>
          </li>
        ))}
        {tampil.length === 0 && <li className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 text-center text-sm text-neutral-600">Tidak ada sekolah.</li>}
      </ul>

      <section>
        <h2 className="mb-2 font-serif text-xl font-bold">Catatan terbaru</h2>
        <ul className="divide-y divide-neutral-100 rounded-3xl bg-white text-sm shadow-sm ring-1 ring-black/5">
          {(log ?? []).map((l) => (
            <li key={l.id} className="flex flex-wrap justify-between gap-2 p-3">
              <span><b>{l.peristiwa}</b>{l.sekolah_id && ` · ${nama.get(l.sekolah_id) ?? "sekolah dihapus"}`}</span>
              <span className="text-neutral-500">{tglId(l.waktu, true)}</span>
            </li>
          ))}
          {!log?.length && <li className="p-3 text-neutral-600">Belum ada catatan.</li>}
        </ul>
      </section>
    </main>
  );
}
