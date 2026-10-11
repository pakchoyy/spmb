import { IkonWa } from "@/components/ikon-merek";
import { Kembali } from "@/components/kembali";
import { wajibAdmin } from "@/lib/sekolah-saya";
import { linkWaBantuan, PESAN_WA } from "@/lib/merek";
import { tglId } from "@/lib/pendaftar";
import FormMasukan from "./form";

export const dynamic = "force-dynamic";
const NAMA = { fitur: "Minta fitur", saran: "Kritik & saran", masalah: "Lapor masalah" } as Record<string, string>;

export default async function Masukan() {
  const { db } = await wajibAdmin();
  const { data } = await db.from("masukan").select("id,jenis,isi,selesai,dibuat_pada").order("dibuat_pada", { ascending: false }).limit(20);
  return (
    <main className="mx-auto w-full max-w-2xl lg:max-w-3xl lg:pt-8 space-y-4 px-4 pb-6 pt-4">
      <Kembali href="/admin">Beranda</Kembali>
      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
        <h1 className="font-serif text-2xl font-bold">Bantu kami jadi lebih baik</h1>
        <p className="mt-1 text-sm text-neutral-600">Minta fitur, beri kritik, atau laporkan masalah. Semua dibaca langsung oleh pengembang.</p>
        <div className="mt-4"><FormMasukan /></div>
        <a href={linkWaBantuan(PESAN_WA.sekolah)} target="_blank" rel="noopener noreferrer" className="btn btn-wa btn-pil mt-3 w-full">
          <IkonWa className="size-4" aria-hidden />Butuh cepat? Chat WhatsApp
        </a>
      </section>
      {!!data?.length && (
        <section>
          <h2 className="mb-2 font-bold">Masukan Anda</h2>
          <ul className="space-y-2">
            {data.map((m) => (
              <li key={m.id} className="rounded-2xl bg-white p-4 text-sm shadow-sm ring-1 ring-black/5">
                <div className="flex justify-between gap-2 text-xs text-neutral-500"><b>{NAMA[m.jenis]}</b><span>{tglId(m.dibuat_pada)}</span></div>
                <p className="mt-1 whitespace-pre-line">{m.isi}</p>
                {m.selesai && <p className="mt-2 text-xs font-bold text-[#0b6b52]">✓ Sudah ditindaklanjuti</p>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
