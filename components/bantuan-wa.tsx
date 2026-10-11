import { MessageCircle } from "lucide-react";
import { linkWaBantuan, PESAN_WA } from "@/lib/merek";

/** Kartu "Ada kendala?" yang membuka WhatsApp pengelola dengan pesan pembuka sesuai konteks. */
export function BantuanWa({ konteks = "umum" }: { konteks?: keyof typeof PESAN_WA }) {
  return (
    <a href={linkWaBantuan(PESAN_WA[konteks])} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-2xl bg-[#e7f8ee] p-4 text-[#0f5132] ring-1 ring-[#1faa59]/20">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#1faa59] text-white"><MessageCircle className="size-6" aria-hidden /></span>
      <span className="min-w-0">
        <span className="block font-bold">Ada kendala dengan aplikasi?</span>
        <span className="block text-sm">Chat kami di WhatsApp, kami bantu.</span>
      </span>
    </a>
  );
}
