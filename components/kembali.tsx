import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/** Tombol kembali yang mudah diketuk (min. 44px). */
export function Kembali({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="btn btn-pil -ml-1 h-11 bg-white px-4 font-semibold text-[var(--biru)] shadow-sm ring-1 ring-black/10">
      <ArrowLeft className="size-5" aria-hidden />{children}
    </Link>
  );
}
