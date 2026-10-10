import { wajibAdmin } from "@/lib/sekolah-saya";

export const dynamic = "force-dynamic";

export default async function Page() {
  await wajibAdmin();
  return <main className="p-6"><h1 className="text-xl font-semibold">Pengaturan sekolah</h1></main>;
}
