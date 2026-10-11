import Script from "next/script";
import MenuAdmin from "@/components/menu-admin";
import Toaster from "@/components/toast";
import { wajibAdmin } from "@/lib/sekolah-saya";

export default async function LayoutAdmin({ children }: { children: React.ReactNode }) {
  const { db, sekolah } = await wajibAdmin();
  // jumlah pendaftar yang belum diperiksa, untuk tanda merah di menu
  const { count: baru } = await db.from("pendaftar").select("id", { count: "exact", head: true }).eq("status", "Baru").eq("diarsip", false);
  return (
    <div className="min-h-screen pb-20">
      {/* bar info berjalan Bantu Guru Yuk */}
      <div data-bgy-info className="print:hidden" />
      {children}
      <Toaster />
      <MenuAdmin slug={sekolah.slug} baru={baru ?? 0} />
      <Script src="https://www.bantuguruyuk.web.id/bgy-info.js" strategy="lazyOnload" />
    </div>
  );
}
