import { Kembali } from "@/components/kembali";
import { wajibPemilik } from "@/lib/pemilik";
import Form from "./form";

export const dynamic = "force-dynamic";

export default async function Pengaturan() {
  const { svc } = await wajibPemilik();
  const { data: p } = await svc.from("pengaturan").select("*").eq("id", 1).single();
  return (
    <main className="mx-auto w-full max-w-md space-y-4 px-4 pb-6 pt-4">
      <Kembali href="/super">Pantau sekolah</Kembali>
      <h1 className="font-serif text-2xl font-bold">Harga, Lynk, dan komisi</h1>
      <Form awal={{ lynk: p?.lynk_url ?? "", harga: String(p?.harga_paket ?? ""), komisi: String(p?.komisi_nominal ?? 7000), batas: String(p?.batas_pencairan ?? 25000) }} />
    </main>
  );
}
