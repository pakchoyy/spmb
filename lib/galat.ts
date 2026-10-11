import "server-only";
import { supabaseService } from "@/lib/supabase/admin";

/** Simpan error ke galat_log (dilihat di /super/galat). Tidak pernah melempar error. */
export async function catatGalat(sumber: "server" | "browser", pesan: string, url?: string | null, detail?: string | null) {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return;
    const svc = supabaseService();
    await svc.from("galat_log").insert({
      sumber, pesan: pesan.slice(0, 500) || "(tanpa pesan)", url: url?.slice(0, 500) ?? null, detail: detail?.slice(0, 4000) ?? null,
    });
    // bersihkan sesekali (±1% panggilan) catatan lebih dari 30 hari
    if (Math.random() < 0.01) await svc.from("galat_log").delete().lt("waktu", new Date(Date.now() - 30 * 86400000).toISOString());
  } catch { /* abaikan */ }
}
