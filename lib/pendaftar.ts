export const STATUS = ["Baru", "Diterima", "Cadangan", "Ditolak"] as const;
export type StatusPendaftar = (typeof STATUS)[number];

export const WARNA_STATUS: Record<string, string> = {
  Baru: "bg-blue-100 text-blue-800",
  Diterima: "bg-green-100 text-green-800",
  Cadangan: "bg-amber-100 text-amber-900",
  Ditolak: "bg-red-100 text-red-800",
};

export type Filter = { status?: string; jalur?: string; q?: string; arsip?: string };

/** Baca filter dari query string; nilai yang tidak dikenal dibuang. */
export function bacaFilter(p: Record<string, string | string[] | undefined>): Filter {
  const satu = (k: string) => (Array.isArray(p[k]) ? p[k]![0] : (p[k] as string | undefined)) ?? "";
  const status = satu("status");
  const jalur = satu("jalur");
  return {
    arsip: satu("arsip") === "1" ? "1" : undefined,
    status: (STATUS as readonly string[]).includes(status) ? status : undefined,
    jalur: /^[0-9a-f-]{36}$/.test(jalur) ? jalur : undefined,
    // karakter khusus sintaks filter PostgREST dibuang
    q: satu("q").replace(/[,()%_*\\]/g, " ").trim().slice(0, 60) || undefined,
  };
}

export const kueri = (f: Filter) =>
  new URLSearchParams(Object.entries(f).filter(([, v]) => v) as [string, string][]).toString();

export const tglId = (iso: string, jam = false) =>
  new Date(iso).toLocaleString("id-ID", {
    day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta",
    ...(jam ? { hour: "2-digit", minute: "2-digit" } : {}),
  });

export const linkWa = (n: string | null) => (n ? `https://wa.me/${n}` : null);
