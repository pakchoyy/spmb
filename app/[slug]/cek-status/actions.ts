"use server";

import { supabaseAnon } from "@/lib/supabase/anon";

export type Status = {
  nomor: string; nama_anak: string; status: string; catatan: string | null; sekolah: string;
  jalur: string | null; syarat_berkas: string[]; berkas: string[];
};

export async function cekStatus(slug: string, nomor: string): Promise<Status | null> {
  const n = nomor.trim();
  if (n.length < 6 || n.length > 12) return null;
  const { data } = await supabaseAnon().rpc("cek_status_nomor", { p_slug: slug, p_nomor: n });
  return (data as Status | null) ?? null;
}
