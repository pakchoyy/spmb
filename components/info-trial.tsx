import { Clock } from "lucide-react";

/** Penjelasan masa coba di halaman pendaftaran sekolah, supaya tidak dikira gratis selamanya. */
export function InfoTrial() {
  return (
    <div className="flex gap-3 rounded-2xl bg-[var(--kuning-muda)] p-3 text-sm text-[#5c3d00]">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--kuning)]"><Clock className="size-5" aria-hidden /></span>
      <p><b>Masa coba (trial) 7 hari.</b> Semua fitur terbuka untuk dicoba. Setelah itu, lanjutkan dengan <b>berlangganan paket tahunan</b> agar pendaftaran tetap dibuka.</p>
    </div>
  );
}
