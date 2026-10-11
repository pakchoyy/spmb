import "server-only";
import webpush from "web-push";
import { supabaseService } from "@/lib/supabase/admin";

const PUBLIK = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const PRIVAT = process.env.VAPID_PRIVATE_KEY;

/** Kirim notifikasi HP ke semua perangkat admin sekolah. Tanpa kunci VAPID: tidak melakukan apa-apa. */
export async function kirimPushSekolah(sekolahId: string, pesan: { judul: string; isi: string; url: string }) {
  if (!PUBLIK || !PRIVAT) return;
  webpush.setVapidDetails("mailto:admin@spmbz.web.id", PUBLIK, PRIVAT);
  const svc = supabaseService();
  const { data } = await svc.from("push_langganan").select("id,endpoint,p256dh,auth").eq("sekolah_id", sekolahId);
  const mati: string[] = [];
  await Promise.all((data ?? []).map(async (s) => {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify(pesan), { TTL: 86400 });
    } catch (e) {
      const kode = (e as { statusCode?: number }).statusCode;
      if (kode === 404 || kode === 410) mati.push(s.id); // langganan kedaluwarsa / dicabut
    }
  }));
  if (mati.length) await svc.from("push_langganan").delete().in("id", mati);
}
