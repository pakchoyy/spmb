"use client";

import QRCode from "qrcode";
import { Download, Printer } from "lucide-react";
import { urlAset } from "@/lib/berkas";

const muat = (src: string) => new Promise<HTMLImageElement | null>((ok) => {
  const i = new Image(); i.crossOrigin = "anonymous";
  i.onload = () => ok(i); i.onerror = () => ok(null); i.src = src;
});

/** Kartu bukti diterima (PNG 1080×1350) digambar di kanvas: kop sekolah, nama, nomor, jalur, QR cek status. */
export default function KartuDiterima({ slug, sekolah, logo, nama, nomor, jalur }: {
  slug: string; sekolah: string; logo: string | null; nama: string; nomor: string; jalur: string | null;
}) {
  async function unduh() {
    const W = 1080, H = 1350, c = document.createElement("canvas");
    c.width = W; c.height = H;
    const g = c.getContext("2d")!;
    const tautan = `${location.origin}/${slug}/cek-status`;
    const [img, qr] = await Promise.all([
      logo ? muat(urlAset(logo)!) : Promise.resolve(null),
      muat(await QRCode.toDataURL(tautan, { margin: 1, width: 260 })),
    ]);
    g.fillStyle = "#eefaf5"; g.fillRect(0, 0, W, H);
    g.fillStyle = "#fff"; g.beginPath(); g.roundRect(70, 70, W - 140, H - 140, 48); g.fill();
    g.fillStyle = "#18b98a"; g.beginPath(); g.roundRect(70, 70, W - 140, 330, [48, 48, 0, 0]); g.fill();
    g.textAlign = "center"; g.fillStyle = "#fff";
    if (img) { g.fillStyle = "#fff"; g.beginPath(); g.roundRect(W / 2 - 70, 110, 140, 140, 32); g.fill(); g.drawImage(img, W / 2 - 60, 120, 120, 120); }
    g.fillStyle = "#fff";
    g.font = "700 46px Georgia, serif"; g.fillText(sekolah.length > 30 ? sekolah.slice(0, 29) + "…" : sekolah, W / 2, img ? 310 : 230);
    g.font = "600 30px system-ui, sans-serif"; g.fillText("BUKTI DITERIMA · SPMB", W / 2, img ? 360 : 290);
    g.fillStyle = "#55607a"; g.font = "500 34px system-ui, sans-serif"; g.fillText("Selamat! Ananda", W / 2, 500);
    g.fillStyle = "#14204a"; g.font = "700 64px Georgia, serif";
    g.fillText(nama.length > 24 ? nama.slice(0, 23) + "…" : nama, W / 2, 590);
    g.fillStyle = "#18b98a"; g.beginPath(); g.roundRect(W / 2 - 200, 630, 400, 90, 45); g.fill();
    g.fillStyle = "#fff"; g.font = "800 48px system-ui, sans-serif"; g.fillText("DITERIMA", W / 2, 692);
    g.fillStyle = "#55607a"; g.font = "500 32px system-ui, sans-serif";
    g.fillText(`Nomor pendaftaran: ${nomor}${jalur ? ` · Jalur ${jalur}` : ""}`, W / 2, 800);
    if (qr) g.drawImage(qr, W / 2 - 130, 850, 260, 260);
    g.font = "400 26px system-ui, sans-serif"; g.fillText("Pindai untuk cek status", W / 2, 1150);
    g.fillText(new Date().toLocaleDateString("id-ID", { dateStyle: "long" }), W / 2, 1195);
    const a = document.createElement("a");
    a.href = c.toDataURL("image/png"); a.download = `diterima-${nomor}.png`; a.click();
  }
  return (
    <div className="grid grid-cols-2 gap-2 print:hidden">
      <button type="button" onClick={unduh} className="btn btn-utama btn-pil"><Download className="size-4" aria-hidden />Unduh kartu</button>
      <button type="button" onClick={() => window.print()} className="btn btn-pil btn-lembut"><Printer className="size-4" aria-hidden />Cetak / PDF</button>
    </div>
  );
}
