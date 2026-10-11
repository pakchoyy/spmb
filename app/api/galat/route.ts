import { catatGalat } from "@/lib/galat";
import { hashPerangkat } from "@/lib/perangkat";

// Batas kasar di memori per instance: maks. 10 laporan per menit per perangkat.
const hitung = new Map<string, { n: number; t: number }>();

/** Laporan error dari browser (app/error.tsx). Isi dipotong; tidak ada data pribadi yang dikirim. */
export async function POST(req: Request) {
  const teks = await req.text();
  if (teks.length > 6000) return new Response(null, { status: 413 });
  const k = await hashPerangkat(false), kini = Date.now(), h = hitung.get(k);
  if (h && kini - h.t < 60000 && h.n >= 10) return new Response(null, { status: 429 });
  hitung.set(k, h && kini - h.t < 60000 ? { n: h.n + 1, t: h.t } : { n: 1, t: kini });
  if (hitung.size > 5000) hitung.clear();
  try {
    const d = JSON.parse(teks) as { pesan?: string; url?: string; detail?: string };
    await catatGalat("browser", String(d.pesan ?? ""), d.url ? String(d.url) : null, d.detail ? String(d.detail) : null);
  } catch { return new Response(null, { status: 400 }); }
  return new Response(null, { status: 204 });
}
