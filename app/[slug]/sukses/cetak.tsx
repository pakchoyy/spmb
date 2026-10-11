"use client";

import { Download, MessageCircle, Printer } from "lucide-react";

/** Simpan bukti sebagai gambar (digambar di canvas, tanpa pustaka tambahan), kirim ke WhatsApp, atau cetak. */
export default function AksiBukti({ nomor, sekolah, slug, warna }: { nomor: string; sekolah: string; slug: string; warna: string }) {
  function simpanGambar() {
    const c = document.createElement("canvas");
    c.width = 1080; c.height = 1080;
    const g = c.getContext("2d")!;
    g.fillStyle = "#f4f6ff"; g.fillRect(0, 0, 1080, 1080);
    g.fillStyle = "#fff"; g.beginPath(); g.roundRect(90, 140, 900, 800, 48); g.fill();
    g.fillStyle = warna; g.beginPath(); g.roundRect(90, 140, 900, 260, [48, 48, 0, 0]); g.fill();
    g.textAlign = "center"; g.fillStyle = "#fff";
    g.font = "600 30px system-ui, sans-serif"; g.fillText("BUKTI PENDAFTARAN SPMB", 540, 230);
    g.font = "700 46px Georgia, serif"; g.fillText(sekolah.length > 32 ? sekolah.slice(0, 31) + "…" : sekolah, 540, 310);
    g.strokeStyle = "#d9dbe6"; g.setLineDash([16, 12]); g.lineWidth = 4;
    g.beginPath(); g.moveTo(130, 400); g.lineTo(950, 400); g.stroke();
    g.fillStyle = "#55607a"; g.font = "500 34px system-ui, sans-serif"; g.fillText("Nomor pendaftaran", 540, 520);
    g.fillStyle = warna; g.font = "700 110px ui-monospace, monospace"; g.fillText(nomor, 540, 660);
    g.fillStyle = "#55607a"; g.font = "400 30px system-ui, sans-serif";
    g.fillText("Cek status dengan nomor ini dan tanggal lahir anak", 540, 780);
    g.fillText(`${location.host}/${slug}/cek-status`, 540, 830);
    const a = document.createElement("a");
    a.href = c.toDataURL("image/png");
    a.download = `bukti-spmb-${nomor}.png`;
    a.click();
  }
  const teksWa = `Bukti pendaftaran SPMB ${sekolah}\nNomor pendaftaran: ${nomor}\nCek status: ${typeof location === "undefined" ? "" : location.origin}/${slug}/cek-status`;
  return (
    <div className="grid gap-2 print:hidden">
      <button type="button" onClick={simpanGambar} className="btn btn-utama w-full"><Download className="size-5" aria-hidden />Simpan sebagai gambar</button>
      <div className="grid grid-cols-2 gap-2">
        <a href={`https://wa.me/?text=${encodeURIComponent(teksWa)}`} target="_blank" rel="noopener noreferrer" className="btn btn-wa btn-pil h-12">
          <MessageCircle className="size-4" aria-hidden />Kirim ke WA
        </a>
        <button type="button" onClick={() => window.print()} className="btn btn-pil h-12 border-2 border-neutral-300 bg-white"><Printer className="size-4" aria-hidden />Cetak / PDF</button>
      </div>
    </div>
  );
}
