import MenuAdmin from "@/components/menu-admin";
import Toaster from "@/components/toast";
import { wajibAdmin } from "@/lib/sekolah-saya";

export default async function LayoutAdmin({ children }: { children: React.ReactNode }) {
  const { sekolah } = await wajibAdmin();
  return (
    <div className="min-h-screen pb-20">
      {children}
      <Toaster />
      <MenuAdmin slug={sekolah.slug} />
    </div>
  );
}
