import { Gift, Share2, Users } from "lucide-react";
import { IkonWa } from "@/components/ikon-merek";
import { linkWaBantuan } from "@/lib/merek";
import SalinTeks from "./salin";

export type Ajakan = { kode: string; komisi: number; batas: number; dicairkan: number; sekolah: { nama: string; tanggal: string; berbayar: boolean }[] };
const rupiah = (n: number) => `Rp${n.toLocaleString("id-ID")}`;

/** Program ajak sekolah: kode, tautan, langkah, dan saldo komisi. */
export default function Ajakan({ a, situs, namaSekolah }: { a: Ajakan; situs: string; namaSekolah: string }) {
  const tautan = `${situs}/daftar?ref=${a.kode}`;
  const berbayar = a.sekolah.filter((s) => s.berbayar).length;
  const total = berbayar * a.komisi, saldo = Math.max(0, total - a.dicairkan);
  const ajak = `Assalamu'alaikum, Bapak/Ibu. Sekolah kami memakai SPMB Zone untuk pendaftaran siswa baru: orang tua daftar dan unggah berkas dari HP, sekolah memeriksa dengan mudah. Coba juga untuk sekolah Bapak/Ibu (masa coba 7 hari):\n${tautan}\n(kode ajakan: ${a.kode})`;
  const cair = `Halo, saya admin ${namaSekolah}. Saya ingin mencairkan komisi ajakan.\nKode: ${a.kode}\nSaldo: ${rupiah(saldo)}\nNomor rekening / e-wallet: `;

  return (
    <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5">
      <div className="bg-gradient-to-br from-[var(--ungu)] to-[var(--biru)] p-5 text-white">
        <p className="flex items-center gap-2 text-sm font-semibold text-white/85"><Gift className="size-4" aria-hidden />Program ajak sekolah</p>
        <h2 className="mt-1 font-serif text-2xl font-bold">Ajak sekolah lain, dapat {rupiah(a.komisi)}</h2>
        <p className="mt-1 text-sm text-white/85">untuk setiap sekolah yang Anda ajak dan <b>berlangganan</b>.</p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl bg-white/15 p-2"><p className="text-xl font-bold">{a.sekolah.length}</p><p className="text-[11px] text-white/80">diajak</p></div>
          <div className="rounded-2xl bg-white/15 p-2"><p className="text-xl font-bold">{berbayar}</p><p className="text-[11px] text-white/80">berlangganan</p></div>
          <div className="rounded-2xl bg-white p-2 text-[var(--biru-tua)]"><p className="text-lg font-bold">{rupiah(saldo)}</p><p className="text-[11px]">saldo komisi</p></div>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div>
          <p className="text-sm font-semibold">Kode ajakan Anda</p>
          <div className="mt-1 flex items-center gap-2">
            <code className="flex-1 rounded-2xl bg-[var(--ungu-muda)] px-4 py-3 text-center font-mono text-2xl font-bold tracking-[0.2em] text-[var(--ungu)]">{a.kode}</code>
            <SalinTeks teks={a.kode} label="Salin kode" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <a href={`https://wa.me/?text=${encodeURIComponent(ajak)}`} target="_blank" rel="noopener noreferrer" className="btn btn-wa btn-pil"><IkonWa className="size-4" />Bagikan ke WA</a>
          <SalinTeks teks={tautan} label="Salin tautan" ikon />
        </div>

        <ol className="space-y-2 text-sm">
          {[
            <>Bagikan <b>tautan</b> atau <b>kode ajakan</b> ke sekolah lain (grup kepala sekolah, KKG, MGMP, operator).</>,
            <>Sekolah itu mendaftar lewat tautan Anda, atau mengisi kode <b>{a.kode}</b> di kolom &ldquo;Kode ajakan&rdquo; saat daftar.</>,
            <>Setelah sekolah itu <b>membeli paket</b> (bukan hanya masa coba), Anda mendapat <b>{rupiah(a.komisi)}</b>.</>,
            <>Saldo minimal <b>{rupiah(a.batas)}</b> bisa dicairkan ke rekening/e-wallet lewat WhatsApp.</>,
          ].map((t, i) => (
            <li key={i} className="flex gap-3"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-[var(--ungu-muda)] text-xs font-bold text-[var(--ungu)]">{i + 1}</span><span>{t}</span></li>
          ))}
        </ol>

        {saldo >= a.batas
          ? <a href={linkWaBantuan(cair)} target="_blank" rel="noopener noreferrer" className="btn btn-utama w-full"><Share2 className="size-5" aria-hidden />Cairkan {rupiah(saldo)}</a>
          : <p className="rounded-2xl bg-neutral-50 p-3 text-center text-sm text-neutral-600">Kurang {rupiah(a.batas - saldo)} lagi untuk bisa dicairkan.</p>}

        {a.sekolah.length > 0 && (
          <details className="text-sm">
            <summary className="flex cursor-pointer items-center gap-2 font-semibold text-[var(--biru)]"><Users className="size-4" aria-hidden />Sekolah yang Anda ajak</summary>
            <ul className="mt-2 divide-y divide-neutral-100">
              {a.sekolah.map((s, i) => (
                <li key={i} className="flex justify-between gap-2 py-2">
                  <span className="truncate">{s.nama}</span>
                  <span className={`shrink-0 rounded-full px-2 text-xs font-bold ${s.berbayar ? "bg-[var(--mint-muda)] text-[#0b6b52]" : "bg-neutral-100 text-neutral-600"}`}>{s.berbayar ? `+${rupiah(a.komisi)}` : "masa coba"}</span>
                </li>
              ))}
            </ul>
          </details>
        )}
        {a.dicairkan > 0 && <p className="text-xs text-neutral-500">Sudah dicairkan: {rupiah(a.dicairkan)} dari total {rupiah(total)}.</p>}
      </div>
    </section>
  );
}
