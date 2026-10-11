import { headers } from "next/headers";
import Link from "next/link";
import { Archive, Building2, Eye, ImageIcon, ListPlus, QrCode, Route } from "lucide-react";
import QRCode from "qrcode";
import { wajibAdmin } from "@/lib/sekolah-saya";
import ProfilForm, { type Profil } from "./profil-form";
import GambarForm from "./gambar-form";
import JalurForm, { type JalurAdmin } from "./jalur-form";
import FieldForm, { type FieldAdmin } from "./field-form";
import Qr from "./qr";
import ArsipForm from "./arsip-form";

export const dynamic = "force-dynamic";

const kini = () => Date.now();

const Bagian = ({ id, judul, bantu, children }: { id: string; judul: string; bantu?: string; children: React.ReactNode }) => (
  <section id={id} className="scroll-mt-20 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
    <h2 className="font-serif text-xl font-bold">{judul}</h2>
    {bantu && <p className="mt-1 text-sm text-neutral-600">{bantu}</p>}
    <div className="mt-4">{children}</div>
  </section>
);

const TAB = [["profil", "Profil", Building2], ["gambar", "Foto", ImageIcon], ["jalur", "Jalur", Route], ["form", "Form", ListPlus], ["qr", "QR", QrCode], ["arsip", "Arsip", Archive]] as const;

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
    <main className="mx-auto w-full max-w-2xl px-4 pb-6 pt-4">
      <header className="rounded-3xl bg-[var(--biru)] p-5 text-white">
        <h1 className="font-serif text-2xl font-bold">Pengaturan sekolah</h1>
        <p className="mt-1 text-sm text-white/85">Atur tampilan halaman dan isi formulir pendaftaran.</p>
        <Link href={`/${sekolah.slug}`} target="_blank" className="btn btn-pil btn-kuning mt-4"><Eye className="size-4" aria-hidden />Lihat seperti orang tua</Link>
      </header>
      {!bisaUbah && <p className="mt-3 rounded-2xl bg-[var(--kuning-muda)] p-3 text-sm">Langganan tidak aktif, pengaturan hanya bisa dibaca. <Link className="tautan" href="/admin/langganan">Kelola langganan</Link></p>}
      <nav className="sticky top-0 z-20 -mx-4 mt-3 overflow-x-auto bg-[var(--background)]/95 px-4 py-2 backdrop-blur">
        <ul className="flex gap-2">
          {TAB.map(([i, l, Ikon]) => (
            <li key={i}><a href={`#${i}`} className="btn btn-pil btn-lembut whitespace-nowrap"><Ikon className="size-4" aria-hidden />{l}</a></li>
          ))}
        </ul>
      </nav>
      <div className="mt-2 space-y-4">
        <Bagian id="profil" judul="Profil sekolah" bantu="Tampil di halaman sekolah yang dilihat orang tua."><ProfilForm awal={s as Profil} bisaUbah={bisaUbah} /></Bagian>
        <Bagian id="gambar" judul="Logo, banner, dan galeri">
          <GambarForm logo={s?.logo_path ?? null} banner={s?.banner_path ?? null} galeri={galeri ?? []} bisaUbah={bisaUbah} />
        </Bagian>
        <Bagian id="jalur" judul="Jalur SPMB" bantu="Boleh dikosongkan. Tanpa jalur, form langsung menerima pendaftar."><JalurForm jalur={jalurAdmin} bisaUbah={bisaUbah} /></Bagian>
        <Bagian id="form" judul="Isian formulir" bantu="Pertanyaan tambahan untuk orang tua."><FieldForm fields={(fields ?? []) as FieldAdmin[]} bisaUbah={bisaUbah} /></Bagian>
        <Bagian id="qr" judul="QR dan tautan" bantu="Cetak di brosur atau spanduk, atau kirim ke grup WhatsApp."><Qr url={url} svg={svg} png={png} slug={sekolah.slug} /></Bagian>
        <Bagian id="arsip" judul="Data tahun lalu"><ArsipForm slug={sekolah.slug} aktif={ringkas.total} arsip={ringkas.arsip} bisaUbah={bisaUbah} /></Bagian>
      </div>
    </main>
  );
}
