import "server-only";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export type SekolahSaya = { id: string; slug: string; nama: string };

/**
 * Pengaman halaman admin: harus login, dan harus punya sekolah.
 * Jika baru konfirmasi email, sekolah dibuat dari data yang diisi saat daftar.
 */
export async function wajibAdmin() {
  const db = await supabaseServer();
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect("/masuk");

  const ambil = () => db.from("sekolah").select("id, slug, nama").maybeSingle();
  let { data: sekolah } = await ambil();
  if (!sekolah) {
    const m = (user.user_metadata ?? {}) as Record<string, string | undefined>;
    if (m.slug && m.nama) {
      const { error } = await db.rpc("buat_sekolah", {
        p_slug: m.slug, p_nama: m.nama, p_npsn: m.npsn ?? "", p_kode_ref: m.kode_ref ?? "",
      });
      if (!error) ({ data: sekolah } = await ambil());
    }
  }
  if (!sekolah) redirect("/daftar/lengkapi"); // slug keburu dipakai orang lain, dll.
  return { db, user, sekolah: sekolah as SekolahSaya };
}
