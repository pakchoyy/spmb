"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { tampilkanToast } from "@/components/toast";
import { hapusPush, simpanPush } from "./notif-actions";

const KUNCI = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const keBytes = (b64: string) => {
  const s = atob((b64 + "=".repeat((4 - (b64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(s, (c) => c.charCodeAt(0));
};

/** Kartu "Nyalakan notifikasi pendaftar baru" di beranda admin. */
export default function Notif() {
  const [keadaan, setKeadaan] = useState<"memuat" | "tidak-didukung" | "mati" | "nyala" | "diblokir">("memuat");
  const [proses, setProses] = useState(false);

  useEffect(() => {
    (async () => {
      if (!KUNCI || !("serviceWorker" in navigator) || !("PushManager" in window)) return setKeadaan("tidak-didukung");
      if (Notification.permission === "denied") return setKeadaan("diblokir");
      const reg = await navigator.serviceWorker.getRegistration();
      setKeadaan((await reg?.pushManager.getSubscription()) ? "nyala" : "mati");
    })().catch(() => setKeadaan("tidak-didukung"));
  }, []);

  if (keadaan === "memuat" || keadaan === "tidak-didukung") return null;

  async function nyalakan() {
    setProses(true);
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      if ((await Notification.requestPermission()) !== "granted") { setKeadaan("diblokir"); return; }
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keBytes(KUNCI!) });
      const r = await simpanPush(sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } });
      if (r.ok) { setKeadaan("nyala"); tampilkanToast("Notifikasi menyala"); } else tampilkanToast(r.pesan, true);
    } catch { tampilkanToast("Gagal menyalakan notifikasi. Pasang aplikasi dulu, lalu coba lagi.", true); }
    finally { setProses(false); }
  }
  async function matikan() {
    setProses(true);
    const sub = await (await navigator.serviceWorker.getRegistration())?.pushManager.getSubscription();
    if (sub) { await hapusPush(sub.endpoint); await sub.unsubscribe(); }
    setKeadaan("mati"); setProses(false);
  }

  return (
    <div className="flex items-center gap-3 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-black/5 print:hidden">
      <span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${keadaan === "nyala" ? "bg-[var(--mint-muda)]" : "bg-[var(--kuning-muda)]"}`}>
        {keadaan === "nyala" ? <Bell className="size-5 text-[#0b6b52]" aria-hidden /> : <BellOff className="size-5 text-[#8a5a00]" aria-hidden />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-bold">Notifikasi pendaftar baru</p>
        <p className="text-sm text-neutral-600">{keadaan === "nyala" ? "Menyala di HP ini." : keadaan === "diblokir" ? "Diblokir. Izinkan notifikasi di pengaturan browser." : "Dapat kabar di HP setiap ada pendaftar."}</p>
      </div>
      {keadaan === "mati" && <button className="btn btn-utama btn-pil shrink-0" disabled={proses} onClick={nyalakan}>Nyalakan</button>}
      {keadaan === "nyala" && <button className="btn btn-pil btn-lembut shrink-0" disabled={proses} onClick={matikan}>Matikan</button>}
    </div>
  );
}
