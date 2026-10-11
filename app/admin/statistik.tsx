import { BarChart3 } from "lucide-react";

type Baris = { dibuat_pada: string; status: string; jalur_id: string | null };
type Jalur = { id: string; nama: string; kuota: number | null };

const HARI = 14;
const tglWib = (iso: string) => new Date(new Date(iso).getTime() + 7 * 3600000).toISOString().slice(0, 10);

/** Statistik sederhana pendaftar aktif: per hari (14 hari), per jalur, tanpa pustaka grafik. */
export default function Statistik({ baris, jalur, kini }: { baris: Baris[]; jalur: Jalur[]; kini: number }) {
  if (baris.length === 0) return null;
  const hari = Array.from({ length: HARI }, (_, i) => tglWib(new Date(kini - (HARI - 1 - i) * 86400000).toISOString()));
  const perHari = new Map(hari.map((h) => [h, 0]));
  const perJalur = new Map<string, number>();
  for (const b of baris) {
    const h = tglWib(b.dibuat_pada);
    if (perHari.has(h)) perHari.set(h, perHari.get(h)! + 1);
    if (b.jalur_id) perJalur.set(b.jalur_id, (perJalur.get(b.jalur_id) ?? 0) + 1);
  }
  const maks = Math.max(1, ...perHari.values());
  const total14 = [...perHari.values()].reduce((a, b) => a + b, 0);
  const maksJalur = Math.max(1, ...jalur.map((j) => Math.max(j.kuota ?? 0, perJalur.get(j.id) ?? 0)));
  const label = (h: string) => Number(h.slice(8));

  return (
    <details className="group rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 print:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 font-bold [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2"><BarChart3 className="size-5 text-[var(--biru)]" aria-hidden />Statistik</span>
        <span className="text-sm font-normal text-neutral-600">{total14} pendaftar dalam {HARI} hari</span>
      </summary>

      <h3 className="mt-4 text-sm font-semibold text-neutral-600">Pendaftar per hari</h3>
      <div className="mt-2 flex h-32 items-end gap-1" role="img" aria-label={`Grafik pendaftar ${HARI} hari terakhir, total ${total14}`}>
        {hari.map((h) => {
          const n = perHari.get(h)!;
          return (
            <div key={h} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
              {n > 0 && <span className="text-[10px] font-bold text-neutral-700">{n}</span>}
              <div className="w-full rounded-t-md bg-[var(--biru)]" style={{ height: `${(n / maks) * 85}%`, minHeight: n ? 4 : 2, opacity: n ? 1 : 0.15 }} />
            </div>
          );
        })}
      </div>
      <div className="mt-1 flex gap-1 text-center text-[10px] text-neutral-500">
        {hari.map((h, i) => <span key={h} className="flex-1">{i % 2 === HARI % 2 ? "" : label(h)}</span>)}
      </div>

      {jalur.length > 0 && (<>
        <h3 className="mt-5 text-sm font-semibold text-neutral-600">Per jalur</h3>
        <ul className="mt-2 space-y-2">
          {jalur.map((j) => {
            const n = perJalur.get(j.id) ?? 0;
            return (
              <li key={j.id} className="text-sm">
                <div className="flex justify-between"><span className="font-semibold">{j.nama}</span><span>{n}{j.kuota != null && ` / ${j.kuota}`}</span></div>
                <div className="relative mt-1 h-3 overflow-hidden rounded-full bg-neutral-100">
                  {j.kuota != null && <div className="absolute inset-y-0 left-0 bg-[var(--biru-muda)]" style={{ width: `${(j.kuota / maksJalur) * 100}%` }} />}
                  <div className="absolute inset-y-0 left-0 rounded-full bg-[var(--mint)]" style={{ width: `${(n / maksJalur) * 100}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      </>)}
    </details>
  );
}
