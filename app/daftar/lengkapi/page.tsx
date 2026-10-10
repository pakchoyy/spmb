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
  return <Lengkapi nama={m.nama ?? ""} npsn={m.npsn ?? ""} />;
}
