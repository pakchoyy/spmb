import { headers } from "next/headers";
import Link from "next/link";
import QRCode from "qrcode";
import { wajibAdmin } from "@/lib/sekolah-saya";
import ProfilForm, { type Profil } from "./profil-form";
import GambarForm from "./gambar-form";
import JalurForm, { type JalurAdmin } from "./jalur-form";
import FieldForm, { type FieldAdmin } from "./field-form";
import Qr from "./qr";

export const dynamic = "force-dynamic";

const kini = () => Date.now();

const Bagian = ({ id, judul, children }: { id: string; judul: string; children: React.ReactNode }) => (
  <section id={id} className="scroll-mt-4 border-t px-5 py-8">
    <h2 className="mb-4 font-serif text-xl font-bold">{judul}</h2>
    {children}
  </section>
);

export default async function Pengaturan() {
  const { db, sekolah } = await wajibAdmin();
  const [{ data: s }, { data: jalur }, { data: fields }, { data: galeri }, { data: st }] = await Promise.all([
    db.from("sekolah").select("*").eq("id", sekolah.id).single(),
    db.from("jalur").select("*").order("nama"),
    db.from("form_field").select("id,label,tipe,opsi,wajib").order("urutan").order("id"),
    db.from("galeri").select("id,path").order("urutan"),
    db.rpc("status_saya"),
  ]);
  const bisaUbah = ["trial", "aktif"].includes((st as { status: string } | null)?.status ?? "");

  // jalur terkunci (opsi A): periode sudah dibuka, atau sudah ada pendaftar
  const jalurAdmin: JalurAdmin[] = await Promise.all((jalur ?? []).map(async (j) => {
    const { count } = await db.from("pendaftar").select("id", { count: "exact", head: true }).eq("jalur_id", j.id);
    const terkunci = (!!j.buka && new Date(j.buka).getTime() <= kini()) || (count ?? 0) > 0;
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
    <main className="mx-auto w-full max-w-2xl pb-16">
      <header className="px-5 pt-8">
        <Link className="text-sm underline" href="/admin">← Dashboard</Link>
        <h1 className="mt-2 font-serif text-2xl font-bold">Pengaturan sekolah</h1>
        {!bisaUbah && <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Langganan tidak aktif, pengaturan hanya bisa dibaca. <Link className="underline" href="/admin/langganan">Kelola langganan</Link></p>}
        <nav className="mt-4 flex flex-wrap gap-2 text-sm">
          {[["profil", "Profil"], ["gambar", "Logo & foto"], ["jalur", "Jalur"], ["form", "Form"], ["qr", "QR"]].map(([i, l]) => (
            <a key={i} href={`#${i}`} className="rounded-full border px-3 py-1">{l}</a>
          ))}
        </nav>
      </header>
      <div className="mt-6">
        <Bagian id="profil" judul="Profil sekolah"><ProfilForm awal={s as Profil} bisaUbah={bisaUbah} /></Bagian>
        <Bagian id="gambar" judul="Logo, banner, dan galeri">
          <GambarForm logo={s?.logo_path ?? null} banner={s?.banner_path ?? null} galeri={galeri ?? []} bisaUbah={bisaUbah} />
        </Bagian>
        <Bagian id="jalur" judul="Jalur SPMB"><JalurForm jalur={jalurAdmin} bisaUbah={bisaUbah} /></Bagian>
        <Bagian id="form" judul="Form pendaftaran"><FieldForm fields={(fields ?? []) as FieldAdmin[]} bisaUbah={bisaUbah} /></Bagian>
        <Bagian id="qr" judul="QR dan link"><Qr url={url} svg={svg} png={png} slug={sekolah.slug} /></Bagian>
      </div>
    </main>
  );
}
