import { linkWaBantuan, PESAN_WA } from "@/lib/merek";

/** Tombol WhatsApp melayang di pojok kanan bawah (halaman publik; di halaman sekolah mengarah ke WA sekolah). */
export function WaMelayang({ href = linkWaBantuan(PESAN_WA.umum), label = "Chat WhatsApp bantuan", naik = false }: { href?: string; label?: string; naik?: boolean }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
      className={`wa-melayang fixed right-5 ${naik ? "bottom-24 lg:bottom-6" : "bottom-5"} z-30 grid size-14 place-items-center rounded-full bg-[#25d366] text-white shadow-lg shadow-black/20 transition hover:scale-105 active:scale-95`}>
      <svg viewBox="0 0 32 32" className="size-8" fill="currentColor" aria-hidden>
        <path d="M16 3C9 3 3.3 8.6 3.3 15.6c0 2.2.6 4.4 1.7 6.3L3 29l7.3-1.9a12.7 12.7 0 0 0 5.7 1.4h.1c7 0 12.7-5.6 12.7-12.6S23 3 16 3zm0 23.1c-1.9 0-3.8-.5-5.4-1.5l-.4-.2-4.3 1.1 1.2-4.2-.3-.4a10.4 10.4 0 0 1-1.6-5.5C5.2 9.8 10 5.1 16 5.1s10.7 4.7 10.7 10.5S21.9 26.1 16 26.1zm5.9-7.8c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7.1a8.7 8.7 0 0 1-4.3-3.7c-.3-.6.3-.5.9-1.7.1-.2 0-.4 0-.5l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4s-1.1 1.1-1.1 2.7 1.2 3.2 1.3 3.4 2.3 3.5 5.6 4.9c2.1.9 2.9 1 4 .8.6-.1 1.9-.8 2.2-1.5s.3-1.4.2-1.5-.3-.2-.6-.4z" />
      </svg>
    </a>
  );
}
