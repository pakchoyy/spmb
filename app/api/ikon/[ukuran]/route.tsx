import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";

// Ikon aplikasi (PWA): kotak berwarna sekolah dengan bentuk gerbang dan huruf awal.
// w = warna hex 6 digit, h = huruf awal, maskable=1 = area aman lebih lega.
export async function GET(req: NextRequest, { params }: { params: Promise<{ ukuran: string }> }) {
  const { ukuran } = await params;
  const px = ukuran === "512" ? 512 : ukuran === "192" ? 192 : null;
  if (!px) return new Response("Not found", { status: 404 });

  const q = req.nextUrl.searchParams;
  const warna = /^[0-9a-fA-F]{6}$/.test(q.get("w") ?? "") ? `#${q.get("w")}` : "#2449d8";
  const huruf = (q.get("h") ?? "G").replace(/[^A-Za-z0-9]/g, "").slice(0, 1).toUpperCase() || "G";
  const maskable = q.get("maskable") === "1";
  const gerbang = px * (maskable ? 0.5 : 0.66);

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: warna, borderRadius: maskable ? 0 : px * 0.22 }}>
        <div style={{ width: gerbang, height: gerbang, display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", borderRadius: `${gerbang / 2}px ${gerbang / 2}px ${gerbang * 0.12}px ${gerbang * 0.12}px`, color: warna, fontSize: gerbang * 0.55, fontWeight: 800 }}>
          {huruf}
        </div>
      </div>
    ),
    { width: px, height: px, headers: { "Cache-Control": "public, max-age=31536000, immutable" } },
  );
}
