import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import Lengkapi from "./form";

export default async function Page() {
  const db = await supabaseServer();
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect("/masuk");
  const { data: ada } = await db.from("sekolah").select("id").maybeSingle();
  if (ada) redirect("/admin");
  const m = (user.user_metadata ?? {}) as Record<string, string | undefined>;
  // Akun dari Google belum punya data sekolah; akun email sudah, tapi alamatnya keburu dipakai sekolah lain.
  const dariGoogle = !m.slug;
  const ref = (await cookies()).get("ym_ref")?.value ?? "";
  return <Lengkapi nama={m.nama ?? ""} npsn={m.npsn ?? ""} dariGoogle={dariGoogle} email={user.email ?? ""} kodeAwal={ref} />;
}
