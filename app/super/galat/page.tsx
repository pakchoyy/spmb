import { Kembali } from "@/components/kembali";
import { wajibPemilik } from "@/lib/pemilik";
import { tglId } from "@/lib/pendaftar";

export const dynamic = "force-dynamic";

type Baris = { id: number; sumber: string; pesan: string; url: string | null; detail: string | null; waktu: string };

export default async function GalatSuper() {
  const { svc } = await wajibPemilik();
  const { data } = await svc.from("galat_log").select("id,sumber,pesan,url,detail,waktu").order("waktu", { ascending: false }).limit(200);
  // kelompokkan per pesan supaya error yang berulang terlihat sekali dengan jumlahnya
  const grup = new Map<string, { contoh: Baris; n: number }>();
  for (const b of (data ?? []) as Baris[]) {
    const k = `${b.sumber}|${b.pesan}`;
    const g = grup.get(k);
    if (g) g.n++; else grup.set(k, { contoh: b, n: 1 });
  }
  return (
    <main className="mx-auto w-full max-w-2xl space-y-4 px-4 pb-6 pt-4">
      <Kembali href="/super">Pantau sekolah</Kembali>
      <h1 className="font-serif text-2xl font-bold">Catatan error</h1>
      <p className="text-sm text-neutral-600">200 catatan terakhir, dikelompokkan per pesan. Dihapus otomatis setelah 30 hari.</p>
      <ul className="space-y-2">
        {[...grup.values()].map(({ contoh: b, n }) => (
          <li key={b.id} className="rounded-2xl bg-white p-4 text-sm shadow-sm ring-1 ring-black/5">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className={`rounded-full px-2 py-0.5 font-bold ${b.sumber === "server" ? "bg-red-50 text-red-700" : "bg-[var(--kuning-muda)] text-[#8a5a00]"}`}>{b.sumber} · {n}×</span>
              <span className="text-neutral-500">terakhir {tglId(b.waktu, true)}</span>
            </div>
            <p className="mt-2 break-words font-semibold">{b.pesan}</p>
            {b.url && <p className="text-xs text-neutral-600">{b.url}</p>}
            {b.detail && <details className="mt-2"><summary className="cursor-pointer text-xs text-[var(--biru)]">Detail</summary><pre className="mt-1 max-h-60 overflow-auto whitespace-pre-wrap rounded-xl bg-neutral-50 p-2 text-[11px]">{b.detail}</pre></details>}
          </li>
        ))}
        {grup.size === 0 && <li className="rounded-2xl bg-white p-5 text-center text-sm text-neutral-600 shadow-sm ring-1 ring-black/5">Belum ada error. 🎉</li>}
      </ul>
    </main>
  );
}
