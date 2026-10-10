import type { Metadata } from "next";
import Link from "next/link";
import { supabaseService } from "@/lib/supabase/admin";
import TombolCoba from "./tombol-coba";

export const revalidate = 3600; // harga dibaca dari pengaturan; cukup segar tiap jam

export const metadata: Metadata = {
  title: "Gerbang — SPMB online untuk sekolah",
  description: "Halaman pendaftaran SPMB (dulu PPDB) untuk sekolah Anda. Orang tua daftar tanpa akun, panitia periksa berkas dari HP. Coba gratis 7 hari.",
};

async function ambilHarga(): Promise<number | null> {
  try {
    const { data } = await supabaseService().from("pengaturan").select("harga_paket").eq("id", 1).maybeSingle();
    return data?.harga_paket ?? null;
  } catch {
    return null; // build tanpa database: tampilkan tanpa harga
  }
}

const contoh = process.env.NEXT_PUBLIC_CONTOH_SLUG;
const cta = "inline-flex h-14 items-center justify-center rounded-xl px-7 text-lg font-bold";

const LANGKAH = [
  { j: "Daftar dan atur sekolah", t: "Buat akun, pilih alamat halaman, isi profil, dan atur jalur serta form pendaftaran. Masa coba 7 hari langsung berjalan." },
  { j: "Bagikan ke orang tua", t: "Unduh QR dan link halaman sekolah untuk brosur, spanduk, atau grup WhatsApp." },
  { j: "Periksa dari HP", t: "Panitia melihat pendaftar baru, memeriksa berkas, lalu menetapkan Diterima, Cadangan, atau Ditolak." },
];
const FITUR = [
  ["Halaman sekolah sendiri", "Alamat domain.com/nama-sekolah dengan logo, warna, keunggulan, jalur, jadwal, dan galeri."],
  ["Form sesuai kebutuhan", "Tambah, ubah, dan urutkan isian tanpa batas jumlah. Jalur Domisili, Afirmasi, Prestasi, dan Mutasi bersifat opsional."],
  ["Berkas dari HP", "Foto dikecilkan otomatis, batas 2 MB, dan unggahan yang gagal bisa diulang tanpa mengisi form dari awal."],
  ["Dashboard panitia", "Daftar tugas hari ini, filter, catatan alasan, peringatan data ganda, tombol WhatsApp, cetak, dan unduh ke Excel."],
  ["Data anak lebih aman", "Berkas di penyimpanan privat, dibuka lewat tautan sementara. Setiap sekolah hanya melihat datanya sendiri."],
  ["Ringan di sinyal lemah", "Isian tersimpan di HP orang tua bila sinyal putus, dan halaman sekolah dibuat ringan."],
];
const FAQ = [
  ["Apa bedanya SPMB dengan PPDB?", "SPMB adalah nama baru dari PPDB. Aplikasi ini untuk pendaftaran siswa baru di sekolah Anda."],
  ["Apakah orang tua perlu membuat akun?", "Tidak. Orang tua mengisi form, mengunggah berkas, lalu mendapat nomor pendaftaran. Status bisa dicek dengan nomor itu dan tanggal lahir anak."],
  ["Bagaimana cara berlangganan?", "Setelah masa coba, beli paket tahunan lewat Lynk dengan email admin sekolah. Kode aktivasi dikirim ke email itu, lalu dimasukkan di menu Langganan."],
  ["Bagaimana jika langganan habis?", "Ada masa tenggang 3 hari: dashboard hanya bisa dibaca dan form ditutup. Setelah itu sekolah nonaktif, tetapi data tetap tersimpan dan bisa diunduh ke Excel."],
  ["Apakah zonasi atau nilai dihitung otomatis?", "Belum. Panitia menetapkan status secara manual setelah memeriksa data dan berkas. Notifikasi WhatsApp otomatis juga belum ada; panitia menghubungi orang tua lewat tombol WhatsApp."],
  ["Berapa lama data disimpan?", "Selama sekolah berlangganan, dan tetap tersimpan setelah nonaktif. Admin bisa mengarsipkan atau menghapus data tahun lalu."],
];

const Gerbang = () => (
  <svg viewBox="0 0 24 24" aria-hidden className="size-8" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 21V10a8 8 0 0 1 16 0v11M9 21v-7a3 3 0 0 1 6 0v7" /></svg>
);

export default async function Beranda() {
  const harga = await ambilHarga();
  return (
    <div className="mx-auto w-full max-w-4xl">
      <header className="flex items-center justify-between px-5 py-4">
        <span className="flex items-center gap-2 font-serif text-xl font-bold text-[var(--biru)]"><Gerbang />Gerbang</span>
        <Link href="/masuk" className="rounded-lg border bg-white px-4 py-2 text-sm font-semibold">Masuk</Link>
      </header>

      <section className="px-5 pb-14 pt-8 text-center">
        <p className="inline-block rounded-full bg-[var(--kuning)]/30 px-4 py-1 text-sm font-semibold">SPMB (dulu PPDB) online</p>
        <h1 className="mx-auto mt-4 max-w-2xl font-serif text-4xl font-bold leading-tight sm:text-5xl">Pendaftaran siswa baru yang rapi, tanpa ribet</h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-neutral-700">Sekolah Anda mendapat halaman pendaftaran sendiri. Orang tua daftar dari HP tanpa akun, panitia memeriksa berkas dengan mudah.</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <TombolCoba className={`${cta} bg-[var(--biru)] text-white`}>Coba gratis 7 hari</TombolCoba>
          {contoh && <Link href={`/${contoh}`} className={`${cta} border-2 border-[var(--biru)] bg-white text-[var(--biru)]`}>Lihat contoh halaman</Link>}
        </div>
        <p className="mt-3 text-sm text-neutral-600">Tanpa kartu kredit. Semua fitur aktif selama masa coba.</p>
      </section>

      <section className="bg-[var(--biru)] px-5 py-14 text-white">
        <h2 className="text-center font-serif text-3xl font-bold">Mulai dalam tiga langkah</h2>
        <ol className="mt-8 grid gap-4 sm:grid-cols-3">
          {LANGKAH.map((l, i) => (
            <li key={l.j} className="rounded-t-[3rem] rounded-b-xl bg-white/10 p-6 pt-8">
              <span className="grid size-10 place-items-center rounded-full bg-[var(--kuning)] font-bold text-black">{i + 1}</span>
              <h3 className="mt-3 text-lg font-bold">{l.j}</h3>
              <p className="mt-1 text-white/85">{l.t}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="px-5 py-14">
        <h2 className="text-center font-serif text-3xl font-bold">Yang sekolah dapatkan</h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {FITUR.map(([j, t]) => (
            <li key={j} className="rounded-xl border bg-white p-5">
              <h3 className="font-bold">{j}</h3>
              <p className="mt-1 text-neutral-700">{t}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-[#fff6e0] px-5 py-14 text-center">
        <h2 className="font-serif text-3xl font-bold">Harga</h2>
        <div className="mx-auto mt-6 max-w-sm rounded-t-[4rem] rounded-b-2xl border-2 border-[var(--kuning)] bg-white p-8 pt-10">
          <p className="font-semibold">Paket tahunan</p>
          {harga
            ? <p className="mt-1 font-serif text-4xl font-bold">Rp{harga.toLocaleString("id-ID")}<span className="text-base font-normal text-neutral-600"> / tahun</span></p>
            : <p className="mt-1 font-serif text-2xl font-bold">Harga segera diumumkan</p>}
          <ul className="mt-4 space-y-1 text-left">
            {["Coba gratis 7 hari dulu", "Pendaftar tanpa batas jumlah", "Semua fitur, tanpa biaya tambahan", "Data bisa diunduh kapan saja"].map((x) => (
              <li key={x} className="flex gap-2"><span className="font-bold text-green-700">✓</span>{x}</li>
            ))}
          </ul>
          <TombolCoba className={`${cta} mt-6 w-full bg-[var(--biru)] text-white`}>Coba gratis</TombolCoba>
        </div>
      </section>

      <section className="px-5 py-14">
        <h2 className="text-center font-serif text-3xl font-bold">Pertanyaan umum</h2>
        <div className="mx-auto mt-8 max-w-2xl space-y-2">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group rounded-xl border bg-white p-4">
              <summary className="cursor-pointer font-semibold">{q}</summary>
              <p className="mt-2 text-neutral-700">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="border-t px-5 py-8 text-center text-sm text-neutral-600">
        <p><Link className="underline" href="/masuk">Masuk admin sekolah</Link> · <Link className="underline" href="/daftar">Daftar sekolah</Link></p>
        <p className="mt-2"><Link className="underline" href="/syarat">Syarat dan Ketentuan</Link> · <Link className="underline" href="/privasi">Kebijakan Privasi</Link></p>
        <p className="mt-2">© {new Date().getFullYear()} Gerbang · SPMB Multi-Sekolah</p>
      </footer>
    </div>
  );
}
