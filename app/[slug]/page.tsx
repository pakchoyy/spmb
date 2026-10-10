import { notFound, permanentRedirect } from "next/navigation";
import { supabaseAnon } from "@/lib/supabase/anon";

export const revalidate = 600; // cache 10 menit, sesuai PRD

export default async function HalamanSekolah({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = supabaseAnon();
  const { data: sekolah } = await db.rpc("sekolah_publik", { p_slug: slug });
  if (!sekolah) {
    const { data: baru } = await db.rpc("slug_pengalihan", { p_slug: slug });
    if (baru) permanentRedirect(`/${baru}`);
    notFound();
  }
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">{sekolah.nama}</h1>
      <p>{sekolah.alamat}</p>
    </main>
  );
}
