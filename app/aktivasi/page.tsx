import type { Metadata } from "next";
import { ShoppingBag } from "lucide-react";
import { Halaman } from "@/components/ui";
import { BantuanWa } from "@/components/bantuan-wa";
import { supabaseService } from "@/lib/supabase/admin";
import FormAktivasi from "./form";

// Dituju dari bgy-store setelah bayar: /aktivasi?t=<token>. Tidak diindeks mesin pencari.
export const metadata: Metadata = { title: "Aktivasi langganan", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function Aktivasi({ searchParams }: PageProps<"/aktivasi">) {
  const { t } = await searchParams;
  const token = typeof t === "string" ? t.slice(0, 64) : "";
  const { data: p } = await supabaseService().from("pengaturan").select("token_aktivasi,lynk_url").eq("id", 1).single();
  if (!token || token !== p?.token_aktivasi) {
    const toko = p?.lynk_url && /^https:\/\//.test(p.lynk_url) ? p.lynk_url : null;
    return (
      <Halaman ikon={ShoppingBag} judul="Beli paket dulu" sub="Kode aktivasi didapat setelah membeli paket SPMB Zone di BGY Store.">
        <ol className="list-decimal space-y-1 pl-5 text-sm">
          <li>Beli paket SPMB Zone di BGY Store.</li>
          <li>Setelah bayar, Anda diarahkan ke halaman aktivasi khusus.</li>
          <li>Isi email admin sekolah, salin kodenya, lalu masukkan di menu Langganan.</li>
        </ol>
        {toko && <a href={toko} target="_blank" rel="noopener noreferrer" className="btn btn-kuning w-full">Beli di BGY Store</a>}
        <BantuanWa />
      </Halaman>
    );
  }
  return <FormAktivasi token={token} sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY ?? null} />;
}
