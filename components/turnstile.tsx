"use client";

import { useEffect } from "react";

/** Widget Cloudflare Turnstile. Tidak menampilkan apa pun bila sitekey kosong (pengembangan lokal). */
export default function Turnstile({ sitekey, onToken }: { sitekey: string | null; onToken: (t: string) => void }) {
  useEffect(() => {
    if (!sitekey) return;
    (window as unknown as { onTurnstile?: (t: string) => void }).onTurnstile = onToken;
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    s.async = true;
    document.head.appendChild(s);
    return () => s.remove();
  }, [sitekey, onToken]);
  return sitekey ? <div className="cf-turnstile" data-sitekey={sitekey} data-callback="onTurnstile" /> : null;
}
