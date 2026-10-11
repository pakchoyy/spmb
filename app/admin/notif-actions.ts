"use server";

import { wajibAdmin } from "@/lib/sekolah-saya";

type Hasil = { ok: true } | { ok: false; pesan: string };
type Langganan = { endpoint: string; keys: { p256dh: string; auth: string } };

export async function simpanPush(l: Langganan): Promise<Hasil> {
  if (!/^https:\/\//.test(l.endpoint) || !l.keys?.p256dh || !l.keys?.auth) return { ok: false, pesan: "Data notifikasi tidak valid." };
  const { db, sekolah } = await wajibAdmin();
  await db.from("push_langganan").delete().eq("endpoint", l.endpoint);
  const { error } = await db.from("push_langganan").insert({ sekolah_id: sekolah.id, endpoint: l.endpoint, p256dh: l.keys.p256dh, auth: l.keys.auth });
  if (error) return { ok: false, pesan: "Gagal menyalakan notifikasi. Coba lagi." };
  return { ok: true };
}

export async function hapusPush(endpoint: string): Promise<Hasil> {
  const { db } = await wajibAdmin();
  await db.from("push_langganan").delete().eq("endpoint", endpoint);
  return { ok: true };
}
