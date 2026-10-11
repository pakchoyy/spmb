"use client";

import Link from "next/link";
import { Logo } from "./logo";
import { usePathname } from "next/navigation";
import { CreditCard, Eye, House, Info, Settings } from "lucide-react";

/** Menu bawah di HP (dan bilah samping atas di layar lebar) untuk halaman admin. */
export default function MenuAdmin({ slug, baru = 0 }: { slug: string; baru?: number }) {
  const p = usePathname();
  const item = [
    { href: "/admin", label: "Beranda", ikon: House, badge: baru, aktif: p === "/admin" || p.startsWith("/admin/pendaftar") },
    { href: "/admin/pengaturan", label: "Pengaturan", ikon: Settings, badge: 0, aktif: p.startsWith("/admin/pengaturan") },
    { href: `/${slug}`, label: "Halaman", ikon: Eye, badge: 0, aktif: false },
    { href: "/admin/langganan", label: "Langganan", ikon: CreditCard, badge: 0, aktif: p.startsWith("/admin/langganan") },
    { href: "/admin/tentang", label: "Tentang", ikon: Info, badge: 0, aktif: p.startsWith("/admin/tentang") },
  ];
  return (
    <nav aria-label="Menu admin" className="fixed inset-x-0 bottom-0 z-30 border-t bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur print:hidden lg:inset-y-0 lg:left-0 lg:right-auto lg:w-60 lg:border-r lg:border-t-0 lg:bg-white lg:pb-0">
      {/* layar lebar: bilah samping kiri */}
      <div className="hidden px-5 pb-4 pt-6 lg:block"><Logo /></div>
      <ul className="mx-auto grid max-w-2xl grid-cols-5 lg:mx-0 lg:max-w-none lg:grid-cols-1 lg:gap-1 lg:px-3">
        {item.map((i) => i.label === "Halaman" ? (
          <li key={i.href} className="flex justify-center lg:order-last lg:mt-4 lg:block">
            {/* tombol tengah menonjol: lihat halaman sekolah seperti orang tua */}
            <Link href={i.href} target="_blank" className="-mt-5 flex flex-col items-center gap-0.5 text-xs font-semibold text-[var(--biru)] lg:mt-0 lg:flex-row lg:gap-3 lg:rounded-2xl lg:bg-[var(--biru)] lg:px-4 lg:py-3 lg:text-sm lg:text-white">
              <span className="grid size-14 place-items-center rounded-full bg-[var(--biru)] text-white shadow-lg shadow-[var(--biru)]/30 ring-4 ring-white lg:size-auto lg:bg-transparent lg:shadow-none lg:ring-0"><i.ikon className="size-6 lg:size-5" aria-hidden /></span>
              {i.label === "Halaman" ? <><span className="lg:hidden">Halaman</span><span className="hidden lg:inline">Lihat halaman sekolah</span></> : i.label}
            </Link>
          </li>
        ) : (
          <li key={i.href}>
            <Link href={i.href} target={i.label === "Halaman" ? "_blank" : undefined} aria-current={i.aktif ? "page" : undefined}
              className={`flex h-16 flex-col items-center justify-center gap-0.5 text-xs font-semibold lg:h-12 lg:flex-row lg:justify-start lg:gap-3 lg:rounded-2xl lg:px-2 lg:text-sm ${i.aktif ? "text-[var(--biru)] lg:bg-[var(--biru-muda)]" : "text-neutral-500 lg:hover:bg-neutral-50"}`}>
              <span className={`relative grid h-7 w-12 place-items-center rounded-full ${i.aktif ? "bg-[var(--biru-muda)]" : ""}`}>
                <i.ikon className="size-5" aria-hidden />
                {i.badge > 0 && (
                  <span className="absolute -right-0.5 -top-1 min-w-5 rounded-full bg-red-600 px-1 text-center text-[11px] font-bold leading-5 text-white" aria-label={`${i.badge} pendaftar baru`}>{i.badge > 99 ? "99+" : i.badge}</span>
                )}
              </span>
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
