import Toaster from "@/components/toast";

export default function LayoutSuper({ children }: { children: React.ReactNode }) {
  return <>{children}<Toaster /></>;
}
