import Link from "next/link";
import { wajibAdmin } from "@/lib/sekolah-saya";
import { bacaFilter, kueri, linkWa, STATUS, tglId, WARNA_STATUS } from "@/lib/pendaftar";
import Cetak from "./pendaftar/[id]/cetak";
import { Lightbulb, BadgeCheck, CheckCircle2, ChevronRight, Circle, Clock, Hourglass, ListChecks, LogOut, MessageCircle, Search, Users, Download, XCircle } from "lucide-react";
import Bagikan from "@/components/bagikan";
import TestimoniForm from "./testimoni-form";

export const dynamic = "force-dynamic";

type Status = { status: "trial" | "aktif" | "tenggang" | "nonaktif"; trial_until: string; active_until: string | null };
type Ringkasan = { total: number; arsip: number; baru: number; diterima: number; cadangan: number; ditolak: number; hari_ini: number; berkas_kurang: number };
type Jalur = { nama: string; syarat_berkas: string[] } | null;
const LABEL = { trial: "Masa coba gratis", aktif: "Langganan aktif", tenggang: "Masa tenggang", nonaktif: "Nonaktif" };
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
  q = q.eq("diarsip", f.arsip === "1");
  if (f.status) q = q.eq("status", f.status);
  if (f.jalur) q = q.eq("jalur_id", f.jalur);
  if (f.q) q = q.or(`nama_anak.ilike.%${f.q}%,nomor.ilike.%${f.q}%`);

  const [{ data: st }, { data: rk }, { data: gandaIds }, { data: daftarJalur }, { data: baris, count }, { data: profil }, { data: testimoniSaya }] = await Promise.all([
    db.rpc("status_saya"), db.rpc("ringkasan_saya"), db.rpc("ganda_saya"),
    db.from("jalur").select("id,nama").order("nama"), q,
    db.from("sekolah").select("alamat,kontak_wa,logo_path,slug_dikunci,dibuat_pada").eq("id", sekolah.id).single(),
    db.from("testimoni").select("nama,jabatan,rating,isi").maybeSingle(),
  ]);
  const langganan = st as Status | null;
  const r = (rk ?? { total: 0, arsip: 0, baru: 0, diterima: 0, cadangan: 0, ditolak: 0, hari_ini: 0, berkas_kurang: 0 }) as Ringkasan;
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
  const lihatArsip = f.arsip === "1";

  const tugas = [
    { n: r.baru, teks: "pendaftar baru menunggu diperiksa", href: tautan({ status: "Baru" }) },
    { n: r.berkas_kurang, teks: "pendaftar baru belum melengkapi berkas", href: tautan({ status: "Baru" }) },
    { n: ganda.size, teks: "pendaftar dengan kemungkinan data ganda", href: "#daftar" },
    { n: r.hari_ini, teks: "pendaftar masuk hari ini", href: "#daftar" },
  ].filter((t) => t.n > 0);

  // Checklist panduan awal, tercentang otomatis dari data sekolah.
  const langkahAwal = [
    { ok: !!profil?.alamat && !!profil?.kontak_wa, teks: "Isi alamat dan WhatsApp sekolah", href: "/admin/pengaturan#profil" },
    { ok: !!profil?.logo_path, teks: "Pasang logo sekolah", href: "/admin/pengaturan#gambar" },
    { ok: (daftarJalur ?? []).length > 0, teks: "Atur jalur dan berkas", href: "/admin/pengaturan#jalur" },
    { ok: !!profil?.slug_dikunci, teks: "Unduh QR dan bagikan ke orang tua", href: "/admin/pengaturan#qr" },
  ];
  const awalSelesai = langkahAwal.every((l) => l.ok);
  const KARTU: Record<string, { latar: string; warna: string; ikon: typeof Clock }> = {
    Baru: { latar: "var(--biru-muda)", warna: "var(--biru-tua)", ikon: Clock },
    Diterima: { latar: "var(--mint-muda)", warna: "#0b6b52", ikon: BadgeCheck },
    Cadangan: { latar: "var(--kuning-muda)", warna: "#8a5a00", ikon: Hourglass },
    Ditolak: { latar: "var(--oranye-muda)", warna: "#a2401a", ikon: XCircle },
  };
  const situs = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  // Minta testimoni setelah ada pendaftar atau 3 hari memakai, supaya isinya dari pengalaman nyata.
  const mintaTestimoni = !!testimoniSaya || r.total + r.arsip > 0 ||
    (!!profil?.dibuat_pada && kini() - new Date(profil.dibuat_pada).getTime() > 3 * 86400000);

  return (
    <main className="mx-auto w-full max-w-2xl space-y-4 px-4 pb-6 pt-4">
      <header className="relative overflow-hidden rounded-3xl bg-[var(--biru)] p-5 text-white print:hidden">
        <div aria-hidden className="absolute -right-8 -top-8 size-32 rounded-full bg-white/10" />
        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm text-white/80">Admin sekolah</p>
            <h1 className="truncate font-serif text-2xl font-bold">{sekolah.nama}</h1>
          </div>
          <form action="/keluar" method="post"><button className="btn btn-pil bg-white/15 text-white"><LogOut className="size-4" aria-hidden />Keluar</button></form>
        </div>
        <div className="relative mt-4 flex flex-wrap items-center gap-2">
          <Link href="/admin/langganan" className="btn btn-pil bg-white text-[var(--biru)]">
            {langganan ? LABEL[langganan.status] : "-"}{langganan && (langganan.status === "trial" || langganan.status === "aktif") && ` · sisa ${sisa} hari`}
          </Link>
          <Bagikan judul={`SPMB ${sekolah.nama}`} teks={`Pendaftaran siswa baru ${sekolah.nama} sudah dibuka. Daftar lewat HP di sini:`}
            url={`${situs}/${sekolah.slug}`} label="Bagikan ke orang tua" className="btn btn-pil btn-kuning" />
        </div>
      </header>

      {!awalSelesai && (
        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 print:hidden">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-bold">Panduan awal · {langkahAwal.filter((l) => l.ok).length}/{langkahAwal.length} selesai</h2>
            <Link href="/cara-pakai" target="_blank" className="tautan text-sm">Lihat cara pakai</Link>
          </div>
          <ul className="mt-3 space-y-2">
            {langkahAwal.map((l) => (
              <li key={l.teks}>
                <Link href={l.href} className={`flex items-center gap-3 rounded-2xl p-3 ${l.ok ? "bg-[var(--mint-muda)] text-[#0b6b52]" : "bg-neutral-50"}`}>
                  {l.ok ? <CheckCircle2 className="size-5 shrink-0" aria-hidden /> : <Circle className="size-5 shrink-0 text-neutral-400" aria-hidden />}
                  <span className={l.ok ? "line-through decoration-1" : "font-semibold"}>{l.teks}</span>
                  {!l.ok && <ChevronRight className="ml-auto size-4 text-neutral-400" aria-hidden />}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 print:hidden">
        <h2 className="flex items-center gap-2 font-bold"><ListChecks className="size-5 text-[var(--biru)]" aria-hidden />Tugas hari ini</h2>
        {tugas.length === 0
          ? <p className="mt-2 text-sm text-neutral-600">{r.total === 0 ? "Belum ada pendaftar. Bagikan halaman sekolah ke orang tua." : "Semua beres. Tidak ada yang perlu diperiksa."}</p>
          : <ul className="mt-3 space-y-2">{tugas.map((t) => (
              <li key={t.teks}><Link href={t.href} className="flex items-center gap-3 rounded-2xl bg-[var(--kuning-muda)] p-3 text-sm">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--kuning)] font-bold">{t.n}</span>{t.teks}
                <ChevronRight className="ml-auto size-4" aria-hidden /></Link></li>))}</ul>}
      </section>

      <section className="grid grid-cols-2 gap-2 print:hidden" aria-label="Ringkasan status">
        {STATUS.map((s) => {
          const k = KARTU[s];
          return (
            <Link key={s} href={tautan({ status: f.status === s ? undefined : s })} aria-current={f.status === s}
              className={`flex items-center gap-3 rounded-2xl p-4 ${f.status === s ? "ring-2 ring-current" : ""}`} style={{ background: k.latar, color: k.warna }}>
              <k.ikon className="size-6" aria-hidden />
              <span><span className="block text-2xl font-bold leading-none">{r[s.toLowerCase() as "baru"]}</span><span className="text-sm font-semibold">{s}</span></span>
            </Link>
          );
        })}
      </section>
      {mintaTestimoni && <TestimoniForm awal={testimoniSaya ?? null} />}
      {r.arsip > 0 && !lihatArsip && <Link className="tautan block text-center text-sm print:hidden" href="/admin?arsip=1">Lihat arsip tahun lalu ({r.arsip})</Link>}

      <section id="daftar" className="space-y-3 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-black/5">
        <h2 className="flex items-center gap-2 font-bold"><Users className="size-5 text-[var(--biru)]" aria-hidden />Daftar pendaftar</h2>
        {lihatArsip && <p className="rounded-2xl bg-[var(--biru-muda)] p-3 text-sm">Anda melihat data yang sudah diarsipkan. <Link className="tautan" href="/admin">Kembali ke pendaftar aktif</Link></p>}
        <form className="grid grid-cols-2 gap-2 print:hidden" action="/admin">
          {lihatArsip && <input type="hidden" name="arsip" value="1" />}
          <label className="relative col-span-2"><Search className="absolute left-3 top-3.5 size-5 text-neutral-400" aria-hidden />
            <input name="q" defaultValue={f.q} placeholder="Cari nama atau nomor" className="h-12 w-full rounded-xl border border-neutral-300 bg-white pl-10 pr-3" /></label>
          <select name="status" defaultValue={f.status ?? ""} className="h-12 rounded-xl border border-neutral-300 bg-white px-3">
            <option value="">Semua status</option>{STATUS.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select name="jalur" defaultValue={f.jalur ?? ""} className="h-12 rounded-xl border border-neutral-300 bg-white px-3">
            <option value="">Semua jalur</option>{(daftarJalur ?? []).map((j) => <option key={j.id} value={j.id}>{j.nama}</option>)}
          </select>
          <button className="btn btn-utama col-span-2">Cari</button>
        </form>

        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-neutral-600">{total} pendaftar{adaFilter && " (terfilter)"}{adaFilter && <> · <Link className="tautan print:hidden" href="/admin">hapus filter</Link></>}</p>
          <div className="flex gap-2 print:hidden">
            <Cetak />
            <a className="btn btn-pil btn-lembut" href={`/admin/pendaftar/unduh?${kueri(f)}`}><Download className="size-4" aria-hidden />Excel</a>
          </div>
        </div>

        <ul className="space-y-2">
          {(baris ?? []).map((p) => {
            const j = (Array.isArray(p.jalur) ? p.jalur[0] : p.jalur) as Jalur;
            const wa = linkWa(p.wa_ortu);
            const unggah = (p.berkas as unknown[]).length, perlu = j?.syarat_berkas.length ?? 0;
            return (
              <li key={p.id} className="rounded-2xl bg-neutral-50 p-3 ring-1 ring-black/5">
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
                  {wa && <a href={wa} rel="noopener noreferrer" className="btn btn-wa btn-pil ml-auto !min-h-8 print:hidden"><MessageCircle className="size-3.5" aria-hidden />WhatsApp</a>}
                </div>
              </li>
            );
          })}
        </ul>
        {total === 0 && <p className="rounded-2xl bg-neutral-50 p-4 text-center text-sm text-neutral-600">{adaFilter ? "Tidak ada pendaftar yang cocok dengan filter." : "Belum ada pendaftar."}</p>}

        {halMaks > 1 && (
          <nav className="flex items-center justify-between text-sm print:hidden">
            {hal > 1 ? <Link className="btn btn-pil border-2 border-neutral-300 bg-white" href={tautan({}, hal - 1)}>← Sebelumnya</Link> : <span />}
            <span>Halaman {hal} dari {halMaks}</span>
            {hal < halMaks ? <Link className="btn btn-pil border-2 border-neutral-300 bg-white" href={tautan({}, hal + 1)}>Berikutnya →</Link> : <span />}
          </nav>
        )}
      </section>

      <Link href="/admin/masukan" className="flex items-center gap-3 rounded-3xl bg-[var(--ungu-muda)] p-4 print:hidden">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white"><Lightbulb className="size-6 text-[var(--ungu)]" aria-hidden /></span>
        <span className="min-w-0 flex-1"><b className="block">Minta fitur atau beri saran</b><span className="block text-sm text-neutral-700">Bantu kami membuat aplikasi ini lebih baik.</span></span>
        <ChevronRight className="size-5 shrink-0" aria-hidden />
      </Link>
    </main>
  );
}
