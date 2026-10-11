import type { Metadata } from "next";
import MenuAdmin from "@/components/menu-admin";
import Toaster from "@/components/toast";
import { wajibAdmin } from "@/lib/sekolah-saya";

export const metadata: Metadata = { manifest: "/api/manifest-admin", appleWebApp: { capable: true, title: "Admin SPMB", statusBarStyle: "default" } };

export default async function LayoutAdmin({ children }: { children: React.ReactNode }) {
  const { db, sekolah } = await wajibAdmin();
  // jumlah pendaftar yang belum diperiksa, untuk tanda merah di menu
  const { count: baru } = await db.from("pendaftar").select("id", { count: "exact", head: true }).eq("status", "Baru").eq("diarsip", false);
  return (
    <div className="min-h-screen pb-20">
      {children}
      <Toaster />
      <MenuAdmin slug={sekolah.slug} baru={baru ?? 0} />
    </div>
  );
}
