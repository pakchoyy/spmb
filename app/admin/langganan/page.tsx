import Link from "next/link";
import { linkWaBantuan } from "@/lib/merek";
import { hargaTampil, tglPromo } from "@/lib/harga";
import { wajibAdmin } from "@/lib/sekolah-saya";
import { supabaseService } from "@/lib/supabase/admin";
import KodeForm from "./kode-form";
import Ajakan, { type Ajakan as AjakanData } from "./ajakan";

export const dynamic = "force-dynamic";

type St = { status: "trial" | "aktif" | "tenggang" | "nonaktif"; trial_until: string; active_until: string | null; dibatalkan: boolean; dinonaktifkan: boolean; email: string };
const HARI = 86400000;
const kini = () => Date.now();
const tgl = (d: Date) => d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" });
const rupiah = (n: number) => `Rp${n.toLocaleString("id-ID")}`;

export default async function Langganan({ searchParams }: PageProps<"/admin/langganan">) {
  const { t } = await searchParams;
  const tokenAktivasi = typeof t === "string" && /^[0-9a-f]{8,64}$/.test(t) ? t : null;
  const { db, sekolah } = await wajibAdmin();
  const [{ data }, { data: ajakan }] = await Promise.all([db.rpc("status_saya"), db.rpc("ajakan_saya")]);
  const st = data as St | null;
  if (!st) return null;

  // tabel pengaturan hanya bisa dibaca server (service_role), tidak oleh admin sekolah
  const { data: p } = await supabaseService().from("pengaturan").select("lynk_url,harga_paket,harga_coret,promo_sampai").eq("id", 1).maybeSingle();
  const lynk = p?.lynk_url && /^https:\/\//.test(p.lynk_url) ? p.lynk_url : null;

  const akhir = new Date(st.active_until ?? st.trial_until);
  const sisa = Math.max(0, Math.ceil((akhir.getTime() - kini()) / HARI));
  const sisaTenggang = Math.max(0, Math.ceil((akhir.getTime() + 3 * HARI - kini()) / HARI));
  const dikunci = st.dibatalkan || st.dinonaktifkan;

  const ringkas = {
    trial: { judul: "Masa coba (trial)", teks: `Berakhir ${tgl(akhir)} (sisa ${sisa} hari). Semua fitur aktif.`, warna: "bg-[var(--biru-muda)] text-[var(--biru-tua)]" },
    aktif: { judul: "Langganan aktif", teks: `Berlaku sampai ${tgl(akhir)} (sisa ${sisa} hari).`, warna: "bg-[var(--mint-muda)] text-[#0b6b52]" },
    tenggang: { judul: "Masa tenggang", teks: `Masa aktif habis ${tgl(akhir)}. Beranda admin hanya bisa dibaca dan form pendaftaran ditutup. Sisa ${sisaTenggang} hari sebelum nonaktif.`, warna: "bg-[var(--kuning-muda)] text-[#8a5a00]" },
    nonaktif: { judul: "Nonaktif", teks: dikunci ? "Langganan ini dinonaktifkan oleh pemilik aplikasi." : "Beranda admin dan form pendaftaran ditutup. Halaman informasi sekolah dan cek status masih bisa dibuka, dan data Anda tetap tersimpan.", warna: "bg-[var(--oranye-muda)] text-[#a2401a]" },
  }[st.status];

  return (
    <main className="mx-auto w-full max-w-2xl lg:max-w-3xl lg:pt-8 space-y-4 px-4 pb-6 pt-4">
      <header className="rounded-3xl bg-[var(--biru)] p-5 text-white">
        <h1 className="font-serif text-2xl font-bold">Langganan</h1>
        <p className="mt-1 text-sm text-white/85">Status paket, pembelian, kode aktivasi, dan program ajak sekolah.</p>
      </header>

      {tokenAktivasi && (
        <section className="space-y-3 rounded-3xl bg-[var(--mint-muda)] p-5 ring-2 ring-[var(--mint)]">
          <p className="text-lg font-bold text-[#0b6b52]">Sekolah sudah terdaftar 🎉 Lanjutkan aktivasi paket</p>
          <p className="text-sm">Ketuk tombol di bawah, kode aktivasi untuk <b>{st.email}</b> akan muncul. Salin, lalu tempel di kolom &ldquo;Punya kode aktivasi?&rdquo; di halaman ini.</p>
          <Link className="btn btn-utama w-full" href={`/aktivasi?t=${tokenAktivasi}&email=${encodeURIComponent(st.email)}`}>Dapatkan kode aktivasi</Link>
        </section>
      )}

      <section className={`rounded-3xl p-5 ${ringkas.warna}`}>
        <p className="text-lg font-bold">{ringkas.judul}</p>
        <p className="mt-1 text-sm">{ringkas.teks}</p>
      </section>

      {dikunci ? (
        <p className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 text-sm">Hubungi pemilik aplikasi untuk mengaktifkan kembali. Kode aktivasi tidak bisa dipakai saat langganan dinonaktifkan.</p>
      ) : (<>
        <section className="space-y-3 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <h2 className="font-bold">{st.status === "aktif" ? "Perpanjang langganan" : "Beli paket 1 tahun"}</h2>
          {(() => { const h = hargaTampil(p); return h && (
            <div>
              {h.promoAktif && <p className="text-sm font-bold text-[#8a5a00]">Promo pembukaan s.d. {tglPromo(h.promoSampai!)}</p>}
              <p className="text-2xl font-bold">{h.coret && <s className="mr-2 text-base font-normal text-neutral-400">{rupiah(h.coret)}</s>}{rupiah(h.harga)}<span className="text-sm font-normal text-neutral-600"> / tahun</span></p>
            </div>); })()}
          <ol className="list-decimal space-y-1 pl-5 text-sm">
            <li>Ketuk <b>Beli sekarang</b> dan bayar paket di BGY Store.</li>
            <li>Setelah bayar, buka tautan aktivasi yang diberikan, lalu isi email admin: <b className="break-all">{st.email}</b>.</li>
            <li>Salin kode yang muncul (berlaku 1 jam, sekali pakai) dan masukkan di bawah.</li>
          </ol>
          {st.status === "aktif" && <p className="text-xs text-neutral-600">Perpanjangan menambah 1 tahun dari tanggal berakhir, sisa hari tidak hangus.</p>}
          {lynk
            ? <a href={lynk} target="_blank" rel="noopener noreferrer" className="btn btn-kuning w-full">Beli sekarang</a>
            : <p className="rounded-2xl bg-[var(--biru-muda)] p-3 text-sm">Tautan pembelian belum diatur. Hubungi pemilik aplikasi.</p>}
          <a className="block text-center text-sm tautan" href={linkWaBantuan(`Halo, saya admin ${sekolah.nama} (${st.email}). Saya sudah bayar paket SPMB Zone tetapi belum mendapat kode aktivasi.`)} target="_blank" rel="noopener noreferrer">Sudah bayar tetapi belum dapat kode? Chat kami</a>
        </section>

        <section className="space-y-3 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <h2 className="font-bold">Punya kode aktivasi?</h2>
          <KodeForm />
        </section>
      </>)}

      {ajakan && <Ajakan a={ajakan as AjakanData} situs={(process.env.NEXT_PUBLIC_SITE_URL ?? "https://spmbz.web.id").replace(/\/$/, "")} namaSekolah={sekolah.nama} />}

      {(st.status === "tenggang" || st.status === "nonaktif") && (
        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <h2 className="font-bold">Data Anda</h2>
          <p className="mt-1 text-sm text-neutral-600">Unduh semua data pendaftar sebelum atau sesudah langganan berakhir.</p>
          {/* unduhan berkas, bukan navigasi halaman */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a className="btn btn-lembut mt-3 w-full" href="/admin/pendaftar/unduh">Unduh semua data (Excel)</a>
        </section>
      )}
    </main>
  );
}
