import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import FormAtur from "./form";

export default async function AturUlang() {
  const { data: { user } } = await (await supabaseServer()).auth.getUser();
  if (!user) redirect("/masuk?galat=link");
  return <FormAtur />;
}
