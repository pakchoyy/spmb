import Script from "next/script";
import MenuAdmin from "@/components/menu-admin";
import Toaster from "@/components/toast";
import { wajibAdmin } from "@/lib/sekolah-saya";

export default async function LayoutAdmin({ children }: { children: React.ReactNode }) {
  const { sekolah } = await wajibAdmin();
  return (
    <div className="min-h-screen pb-20">
      {/* bar info berjalan Bantu Guru Yuk */}
      <div data-bgy-info />
      {children}
      <Toaster />
      <MenuAdmin slug={sekolah.slug} />
      <Script src="https://www.bantuguruyuk.web.id/bgy-info.js" strategy="lazyOnload" />
    </div>
  );
}
