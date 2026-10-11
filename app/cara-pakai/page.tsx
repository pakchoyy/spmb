import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Lightbulb, School, Users } from "lucide-react";
import { Logo } from "@/components/logo";
import { Footer } from "@/components/footer";
import { BantuanWa } from "@/components/bantuan-wa";
import { Kartu, Ketuk, Kolom, Layar, Pil, Teks, Tombol } from "@/components/ilustrasi-hp";
import { HOST_APP, NAMA_APP } from "@/lib/merek";
import TombolCoba from "../tombol-coba";

export const metadata: Metadata = {
  title: `Cara pakai ${NAMA_APP}`,
  description: "Panduan bergambar untuk admin sekolah dan orang tua: dari daftar, mengatur halaman SPMB, sampai memeriksa pendaftar.",
};

type Langkah = { judul: string; teks: string; tips?: string; gambar: React.ReactNode };

const MINT = "var(--mint)", KUNING = "var(--kuning)";

const ADMIN: Langkah[] = [
  {
    judul: "Daftar dan pilih alamat halaman",
    teks: "Ketuk Coba gratis, lalu daftar dengan Google atau email. Isi nama sekolah dan pilih alamat halaman. Masa coba 7 hari langsung berjalan.",
    tips: "Pilih alamat yang pendek dan mudah diingat, misalnya sdn1menteng.",
    gambar: (
      <Layar judul="Coba gratis 7 hari" label="Layar daftar sekolah">
        <rect x="24" y="72" width="132" height="20" rx="7" fill="#fff" stroke="#c9cfe3" />
        <Teks y={85} t="G  Daftar dengan Google" ukuran={7.5} tebal tengah />
        <Ketuk x={148} y={82} />
        <Kolom y={108} label="Nama sekolah" isi="SD Negeri 1 Menteng" />
        <Kolom y={142} label="Alamat halaman" isi={`${HOST_APP.slice(0, 14)}/sdn1menteng`} />
        <Teks y={176} t="Tersedia ✓" ukuran={7.5} tebal warna="#0b6b52" />
        <Kolom y={192} label="Email admin" />
        <Tombol y={236} teks="Buat akun sekolah" />
      </Layar>
    ),
  },
  {
    judul: "Isi profil dan pasang logo",
    teks: "Buka Pengaturan → Profil. Isi alamat, nomor WhatsApp sekolah, dan keunggulan. Di bagian Foto, pasang logo dan foto sekolah.",
    tips: "Pilih warna utama yang sama dengan logo, halaman sekolah jadi lebih menarik.",
    gambar: (
      <Layar judul="Pengaturan sekolah" label="Layar pengaturan profil">
        <Pil x={22} y={66} teks="Profil" latar="var(--biru)" warna="#fff" />
        <Pil x={62} y={66} teks="Foto" latar="var(--biru-muda)" warna="var(--biru-tua)" />
        <Pil x={96} y={66} teks="Jalur" latar="var(--biru-muda)" warna="var(--biru-tua)" />
        <Kolom y={96} label="Alamat" isi="Jl. Menteng Raya 1" />
        <Kolom y={130} label="WhatsApp sekolah" isi="0812 3456 7890" />
        <rect x="24" y="162" width="132" height="44" rx="9" fill="var(--biru-muda)" stroke="var(--biru)" strokeDasharray="3 3" />
        <Teks y={188} t="Pasang logo" ukuran={8} tebal warna="var(--biru-tua)" tengah />
        <Ketuk x={146} y={184} />
        <Tombol y={222} teks="Simpan profil" />
      </Layar>
    ),
  },
  {
    judul: "Atur jalur, kuota, dan berkas",
    teks: "Di Pengaturan → Jalur, pilih jalur yang dipakai (Domisili, Afirmasi, Prestasi, Mutasi), isi kuota, jadwal buka–tutup, dan berkas yang diminta.",
    tips: "Jalur boleh dikosongkan. Tanpa jalur, formulir langsung menerima pendaftar.",
    gambar: (
      <Layar judul="Jalur SPMB" label="Layar pengaturan jalur">
        <Kartu y={68} h={96} />
        <Teks x={30} y={84} t="Domisili" ukuran={9} tebal />
        <Pil x={118} y={74} teks="Aktif" latar="var(--mint-muda)" warna="#0b6b52" />
        <Kolom y={100} label="Kuota" isi="30" />
        <Teks x={30} y={140} t="Berkas: Kartu Keluarga, Akta" ukuran={7.5} warna="#55607a" />
        <Teks x={30} y={152} t="Buka 1 Juni – Tutup 30 Juni" ukuran={7.5} warna="#55607a" />
        <Tombol y={176} teks="Simpan jalur" />
        <Ketuk x={146} y={186} />
        <Kartu y={208} h={30} judul="+ Tambah jalur" baris={0} warna="var(--biru-muda)" />
      </Layar>
    ),
  },
  {
    judul: "Tambah isian formulir",
    teks: "Nama dan tanggal lahir anak sudah ada. Di Pengaturan → Form, tambahkan pertanyaan lain yang sekolah perlukan, misalnya nama orang tua atau asal TK.",
    gambar: (
      <Layar judul="Isian formulir" label="Layar pengaturan isian formulir">
        <Kartu y={68} h={26} judul="Nama orang tua" baris={0} />
        <Kartu y={100} h={26} judul="Asal TK / PAUD" baris={0} />
        <Kartu y={140} h={92} warna="#fff" />
        <Kolom y={156} label="Nama isian" isi="Pekerjaan orang tua" />
        <Teks x={30} y={196} t="Jenis: Pilihan   ☑ Wajib diisi" ukuran={7.5} warna="#55607a" />
        <Tombol y={206} teks="Tambah isian" />
        <Ketuk x={146} y={216} />
      </Layar>
    ),
  },
  {
    judul: "Unduh QR dan bagikan",
    teks: "Di Pengaturan → QR, unduh QR untuk brosur atau spanduk. Dari beranda admin, ketuk Bagikan ke orang tua untuk mengirim tautan ke grup WhatsApp.",
    gambar: (
      <Layar judul="QR dan tautan" label="Layar QR sekolah">
        <rect x="50" y="74" width="80" height="80" rx="10" fill="#fff" stroke="var(--biru-muda)" strokeWidth="4" />
        {[0, 1, 2, 3, 4, 5].map((i) => [0, 1, 2, 3, 4, 5].map((j) => ((i * 7 + j * 3) % 4 < 2) && (
          <rect key={`${i}-${j}`} x={60 + i * 10} y={84 + j * 10} width="8" height="8" fill="#14204a" />
        )))}
        <Teks y={172} t={`${HOST_APP.slice(0, 16)}/sdn1menteng`} ukuran={7} warna="#55607a" tengah />
        <rect x="24" y="184" width="64" height="20" rx="10" fill="#fff" stroke="#c9cfe3" />
        <Teks x={36} y={197} t="Unduh PNG" ukuran={7.5} tebal />
        <rect x="92" y="184" width="64" height="20" rx="10" fill="#fff" stroke="#c9cfe3" />
        <Teks x={104} y={197} t="Unduh SVG" ukuran={7.5} tebal />
        <Ketuk x={82} y={194} />
        <Tombol y={214} teks="Bagikan ke orang tua" warna={KUNING} gelap />
      </Layar>
    ),
  },
  {
    judul: "Periksa pendaftar",
    teks: "Beranda admin menampilkan tugas hari ini dan daftar pendaftar. Ketuk nama anak untuk membuka data dan berkasnya, lalu pilih Diterima, Cadangan, atau Ditolak.",
    tips: "Untuk Cadangan dan Ditolak, tulis catatan alasan. Orang tua bisa membacanya di halaman cek status.",
    gambar: (
      <Layar judul="Budi Santoso" label="Layar detail pendaftar">
        <Pil x={22} y={66} teks="Baru" latar="var(--biru-muda)" warna="var(--biru-tua)" />
        <Kartu y={86} h={36} judul="Kartu Keluarga" baris={1} />
        <Kartu y={126} h={36} judul="Akta Kelahiran" baris={1} />
        <rect x="20" y="172" width="68" height="22" rx="7" fill="var(--mint-muda)" stroke={MINT} strokeWidth="1.5" />
        <Teks x={32} y={186} t="Diterima" ukuran={8} tebal warna="#0b6b52" />
        <rect x="92" y="172" width="68" height="22" rx="7" fill="#fff" stroke="#e3e7f3" />
        <Teks x={102} y={186} t="Cadangan" ukuran={8} tebal warna="#8a5a00" />
        <Ketuk x={82} y={183} />
        <Tombol y={206} teks="Simpan status" />
        <Tombol y={232} teks="WhatsApp orang tua" warna="#1faa59" />
      </Layar>
    ),
  },
  {
    judul: "Unduh ke Excel dan cetak",
    teks: "Di beranda admin, ketuk Excel untuk mengunduh semua data pendaftar sesuai filter, atau Cetak untuk mencetak daftar.",
    gambar: (
      <Layar judul="Daftar pendaftar" label="Layar daftar pendaftar">
        <Kolom y={70} label="" isi="Cari nama atau nomor" />
        <rect x="24" y="98" width="56" height="18" rx="9" fill="var(--biru-muda)" />
        <Teks x={38} y={110} t="Excel" ukuran={7.5} tebal warna="var(--biru-tua)" />
        <rect x="84" y="98" width="56" height="18" rx="9" fill="#fff" stroke="#c9cfe3" />
        <Teks x={98} y={110} t="Cetak" ukuran={7.5} tebal />
        <Ketuk x={76} y={107} />
        <Kartu y={126} h={34} judul="Budi Santoso" baris={1} />
        <Kartu y={164} h={34} judul="Siti Aminah" baris={1} />
        <Kartu y={202} h={34} judul="Raka Pratama" baris={1} />
      </Layar>
    ),
  },
  {
    judul: "Berlangganan",
    teks: "Sebelum masa coba habis, buka Langganan dan ketuk Beli sekarang. Kode aktivasi dikirim ke email admin; masukkan kodenya di halaman yang sama.",
    tips: "Perpanjangan menambah 1 tahun dari tanggal berakhir, sisa hari tidak hilang.",
    gambar: (
      <Layar judul="Langganan" label="Layar langganan">
        <rect x="20" y="68" width="140" height="44" rx="10" fill="var(--biru-muda)" />
        <Teks x={30} y={86} t="Masa coba gratis" ukuran={9} tebal warna="var(--biru-tua)" />
        <Teks x={30} y={100} t="Sisa 5 hari" ukuran={7.5} warna="var(--biru-tua)" />
        <Tombol y={122} teks="Beli sekarang" warna={KUNING} gelap />
        <Kolom y={162} label="Kode aktivasi" isi="SPMB-AB3CD" />
        <Tombol y={194} teks="Aktifkan" />
        <Ketuk x={146} y={204} />
      </Layar>
    ),
  },
  {
    judul: "Setelah musim selesai",
    teks: "Unduh data ke Excel, lalu di Pengaturan → Arsip ketuk Arsipkan semua pendaftar. Kuota dan jadwal jalur bisa diatur ulang untuk tahun berikutnya.",
    gambar: (
      <Layar judul="Data tahun lalu" label="Layar arsip data">
        <rect x="20" y="68" width="68" height="40" rx="9" fill="#fff" stroke="#e3e7f3" />
        <Teks x={54} y={84} t="Aktif" ukuran={7} warna="#55607a" tengah />
        <Teks x={54} y={100} t="124" ukuran={12} tebal tengah />
        <rect x="92" y="68" width="68" height="40" rx="9" fill="#fff" stroke="#e3e7f3" />
        <Teks x={126} y={84} t="Diarsipkan" ukuran={7} warna="#55607a" tengah />
        <Teks x={126} y={100} t="0" ukuran={12} tebal tengah />
        <rect x="24" y="120" width="132" height="20" rx="7" fill="var(--biru-muda)" />
        <Teks y={133.5} t="Unduh data (Excel)" ukuran={8} tebal warna="var(--biru-tua)" tengah />
        <rect x="24" y="148" width="132" height="20" rx="7" fill="#fff" stroke="var(--biru)" strokeWidth="1.5" />
        <Teks y={161.5} t="Arsipkan semua pendaftar" ukuran={8} tebal warna="var(--biru)" tengah />
        <Ketuk x={146} y={158} />
      </Layar>
    ),
  },
];

const ORTU: Langkah[] = [
  {
    judul: "Buka halaman sekolah",
    teks: "Pindai QR di brosur atau buka tautan dari sekolah. Baca jalur, jadwal, dan berkas yang perlu disiapkan, lalu ketuk Daftar sekarang.",
    gambar: (
      <Layar judul="SD Negeri 1 Menteng" warna={MINT} label="Halaman sekolah">
        <Pil x={22} y={66} teks="Pendaftaran dibuka" latar="var(--kuning)" warna="#1b1b1b" />
        <Kartu y={88} h={46} judul="Jalur Domisili" baris={2} />
        <Kartu y={140} h={46} judul="Siapkan berkas ini" baris={2} />
        <Tombol y={266} teks="Daftar sekarang" warna={MINT} />
        <Ketuk x={146} y={276} />
      </Layar>
    ),
  },
  {
    judul: "Isi data anak",
    teks: "Pilih jalur, isi nama lengkap dan tanggal lahir anak, serta nomor WhatsApp orang tua. Data tersimpan di HP walau sinyal putus.",
    gambar: (
      <Layar judul="Formulir pendaftaran" warna={MINT} label="Formulir orang tua">
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <circle cx={48 + i * 42} cy="76" r="8" fill={i === 0 ? MINT : "#d6dcf0"} />
            <text x={48 + i * 42} y="79" textAnchor="middle" fontSize="8" fontWeight="700" fill={i === 0 ? "#fff" : "#55607a"}>{i + 1}</text>
          </g>
        ))}
        <Kolom y={100} label="Nama lengkap anak" isi="Budi Santoso" />
        <Kolom y={134} label="Tanggal lahir anak" isi="12 Maret 2019" />
        <Kolom y={168} label="Nomor WhatsApp orang tua" isi="0812 3456 7890" />
        <Tombol y={266} teks="Lanjut ›" warna={MINT} />
        <Ketuk x={146} y={276} />
      </Layar>
    ),
  },
  {
    judul: "Unggah berkas",
    teks: "Setelah data terkirim, ketuk Ambil foto untuk memotret berkas langsung dengan kamera, atau Pilih file dari galeri.",
    tips: "Foto dikecilkan otomatis. Kalau gagal, cukup unggah ulang tanpa mengisi formulir lagi.",
    gambar: (
      <Layar judul="Unggah berkas" warna={MINT} label="Layar unggah berkas">
        <Kartu y={68} h={64} judul="Kartu Keluarga" baris={0} />
        <Pil x={112} y={74} teks="Terkirim" latar="var(--mint-muda)" warna="#0b6b52" />
        <rect x="28" y="92" width="124" height="32" rx="6" fill="#d6dcf0" />
        <Kartu y={140} h={50} judul="Akta Kelahiran" baris={0} />
        <rect x="28" y="162" width="60" height="20" rx="10" fill={MINT} />
        <Teks x={36} y={175} t="Ambil foto" ukuran={7.5} tebal warna="#fff" />
        <rect x="92" y="162" width="60" height="20" rx="10" fill="#fff" stroke="#c9cfe3" />
        <Teks x={102} y={175} t="Pilih file" ukuran={7.5} tebal />
        <Ketuk x={84} y={172} />
      </Layar>
    ),
  },
  {
    judul: "Simpan bukti pendaftaran",
    teks: "Nomor pendaftaran muncul di kartu bukti. Ketuk Simpan sebagai gambar atau Kirim ke WA supaya tidak hilang.",
    gambar: (
      <Layar judul="Pendaftaran terkirim!" warna={MINT} label="Bukti pendaftaran">
        <rect x="24" y="70" width="132" height="110" rx="12" fill="#fff" stroke="#e3e7f3" />
        <path d="M24 82a12 12 0 0 1 12-12h108a12 12 0 0 1 12 12v24H24z" fill={MINT} />
        <Teks y={92} t="BUKTI PENDAFTARAN" ukuran={7} tebal warna="#fff" tengah />
        <line x1="30" y1="118" x2="150" y2="118" stroke="#d6dcf0" strokeDasharray="4 3" />
        <Teks y={136} t="Nomor pendaftaran" ukuran={7} warna="#55607a" tengah />
        <Teks y={158} t="26-A1B2C3" ukuran={16} tebal warna={MINT} tengah />
        <Tombol y={192} teks="Simpan sebagai gambar" />
        <Ketuk x={146} y={202} />
        <Tombol y={218} teks="Kirim ke WA" warna="#1faa59" />
      </Layar>
    ),
  },
  {
    judul: "Cek status",
    teks: "Buka halaman sekolah, ketuk Cek status pendaftaran, lalu masukkan nomor pendaftaran dan tanggal lahir anak.",
    gambar: (
      <Layar judul="Cek status" warna={MINT} label="Layar cek status">
        <Kolom y={72} label="Nomor pendaftaran" isi="26-A1B2C3" />
        <Kolom y={106} label="Tanggal lahir anak" isi="12 Maret 2019" />
        <Tombol y={136} teks="Cek status" />
        <rect x="20" y="168" width="140" height="62" rx="12" fill="var(--mint-muda)" />
        <Teks x={30} y={190} t="✓ Diterima" ukuran={13} tebal warna="#0b6b52" />
        <Teks x={30} y={208} t="Ikuti arahan sekolah untuk" ukuran={7.5} warna="#17203d" />
        <Teks x={30} y={219} t="daftar ulang." ukuran={7.5} warna="#17203d" />
      </Layar>
    ),
  },
];

function Bagian({ id, judul, sub, ikon: Ikon, warna, langkah }: {
  id: string; judul: string; sub: string; ikon: typeof School; warna: string; langkah: Langkah[];
}) {
  return (
    <section id={id} className="scroll-mt-16 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-2xl text-white" style={{ background: warna }}><Ikon className="size-6" aria-hidden /></span>
          <div>
            <h2 className="font-serif text-2xl font-bold">{judul}</h2>
            <p className="text-sm text-neutral-600">{sub}</p>
          </div>
        </div>
        <ol className="mt-6 space-y-4">
          {langkah.map((l, i) => (
            <li key={l.judul} className="grid items-center gap-5 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:grid-cols-[1fr_220px]">
              <div>
                <span className="grid size-9 place-items-center rounded-full text-sm font-bold text-white" style={{ background: warna }}>{i + 1}</span>
                <h3 className="mt-3 text-lg font-bold">{l.judul}</h3>
                <p className="mt-1 text-neutral-700">{l.teks}</p>
                {l.tips && (
                  <p className="mt-3 flex gap-2 rounded-2xl bg-[var(--kuning-muda)] p-3 text-sm">
                    <Lightbulb className="size-4 shrink-0 text-[#b7780a]" aria-hidden />{l.tips}
                  </p>
                )}
              </div>
              {l.gambar}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default function CaraPakai() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-black/5 bg-[var(--background)]/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Logo />
          <Link href="/masuk" className="btn btn-garis btn-pil">Masuk</Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="px-4 pb-2 pt-8 text-center">
          <p className="text-sm font-bold uppercase tracking-wide text-[var(--biru)]">Panduan</p>
          <h1 className="mt-1 font-serif text-4xl font-bold">Cara pakai {NAMA_APP}</h1>
          <p className="mx-auto mt-2 max-w-md text-neutral-700">Langkah demi langkah dengan gambar, untuk sekolah dan orang tua.</p>
          <nav className="mt-5 flex justify-center gap-2">
            <a href="#sekolah" className="btn btn-pil btn-utama"><School className="size-4" aria-hidden />Untuk sekolah</a>
            <a href="#orang-tua" className="btn btn-pil btn-lembut"><Users className="size-4" aria-hidden />Untuk orang tua</a>
          </nav>
        </section>

        <Bagian id="sekolah" judul="Untuk admin sekolah" sub="Dari daftar sampai memeriksa pendaftar." ikon={School} warna="var(--biru)" langkah={ADMIN} />
        <Bagian id="orang-tua" judul="Untuk orang tua" sub="Daftar dari HP tanpa membuat akun." ikon={Users} warna="var(--mint)" langkah={ORTU} />

        <section className="px-4 pb-10">
          <div className="mx-auto max-w-md space-y-3 text-center">
            <TombolCoba className="btn btn-utama h-14 w-full text-lg">Coba gratis 7 hari <ArrowRight className="size-5" aria-hidden /></TombolCoba>
            <BantuanWa />
          </div>
        </section>
      </main>

      <Footer iklan />
    </div>
  );
}
