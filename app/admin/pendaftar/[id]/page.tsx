import { Kembali } from "@/components/kembali";
import Link from "next/link";
import { notFound } from "next/navigation";
import { wajibAdmin } from "@/lib/sekolah-saya";
import { linkWa, tglId, WARNA_STATUS } from "@/lib/pendaftar";
import StatusForm from "./status-form";
import BerkasList from "./berkas-list";
import Cetak from "./cetak";
import TemplateWa from "./template-wa";

export const dynamic = "force-dynamic";

export default async function Detail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { db, sekolah } = await wajibAdmin();
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const { data: p } = await db.from("pendaftar")
    .select("id,nomor,nama_anak,tanggal_lahir,isian,status,catatan,wa_ortu,dibuat_pada,jalur(nama,syarat_berkas)")
    .eq("id", id).maybeSingle();
  if (!p) notFound();
  const jalur = (Array.isArray(p.jalur) ? p.jalur[0] : p.jalur) as { nama: string; syarat_berkas: string[] } | null;

  const [{ data: berkas }, { data: ganda }, { data: st }] = await Promise.all([
    db.from("berkas").select("id,jenis,ukuran").eq("pendaftar_id", id),
    db.from("pendaftar").select("id,nomor,dibuat_pada").eq("tanggal_lahir", p.tanggal_lahir).ilike("nama_anak", p.nama_anak.trim()).neq("id", id),
    db.rpc("status_saya"),
  ]);
  const bisaUbah = ["trial", "aktif"].includes((st as { status: string } | null)?.status ?? "");
  const wa = linkWa(p.wa_ortu);
  const isian = Object.entries((p.isian ?? {}) as Record<string, string>);

  return (
    <main className="mx-auto w-full max-w-2xl space-y-4 px-4 pb-6 pt-4">
      <div className="flex items-center justify-between print:hidden">
        <Kembali href="/admin">Daftar pendaftar</Kembali>
        <Cetak label="Cetak / simpan PDF" />
      </div>
      <div className="hidden border-b-2 border-black pb-2 text-center print:block">
        <p className="text-lg font-bold uppercase">Formulir Pendaftaran Siswa Baru</p>
        <p>{sekolah.nama}</p>
      </div>

      <header className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
        <p className="text-sm text-neutral-600">{sekolah.nama} · {p.nomor}</p>
        <h1 className="font-serif text-2xl font-bold">{p.nama_anak}</h1>
        <span className={`mt-2 inline-block rounded-full px-3 py-0.5 text-sm font-bold ${WARNA_STATUS[p.status]}`}>{p.status}</span>
      </header>

      {!!ganda?.length && (
        <p className="rounded-2xl bg-[var(--kuning-muda)] p-3 text-sm text-amber-900">
          ⚠ Kemungkinan data ganda: nama dan tanggal lahir sama dengan{" "}
          {ganda.map((g, i) => <span key={g.id}>{i > 0 && ", "}<Link className="tautan" href={`/admin/pendaftar/${g.id}`}>{g.nomor}</Link></span>)}.
        </p>
      )}

      <dl className="divide-y divide-neutral-100 rounded-3xl bg-white text-sm shadow-sm ring-1 ring-black/5">
        {[["Tanggal lahir", tglId(p.tanggal_lahir)], ["Jalur", jalur?.nama ?? "-"], ["Mendaftar", tglId(p.dibuat_pada, true)], ...isian].map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 p-3"><dt className="text-neutral-600">{k}</dt><dd className="text-right font-medium">{v}</dd></div>
        ))}
        <div className="flex items-center justify-between gap-4 p-3">
          <dt className="text-neutral-600">WhatsApp</dt>
          <dd className="font-medium">{wa ? <a className="tautan" href={wa} rel="noopener noreferrer">+{p.wa_ortu}</a> : "-"}</dd>
        </div>
      </dl>

      <section className="print:break-inside-avoid">
        <h2 className="mb-2 font-serif text-xl font-bold">Berkas</h2>
        <BerkasList syarat={jalur?.syarat_berkas ?? []} berkas={berkas ?? []} />
      </section>

      {wa && (
        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 print:hidden">
          <h2 className="mb-3 font-serif text-xl font-bold">Kirim pesan ke orang tua</h2>
          <TemplateWa wa={wa} awal={{ Diterima: "diterima", Cadangan: "cadangan", Ditolak: "ditolak" }[p.status as string] ?? "berkas"} data={{
            anak: p.nama_anak, nomor: p.nomor, sekolah: sekolah.nama, catatan: p.catatan,
            tautanCek: `${(process.env.NEXT_PUBLIC_SITE_URL ?? "https://spmbz.web.id").replace(/\/$/, "")}/${sekolah.slug}/cek-status`,
            berkasKurang: (jalur?.syarat_berkas ?? []).filter((j) => !(berkas ?? []).some((b) => b.jenis === j)),
          }} />
        </section>
      )}

      <section className="print:hidden">
        <h2 className="mb-2 font-serif text-xl font-bold">Keputusan</h2>
        {!bisaUbah && <p className="mb-2 rounded-2xl bg-[var(--kuning-muda)] p-3 text-sm text-amber-900">Langganan tidak aktif, data hanya bisa dibaca.</p>}
        <StatusForm id={p.id} status={p.status} catatan={p.catatan} bisaUbah={bisaUbah} />
      </section>
      <p className="hidden pt-8 text-right text-sm print:block">Dicetak {tglId(new Date().toISOString(), true)}<br /><br /><br />(............................................)<br />Panitia SPMB</p>
    </main>
  );
}
