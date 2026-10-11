import { Kembali } from "@/components/kembali";
import { wajibPemilik } from "@/lib/pemilik";
import { tglId } from "@/lib/pendaftar";
import KelolaTestimoni, { type BarisTestimoni } from "./kelola";

export const dynamic = "force-dynamic";

export default async function TestimoniSuper() {
  const { svc } = await wajibPemilik();
  const { data } = await svc.from("testimoni")
    .select("id,nama,jabatan,rating,isi,tampil,nama_sekolah,dibuat_pada,sekolah(nama,slug)")
    .order("dibuat_pada", { ascending: false });
  const daftar: BarisTestimoni[] = (data ?? []).map((t) => {
    const s = (Array.isArray(t.sekolah) ? t.sekolah[0] : t.sekolah) as { nama: string; slug: string } | null;
    return {
      id: t.id, nama: t.nama, jabatan: t.jabatan ?? "", rating: t.rating, isi: t.isi, tampil: t.tampil,
      sekolah: s?.nama ?? t.nama_sekolah ?? "-", slug: s?.slug ?? null, manual: !s, tanggal: tglId(t.dibuat_pada),
    };
  });
  return (
    <main className="mx-auto w-full max-w-2xl space-y-4 px-4 pb-10 pt-4">
      <Kembali href="/super">Pantau sekolah</Kembali>
      <header className="rounded-3xl bg-[var(--ungu)] p-5 text-white">
        <h1 className="font-serif text-2xl font-bold">Testimoni</h1>
        <p className="mt-1 text-sm text-white/85">Testimoni dari admin sekolah langsung tampil di beranda. Ubah, sembunyikan, atau hapus bila perlu.</p>
      </header>
      <KelolaTestimoni daftar={daftar} />
    </main>
  );
}
