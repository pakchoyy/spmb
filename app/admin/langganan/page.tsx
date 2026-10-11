import Link from "next/link";
import { wajibAdmin } from "@/lib/sekolah-saya";
import { supabaseService } from "@/lib/supabase/admin";
import KodeForm from "./kode-form";

export const dynamic = "force-dynamic";

type St = { status: "trial" | "aktif" | "tenggang" | "nonaktif"; trial_until: string; active_until: string | null; dibatalkan: boolean; dinonaktifkan: boolean; email: string };
const HARI = 86400000;
const kini = () => Date.now();
const tgl = (d: Date) => d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" });
const rupiah = (n: number) => `Rp${n.toLocaleString("id-ID")}`;

export default async function Langganan() {
  const { db } = await wajibAdmin();
  const { data } = await db.rpc("status_saya");
  const st = data as St | null;
  if (!st) return null;

  // tabel pengaturan hanya bisa dibaca server (service_role), tidak oleh admin sekolah
  const { data: p } = await supabaseService().from("pengaturan").select("lynk_url,harga_paket").eq("id", 1).maybeSingle();
  const lynk = p?.lynk_url && /^https:\/\//.test(p.lynk_url) ? p.lynk_url : null;

  const akhir = new Date(st.active_until ?? st.trial_until);
  const sisa = Math.max(0, Math.ceil((akhir.getTime() - kini()) / HARI));
  const sisaTenggang = Math.max(0, Math.ceil((akhir.getTime() + 3 * HARI - kini()) / HARI));
  const dikunci = st.dibatalkan || st.dinonaktifkan;

  const ringkas = {
    trial: { judul: "Coba gratis", teks: `Berakhir ${tgl(akhir)} (sisa ${sisa} hari). Semua fitur aktif.`, warna: "bg-blue-50 text-blue-900" },
    aktif: { judul: "Langganan aktif", teks: `Berlaku sampai ${tgl(akhir)} (sisa ${sisa} hari).`, warna: "bg-green-50 text-green-900" },
    tenggang: { judul: "Masa tenggang", teks: `Masa aktif habis ${tgl(akhir)}. Beranda admin hanya bisa dibaca dan form pendaftaran ditutup. Sisa ${sisaTenggang} hari sebelum nonaktif.`, warna: "bg-amber-50 text-amber-900" },
    nonaktif: { judul: "Nonaktif", teks: dikunci ? "Langganan ini dinonaktifkan oleh pemilik aplikasi." : "Beranda admin dan form pendaftaran ditutup. Halaman informasi sekolah dan cek status masih bisa dibuka, dan data Anda tetap tersimpan.", warna: "bg-red-50 text-red-900" },
  }[st.status];

  return (
    <main className="mx-auto w-full max-w-2xl space-y-6 px-5 py-8">
      <Link className="text-sm tautan" href="/admin">← Beranda admin</Link>
      <h1 className="font-serif text-2xl font-bold">Langganan</h1>

      <section className={`rounded-xl p-4 ${ringkas.warna}`}>
        <p className="text-lg font-bold">{ringkas.judul}</p>
        <p className="mt-1 text-sm">{ringkas.teks}</p>
      </section>

      {dikunci ? (
        <p className="rounded-xl border bg-white p-4 text-sm">Hubungi pemilik aplikasi untuk mengaktifkan kembali. Kode aktivasi tidak bisa dipakai saat langganan dinonaktifkan.</p>
      ) : (<>
        <section className="space-y-3 rounded-xl border bg-white p-4">
          <h2 className="font-bold">{st.status === "aktif" ? "Perpanjang langganan" : "Beli paket 1 tahun"}</h2>
          {p?.harga_paket ? <p className="text-2xl font-bold">{rupiah(p.harga_paket)}<span className="text-sm font-normal text-neutral-600"> / tahun</span></p> : null}
          <ol className="list-decimal space-y-1 pl-5 text-sm">
            <li>Beli di Lynk memakai email admin: <b className="break-all">{st.email}</b>.</li>
            <li>Setelah bayar, Anda diarahkan ke halaman aktivasi. Kode dikirim ke email itu.</li>
            <li>Masukkan kode di bawah.</li>
          </ol>
          {st.status === "aktif" && <p className="text-xs text-neutral-600">Perpanjangan menambah 1 tahun dari tanggal berakhir, sisa hari tidak hangus.</p>}
          {lynk
            ? <a href={lynk} target="_blank" rel="noopener noreferrer" className="flex h-12 items-center justify-center rounded-lg bg-[var(--kuning)] font-bold text-black">Beli sekarang</a>
            : <p className="rounded-lg bg-neutral-100 p-3 text-sm">Link pembelian belum diatur. Hubungi pemilik aplikasi.</p>}
          <Link className="block text-center text-sm tautan" href="/aktivasi">Sudah bayar tetapi belum dapat kode?</Link>
        </section>

        <section className="space-y-3 rounded-xl border bg-white p-4">
          <h2 className="font-bold">Punya kode aktivasi?</h2>
          <KodeForm />
        </section>
      </>)}

      {(st.status === "tenggang" || st.status === "nonaktif") && (
        <section className="rounded-xl border bg-white p-4">
          <h2 className="font-bold">Data Anda</h2>
          <p className="mt-1 text-sm text-neutral-600">Unduh semua data pendaftar sebelum atau sesudah langganan berakhir.</p>
          {/* unduhan berkas, bukan navigasi halaman */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a className="mt-3 flex h-12 items-center justify-center rounded-lg border font-semibold" href="/admin/pendaftar/unduh">Unduh semua data (Excel)</a>
        </section>
      )}
    </main>
  );
}
