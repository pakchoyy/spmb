import type { Metadata } from "next";
import FormAktivasi from "./form";

// Tidak ditautkan dari menu; dituju lewat redirect setelah bayar di Lynk.
export const metadata: Metadata = { title: "Aktivasi langganan", robots: { index: false, follow: false } };

export default function Aktivasi() {
  return <FormAktivasi sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY ?? null} />;
}
