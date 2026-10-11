import Link from "next/link";
import { Kembali } from "@/components/kembali";
import { wajibPemilik } from "@/lib/pemilik";
import { tglId } from "@/lib/pendaftar";
import TombolSelesai from "./tombol";

export const dynamic = "force-dynamic";
const GAYA = { fitur: "bg-[var(--kuning-muda)]", saran: "bg-[var(--ungu-muda)]", masalah: "bg-[var(--oranye-muda)]" } as Record<string, string>;
const NAMA = { fitur: "Fitur", saran: "Saran", masalah: "Masalah" } as Record<string, string>;

export default async function MasukanSuper({ searchParams }: PageProps<"/super/masukan">) {
  const { semua } = await searchParams;
  const { svc } = await wajibPemilik();
  let q = svc.from("masukan").select("id,jenis,isi,selesai,dibuat_pada,sekolah(id,nama)").order("dibuat_pada", { ascending: false }).limit(100);
  if (!semua) q = q.eq("selesai", false);
  const { data } = await q;
  return (
    <main className="mx-auto w-full max-w-2xl space-y-4 px-4 pb-6 pt-4">
      <Kembali href="/super">Pantau sekolah</Kembali>
      <div className="flex items-end justify-between gap-2">
        <h1 className="font-serif text-2xl font-bold">Masukan sekolah</h1>
        <Link className="tautan text-sm" href={semua ? "/super/masukan" : "/super/masukan?semua=1"}>{semua ? "Hanya yang belum" : "Tampilkan semua"}</Link>
      </div>
      <ul className="space-y-2">
        {(data ?? []).map((m) => {
          const s = (Array.isArray(m.sekolah) ? m.sekolah[0] : m.sekolah) as { id: string; nama: string } | null;
          return (
            <li key={m.id} className={`rounded-2xl bg-white p-4 text-sm shadow-sm ring-1 ring-black/5 ${m.selesai ? "opacity-60" : ""}`}>
              <div className="flex items-center justify-between gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${GAYA[m.jenis]}`}>{NAMA[m.jenis]}</span>
                <span className="text-xs text-neutral-500">{tglId(m.dibuat_pada, true)}</span>
              </div>
              <p className="mt-2 whitespace-pre-line">{m.isi}</p>
              <div className="mt-3 flex items-center justify-between gap-2">
                {s ? <Link className="tautan text-xs" href={`/super/sekolah/${s.id}`}>{s.nama}</Link> : <span />}
                <TombolSelesai id={m.id} selesai={m.selesai} />
              </div>
            </li>
          );
        })}
        {!data?.length && <li className="rounded-2xl bg-white p-5 text-center text-sm text-neutral-600 shadow-sm ring-1 ring-black/5">Belum ada masukan.</li>}
      </ul>
    </main>
  );
}
