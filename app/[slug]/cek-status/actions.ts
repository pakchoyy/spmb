"use server";

import { supabaseAnon } from "@/lib/supabase/anon";

export type Status = {
  nomor: string; nama_anak: string; status: string; catatan: string | null; sekolah: string;
  jalur: string | null; syarat_berkas: string[]; berkas: string[];
};

export async function cekStatus(slug: string, nomor: string, tgl: string): Promise<Status | null> {
  if (!nomor.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(tgl)) return null;
  const { data } = await supabaseAnon().rpc("cek_status", { p_slug: slug, p_nomor: nomor, p_tgl_lahir: tgl });
  return (data as Status | null) ?? null;
}
