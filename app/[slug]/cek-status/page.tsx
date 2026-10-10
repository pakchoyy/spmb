import { notFound } from "next/navigation";
import { supabaseAnon } from "@/lib/supabase/anon";
import type { SekolahPublik } from "@/lib/berkas";
import CekForm from "./cek-form";

export const dynamic = "force-dynamic";

export default async function CekStatus({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data } = await supabaseAnon().rpc("sekolah_publik", { p_slug: slug });
  const s = data as SekolahPublik | null;
  if (!s) notFound();
  return <CekForm slug={slug} nama={s.nama} format={s.format_berkas} bisaUnggah={s.status === "trial" || s.status === "aktif"} />;
}
