import { catatGalat } from "@/lib/galat";
import { bolehLanjut } from "@/lib/perangkat";

/** Laporan error dari browser (app/error.tsx). Isi dipotong; tidak ada data pribadi yang dikirim. */
export async function POST(req: Request) {
  const teks = await req.text();
  if (teks.length > 6000) return new Response(null, { status: 413 });
  // maks. 10 laporan per 10 menit per perangkat, dicatat di database (berlaku lintas server)
  if (!(await bolehLanjut("galat", 10, 10))) return new Response(null, { status: 429 });
  try {
    const d = JSON.parse(teks) as { pesan?: string; url?: string; detail?: string };
    await catatGalat("browser", String(d.pesan ?? ""), d.url ? String(d.url) : null, d.detail ? String(d.detail) : null);
  } catch { return new Response(null, { status: 400 }); }
  return new Response(null, { status: 204 });
}
