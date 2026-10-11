"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, Eye, House, Settings } from "lucide-react";

/** Menu bawah di HP (dan bilah samping atas di layar lebar) untuk halaman admin. */
export default function MenuAdmin({ slug }: { slug: string }) {
  const p = usePathname();
  const item = [
    { href: "/admin", label: "Beranda", ikon: House, aktif: p === "/admin" || p.startsWith("/admin/pendaftar") },
    { href: "/admin/pengaturan", label: "Pengaturan", ikon: Settings, aktif: p.startsWith("/admin/pengaturan") },
    { href: "/admin/langganan", label: "Langganan", ikon: CreditCard, aktif: p.startsWith("/admin/langganan") },
    { href: `/${slug}`, label: "Lihat halaman", ikon: Eye, aktif: false },
  ];
  return (
    <nav aria-label="Menu admin" className="fixed inset-x-0 bottom-0 z-30 border-t bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur print:hidden">
      <ul className="mx-auto grid max-w-2xl grid-cols-4">
        {item.map((i) => (
          <li key={i.href}>
            <Link href={i.href} target={i.label === "Lihat halaman" ? "_blank" : undefined} aria-current={i.aktif ? "page" : undefined}
              className={`flex h-16 flex-col items-center justify-center gap-0.5 text-xs font-semibold ${i.aktif ? "text-[var(--biru)]" : "text-neutral-500"}`}>
              <span className={`grid h-7 w-12 place-items-center rounded-full ${i.aktif ? "bg-[var(--biru-muda)]" : ""}`}><i.ikon className="size-5" aria-hidden /></span>
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
