"use client";

import { kunciSlug } from "./actions";

/** QR dan link halaman sekolah, untuk brosur. Mengunduh = alamat dianggap sudah dibagikan. */
export default function Qr({ url, svg, png, slug }: { url: string; svg: string; png: string; slug: string }) {
  const unduh = (href: string, nama: string) => () => {
    const a = document.createElement("a");
    a.href = href; a.download = nama; a.click();
    void kunciSlug().catch(() => {});
  };
  const svgHref = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  return (
    <div className="space-y-3">
      <div className="mx-auto w-52 rounded-3xl bg-white p-3 ring-4 ring-[var(--biru-muda)]" dangerouslySetInnerHTML={{ __html: svg }} />
      <p className="break-all text-center text-sm">{url}</p>
      <div className="grid grid-cols-2 gap-2">
        <button className="btn btn-garis" onClick={unduh(png, `qr-${slug}.png`)}>Unduh PNG</button>
        <button className="btn btn-garis" onClick={unduh(svgHref, `qr-${slug}.svg`)}>Unduh SVG</button>
      </div>
      <button className="btn btn-garis w-full" onClick={() => { void navigator.clipboard?.writeText(url); void kunciSlug().catch(() => {}); }}>Salin tautan</button>
    </div>
  );
}
