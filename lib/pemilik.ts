import "server-only";
import { notFound, redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseService } from "@/lib/supabase/admin";

/**
 * Pengaman halaman pemilik. Pemilik = akun dengan app_metadata.role = "owner"
 * (diatur manual di dashboard Supabase; pengguna tidak bisa mengubah app_metadata sendiri).
 * getUser() memeriksa token ke server Auth, bukan hanya membaca cookie.
 */
export async function wajibPemilik() {
  const { data: { user } } = await (await supabaseServer()).auth.getUser();
  if (!user) redirect("/masuk");
  if (user.app_metadata?.role !== "owner") notFound(); // bukan pemilik: halaman seolah tidak ada
  return { svc: supabaseService(), email: user.email ?? "" };
}

export const adalahPemilik = (u: { app_metadata?: Record<string, unknown> } | null) => u?.app_metadata?.role === "owner";
