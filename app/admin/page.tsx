import Link from "next/link";
import { wajibAdmin } from "@/lib/sekolah-saya";
import { bacaFilter, kueri, linkWa, STATUS, tglId, WARNA_STATUS } from "@/lib/pendaftar";
import Cetak from "./pendaftar/[id]/cetak";

export const dynamic = "force-dynamic";

type Status = { status: "trial" | "aktif" | "tenggang" | "nonaktif"; trial_until: string; active_until: string | null };
type Ringkasan = { total: number; baru: number; diterima: number; cadangan: number; ditolak: number; hari_ini: number; berkas_kurang: number };
type Jalur = { nama: string; syarat_berkas: string[] } | null;
const LABEL = { trial: "Coba gratis", aktif: "Aktif", tenggang: "Masa tenggang (hanya baca)", nonaktif: "Nonaktif" };
const PER_HAL = 30;
const kini = () => Date.now();

export default async function Admin({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const f = bacaFilter(sp);
  const hal = Math.max(1, Number.parseInt(String(sp.hal ?? "1"), 10) || 1);
  const { db, sekolah } = await wajibAdmin();

  let q = db.from("pendaftar")
    .select("id,nomor,nama_anak,status,wa_ortu,dibuat_pada,jalur(nama,syarat_berkas),berkas(id)", { count: "exact" })
    .order("dibuat_pada", { ascending: false }).range((hal - 1) * PER_HAL, hal * PER_HAL - 1);
  if (f.status) q = q.eq("status", f.status);
  if (f.jalur) q = q.eq("jalur_id", f.jalur);
  if (f.q) q = q.or(`nama_anak.ilike.%${f.q}%,nomor.ilike.%${f.q}%`);

  const [{ data: st }, { data: rk }, { data: gandaIds }, { data: daftarJalur }, { data: baris, count }] = await Promise.all([
    db.rpc("status_saya"), db.rpc("ringkasan_saya"), db.rpc("ganda_saya"),
    db.from("jalur").select("id,nama").order("nama"), q,
  ]);
  const langganan = st as Status | null;
  const r = (rk ?? { total: 0, baru: 0, diterima: 0, cadangan: 0, ditolak: 0, hari_ini: 0, berkas_kurang: 0 }) as Ringkasan;
  const ganda = new Set((gandaIds ?? []) as string[]);
  const akhir = langganan ? new Date(langganan.active_until ?? langganan.trial_until) : null;
  const sisa = akhir ? Math.max(0, Math.ceil((akhir.getTime() - kini()) / 86400000)) : 0;
  const total = count ?? 0;
  const halMaks = Math.max(1, Math.ceil(total / PER_HAL));
  const tautan = (p: Partial<typeof f>, h = 1) => {
    const s = kueri({ ...f, ...p });
    return `/admin?${s}${h > 1 ? `${s ? "&" : ""}hal=${h}` : ""}`;
  };
  const adaFilter = !!(f.status || f.jalur || f.q);

  const tugas = [
    { n: r.baru, teks: "pendaftar baru menunggu diperiksa", href: tautan({ status: "Baru" }) },
    { n: r.berkas_kurang, teks: "pendaftar baru belum melengkapi berkas", href: tautan({ status: "Baru" }) },
    { n: ganda.size, teks: "pendaftar dengan kemungkinan data ganda", href: "#daftar" },
    { n: r.hari_ini, teks: "pendaftar masuk hari ini", href: "#daftar" },
  ].filter((t) => t.n > 0);

  return (
    <main className="mx-auto w-full max-w-2xl space-y-6 px-5 py-8">
      <header className="flex items-start justify-between gap-4 print:hidden">
        <div>
          <p className="text-sm text-neutral-600">Admin sekolah</p>
          <h1 className="font-serif text-2xl font-bold">{sekolah.nama}</h1>
        </div>
        <form action="/keluar" method="post"><button className="rounded-lg border px-4 py-2 text-sm">Keluar</button></form>
      </header>

      <section className="flex items-center justify-between gap-3 rounded-xl border bg-white p-4 print:hidden">
        <div>
          <p className="text-sm text-neutral-600">Langganan</p>
          <p className="font-bold">{langganan ? LABEL[langganan.status] : "-"}{langganan && (langganan.status === "trial" || langganan.status === "aktif") && <span className="font-normal"> · sisa {sisa} hari</span>}</p>
        </div>
        <div className="flex flex-col items-end gap-1 text-sm">
          <Link className="underline" href="/admin/langganan">Langganan</Link>
          <Link className="underline" href="/admin/pengaturan">Pengaturan</Link>
          <Link className="underline" href={`/${sekolah.slug}`}>Lihat halaman</Link>
        </div>
      </section>

      <section className="rounded-xl border bg-white p-4 print:hidden">
        <h2 className="font-bold">Tugas hari ini</h2>
        {tugas.length === 0
          ? <p className="mt-1 text-sm text-neutral-600">{r.total === 0 ? "Belum ada pendaftar. Bagikan QR halaman sekolah dari Pengaturan." : "Semua beres. Tidak ada yang perlu diperiksa."}</p>
          : <ul className="mt-2 space-y-1">{tugas.map((t) => <li key={t.teks}><Link href={t.href} className="block rounded-lg bg-[var(--biru)]/5 p-3 text-sm"><b>{t.n}</b> {t.teks}</Link></li>)}</ul>}
      </section>

      <section className="grid grid-cols-4 gap-2 print:hidden" aria-label="Ringkasan status">
        {STATUS.map((s) => (
          <Link key={s} href={tautan({ status: f.status === s ? undefined : s })} aria-current={f.status === s}
            className={`rounded-xl border p-3 text-center ${f.status === s ? "border-2 border-[var(--biru)] bg-white" : "bg-white"}`}>
            <p className="text-2xl font-bold">{r[s.toLowerCase() as "baru"]}</p>
            <p className="text-xs text-neutral-600">{s}</p>
          </Link>
        ))}
      </section>

      <section id="daftar" className="space-y-3">
        <form className="grid grid-cols-2 gap-2 print:hidden" action="/admin">
          <input name="q" defaultValue={f.q} placeholder="Cari nama atau nomor" className="col-span-2 h-12 rounded-lg border bg-white px-3" />
          <select name="status" defaultValue={f.status ?? ""} className="h-12 rounded-lg border bg-white px-3">
            <option value="">Semua status</option>{STATUS.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select name="jalur" defaultValue={f.jalur ?? ""} className="h-12 rounded-lg border bg-white px-3">
            <option value="">Semua jalur</option>{(daftarJalur ?? []).map((j) => <option key={j.id} value={j.id}>{j.nama}</option>)}
          </select>
          <button className="col-span-2 h-12 rounded-lg bg-[var(--biru)] font-bold text-white">Terapkan</button>
        </form>

        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-neutral-600">{total} pendaftar{adaFilter && " (terfilter)"}{adaFilter && <> · <Link className="underline print:hidden" href="/admin">hapus filter</Link></>}</p>
          <div className="flex gap-2 print:hidden">
            <Cetak label="Cetak daftar" />
            <a className="inline-flex h-10 items-center rounded-lg border px-4 text-sm font-semibold" href={`/admin/pendaftar/unduh?${kueri(f)}`}>Unduh ke Excel</a>
          </div>
        </div>

        <ul className="space-y-2">
          {(baris ?? []).map((p) => {
            const j = (Array.isArray(p.jalur) ? p.jalur[0] : p.jalur) as Jalur;
            const wa = linkWa(p.wa_ortu);
            const unggah = (p.berkas as unknown[]).length, perlu = j?.syarat_berkas.length ?? 0;
            return (
              <li key={p.id} className="rounded-xl border bg-white p-3">
                <div className="flex items-start justify-between gap-3">
                  <Link href={`/admin/pendaftar/${p.id}`} className="min-w-0">
                    <p className="truncate font-semibold">{p.nama_anak}</p>
                    <p className="text-sm text-neutral-600">{p.nomor}{j && ` · ${j.nama}`} · {tglId(p.dibuat_pada)}</p>
                  </Link>
                  <span className={`shrink-0 rounded-full px-3 py-0.5 text-xs font-bold ${WARNA_STATUS[p.status]}`}>{p.status}</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  {perlu > 0 && <span className={`rounded-full px-2 py-0.5 ${unggah >= perlu ? "bg-green-50 text-green-800" : "bg-amber-50 text-amber-900"}`}>Berkas {unggah}/{perlu}</span>}
                  {ganda.has(p.id) && <span className="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-900">⚠ Kemungkinan ganda</span>}
                  {wa && <a href={wa} rel="noopener noreferrer" className="ml-auto rounded-full border px-3 py-1 font-semibold print:hidden">WhatsApp</a>}
                </div>
              </li>
            );
          })}
        </ul>
        {total === 0 && <p className="rounded-xl border bg-white p-4 text-center text-sm text-neutral-600">{adaFilter ? "Tidak ada pendaftar yang cocok dengan filter." : "Belum ada pendaftar."}</p>}

        {halMaks > 1 && (
          <nav className="flex items-center justify-between text-sm print:hidden">
            {hal > 1 ? <Link className="rounded-lg border px-4 py-2" href={tautan({}, hal - 1)}>← Sebelumnya</Link> : <span />}
            <span>Halaman {hal} dari {halMaks}</span>
            {hal < halMaks ? <Link className="rounded-lg border px-4 py-2" href={tautan({}, hal + 1)}>Berikutnya →</Link> : <span />}
          </nav>
        )}
      </section>
    </main>
  );
}
