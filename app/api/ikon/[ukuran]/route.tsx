import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";
import { supabaseAnon } from "@/lib/supabase/anon";
import { urlAset, type SekolahPublik } from "@/lib/berkas";

// Ikon aplikasi (PWA).
// Tanpa parameter: logo SPMB Zone (gerbang putih + titik kuning di kotak biru).
// s = slug sekolah: logo sekolah di atas latar putih (bila ada), selain itu gerbang + huruf awal warna sekolah.
// maskable=1 = area aman lebih lega (Android memotong ikon menjadi lingkaran/kotak).
export async function GET(req: NextRequest, { params }: { params: Promise<{ ukuran: string }> }) {
  const { ukuran } = await params;
  const px = ukuran === "512" ? 512 : ukuran === "192" ? 192 : ukuran === "180" ? 180 : null;
  if (!px) return new Response("Not found", { status: 404 });
  const q = req.nextUrl.searchParams;
  const maskable = q.get("maskable") === "1";
  const radius = maskable ? 0 : px * 0.22;

  let warna = "#2449d8", logo: string | null = null, huruf: string | null = null;
  const slug = q.get("s");
  if (slug && /^[a-z0-9-]{3,40}$/.test(slug)) {
    const { data } = await supabaseAnon().rpc("sekolah_publik", { p_slug: slug });
    const s = data as SekolahPublik | null;
    if (s) {
      warna = s.warna_aksen;
      const u = urlAset(s.logo_path);
      logo = u ? (u.startsWith("/") ? new URL(u, req.nextUrl.origin).href : u) : null;
      huruf = s.nama.replace(/^(SD|SMP|SMA|SMK|MI|MTS|MA|TK)\s+(N(egeri)?\s+)?/i, "")[0]?.toUpperCase() ?? "S";
    }
  }

  const isi = px * (maskable ? 0.6 : 0.78);
  return new ImageResponse(
    logo ? (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", borderRadius: radius }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} width={isi} height={isi} style={{ objectFit: "contain" }} alt="" />
      </div>
    ) : (
      huruf ? (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(150deg, ${warna}, ${warna}cc)`, borderRadius: radius }}>
          <svg width={isi} height={isi} viewBox="0 0 32 32">
            <path d="M9 25V15a7 7 0 0 1 14 0v10" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
            <text x="16" y="23" textAnchor="middle" fontSize="8" fontWeight="800" fill="#ffc83d">{huruf}</text>
          </svg>
        </div>
      ) : (
        // ikon aplikasi SPMB Zone: kotak biru gradasi + tanda putih (lihat public/merek/)
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(150deg, #2f8bff, #1747c4)", borderRadius: radius }}>
          <svg width={isi * 0.92} height={isi * 0.92} viewBox="-4 -4 108 108">
            <path d="M79 27 L50 10 L18 27 L18 43 L50 50 L82 57 L82 73 L50 90 L21 73" fill="none" stroke="#fff" strokeWidth="19" strokeLinejoin="round" />
            <path d="M28 26 L50 16 L68 25 L68 45 L28 38 Z" fill="#1d5fd6" stroke="#1d5fd6" strokeWidth="3" strokeLinejoin="round" />
            <path d="M36 27 H56 M36 35 H60" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" />
            <circle cx="72" cy="73" r="17" fill="#1d5fd6" />
            <circle cx="72" cy="73" r="13.5" fill="#0F2F5B" />
            <path d="M65 73.5 L70 78.5 L79 68" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )
    ),
    { width: px, height: px, headers: { "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800" } },
  );
}
