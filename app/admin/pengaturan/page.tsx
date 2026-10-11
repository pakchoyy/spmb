import { headers } from "next/headers";
import Link from "next/link";
import { Archive, Building2, CalendarRange, ChevronDown, Eye, ImageIcon, ListPlus, QrCode, Megaphone, Route, ClipboardCheck, Trophy, type LucideIcon } from "lucide-react";
import QRCode from "qrcode";
import { wajibAdmin } from "@/lib/sekolah-saya";
import ProfilForm, { type Profil } from "./profil-form";
import GambarForm from "./gambar-form";
import JalurForm, { type JalurAdmin } from "./jalur-form";
import FieldForm, { type FieldAdmin } from "./field-form";
import Qr from "./qr";
import ArsipForm from "./arsip-form";
import DaftarUlangForm, { type PengaturanDaftarUlang } from "./daftar-ulang-form";
import PengumumanForm from "./pengumuman-form";
import JadwalForm from "./jadwal-form";
import PrestasiForm from "./prestasi-form";
import type { Jadwal, Prestasi } from "@/lib/berkas";
import BukaHash from "./buka-hash";

export const dynamic = "force-dynamic";

const kini = () => Date.now();

/** Satu bagian pengaturan berbentuk tanya-jawab: ketuk judul untuk membuka. Hanya satu yang terbuka (atribut name). */
const Bagian = ({ id, judul, bantu, ikon: Ikon, warna, children }: {
  id: string; judul: string; bantu?: string; ikon: LucideIcon; warna: string; children: React.ReactNode;
}) => (
  <details id={id} name="pengaturan" className="akordeon scroll-mt-4 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5 open:ring-2 open:ring-[var(--biru)]/30">
    <summary className="flex items-center gap-3 p-4">
      <span className="grid size-11 shrink-0 place-items-center rounded-2xl" style={{ background: warna }}><Ikon className="size-5 text-[var(--biru-tua)]" aria-hidden /></span>
      <span className="min-w-0 flex-1">
        <span className="block font-bold">{judul}</span>
        {bantu && <span className="block text-sm text-neutral-600">{bantu}</span>}
      </span>
      <ChevronDown className="akordeon-panah size-5 shrink-0 text-neutral-500 transition-transform" aria-hidden />
    </summary>
    <div className="border-t border-black/5 p-5">{children}</div>
  </details>
);

export default async function Pengaturan() {
  const { db, sekolah } = await wajibAdmin();
  const [{ data: s }, { data: jalur }, { data: fields }, { data: galeri }, { data: st }, { data: rk }] = await Promise.all([
    db.from("sekolah").select("*").eq("id", sekolah.id).single(),
    db.from("jalur").select("*").order("nama"),
    db.from("form_field").select("id,label,tipe,opsi,wajib").order("urutan").order("id"),
    db.from("galeri").select("id,path").order("urutan"),
    db.rpc("status_saya"),
    db.rpc("ringkasan_saya"),
  ]);
  const ringkas = (rk ?? { total: 0, arsip: 0 }) as { total: number; arsip: number };
  const bisaUbah = ["trial", "aktif"].includes((st as { status: string } | null)?.status ?? "");

  // jalur terkunci (opsi A): periode sudah dibuka, atau sudah ada pendaftar
  const jalurAdmin: JalurAdmin[] = await Promise.all((jalur ?? []).map(async (j) => {
    const hitung = (arsip: boolean) => db.from("pendaftar").select("id", { count: "exact", head: true }).eq("jalur_id", j.id).eq("diarsip", arsip);
    const [{ count: aktif }, { count: lama }] = await Promise.all([hitung(false), hitung(true)]);
    const terkunci = (aktif ?? 0) > 0 || (!!j.buka && new Date(j.buka).getTime() <= kini() && (lama ?? 0) === 0);
    return { id: j.id, nama: j.nama, aktif: j.aktif, kuota: j.kuota, buka: j.buka, tutup: j.tutup, syarat_berkas: j.syarat_berkas, terkunci };
  }));

  const h = await headers();
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`;
  const url = `${origin}/${sekolah.slug}`;
  const [svg, png] = await Promise.all([
    QRCode.toString(url, { type: "svg", margin: 2 }),
    QRCode.toDataURL(url, { margin: 2, width: 1024 }),
  ]);

  return (
    <main className="mx-auto w-full max-w-2xl lg:max-w-3xl lg:pt-8 px-4 pb-6 pt-4">
      <header className="rounded-3xl bg-[var(--biru)] p-5 text-white">
        <h1 className="font-serif text-2xl font-bold">Pengaturan sekolah</h1>
        <p className="mt-1 text-sm text-white/85">Atur tampilan halaman dan isi formulir pendaftaran.</p>
        <Link href={`/${sekolah.slug}`} target="_blank" className="btn btn-pil btn-kuning mt-4"><Eye className="size-4" aria-hidden />Lihat seperti orang tua</Link>
      </header>
      {!bisaUbah && <p className="mt-3 rounded-2xl bg-[var(--kuning-muda)] p-3 text-sm">Langganan tidak aktif, pengaturan hanya bisa dibaca. <Link className="tautan" href="/admin/langganan">Kelola langganan</Link></p>}
      <p className="mt-4 px-1 text-sm text-neutral-600">Isi berurutan dari atas. Ketuk bagian untuk membuka; setiap bagian punya tombol simpan sendiri.</p>
      <div className="mt-2 space-y-3">
        <h2 className="px-1 pt-3 text-xs font-bold uppercase tracking-wider text-neutral-500"><span className="mr-1.5 inline-grid size-5 place-items-center rounded-full bg-[var(--biru)] text-[11px] text-white">1</span>Kenalkan sekolah</h2>
        <Bagian id="profil" ikon={Building2} warna="var(--biru-muda)" judul="Profil sekolah" bantu="Nama, alamat, kontak, dan info yang dilihat orang tua."><ProfilForm awal={s as Profil} bisaUbah={bisaUbah} /></Bagian>
        <Bagian id="gambar" ikon={ImageIcon} warna="var(--kuning-muda)" judul="Logo, banner, dan galeri" bantu="Foto bisa dipilih beberapa sekaligus.">
          <GambarForm logo={s?.logo_path ?? null} banner={s?.banner_path ?? null} bannerAtur={(s?.banner_atur ?? { x: 50, y: 50, z: 100 }) as { x: number; y: number; z: number }} warna={s?.warna_aksen ?? "#2449d8"} galeri={galeri ?? []} bisaUbah={bisaUbah} />
        </Bagian>
        <Bagian id="prestasi" ikon={Trophy} warna="var(--kuning-muda)" judul="Prestasi siswa" bantu="Kartu prestasi di halaman sekolah."><PrestasiForm daftar={(s?.prestasi ?? []) as Prestasi[]} gerak={!!s?.prestasi_gerak} bisaUbah={bisaUbah} /></Bagian>
        <h2 className="px-1 pt-3 text-xs font-bold uppercase tracking-wider text-neutral-500"><span className="mr-1.5 inline-grid size-5 place-items-center rounded-full bg-[var(--biru)] text-[11px] text-white">2</span>Pendaftaran</h2>
        <Bagian id="jadwal" ikon={CalendarRange} warna="var(--biru-muda)" judul="Jadwal SPMB" bantu="Tahap pendaftaran sampai daftar ulang."><JadwalForm awal={(s?.jadwal ?? []) as Jadwal[]} bisaUbah={bisaUbah} /></Bagian>
        <Bagian id="jalur" ikon={Route} warna="var(--mint-muda)" judul="Jalur & syarat berkas" bantu="Jalur (domisili, prestasi, …) dan berkas yang diunggah orang tua: KK, akta, dll."><JalurForm jalur={jalurAdmin} bisaUbah={bisaUbah} /></Bagian>
        <Bagian id="form" ikon={ListPlus} warna="var(--ungu-muda)" judul="Pertanyaan formulir" bantu="Isian teks/pilihan tambahan, mis. nama orang tua, asal TK."><FieldForm fields={(fields ?? []) as FieldAdmin[]} bisaUbah={bisaUbah} /></Bagian>
        <h2 className="px-1 pt-3 text-xs font-bold uppercase tracking-wider text-neutral-500"><span className="mr-1.5 inline-grid size-5 place-items-center rounded-full bg-[var(--biru)] text-[11px] text-white">3</span>Setelah pendaftaran</h2>
        <Bagian id="pengumuman" ikon={Megaphone} warna="var(--mint-muda)" judul="Pengumuman hasil" bantu="Langsung, atau serentak pada tanggal tertentu."><PengumumanForm awal={s?.umumkan_pada ?? null} bisaUbah={bisaUbah} /></Bagian>
        <Bagian id="daftar-ulang" ikon={ClipboardCheck} warna="var(--kuning-muda)" judul="Daftar ulang" bantu="Form lanjutan untuk anak yang diterima."><DaftarUlangForm awal={(s?.daftar_ulang ?? {}) as PengaturanDaftarUlang} bisaUbah={bisaUbah} /></Bagian>
        <h2 className="px-1 pt-3 text-xs font-bold uppercase tracking-wider text-neutral-500"><span className="mr-1.5 inline-grid size-5 place-items-center rounded-full bg-[var(--biru)] text-[11px] text-white">4</span>Bagikan & arsip</h2>
        <Bagian id="qr" ikon={QrCode} warna="var(--oranye-muda)" judul="QR dan tautan" bantu="Untuk brosur, spanduk, atau grup WhatsApp."><Qr url={url} svg={svg} png={png} slug={sekolah.slug} /></Bagian>
        <Bagian id="arsip" ikon={Archive} warna="#eceff5" judul="Data tahun lalu" bantu="Arsipkan pendaftar untuk tahun ajaran baru."><ArsipForm slug={sekolah.slug} aktif={ringkas.total} arsip={ringkas.arsip} bisaUbah={bisaUbah} /></Bagian>
      </div>
      <BukaHash />
    </main>
  );
}
