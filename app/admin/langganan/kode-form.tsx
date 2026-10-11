"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Galat, input, tombol } from "@/components/ui";
import { useAksi } from "@/components/aksi";
import { pakaiKode } from "./actions";

export default function KodeForm() {
  const router = useRouter();
  const [kode, setKode] = useState("");
  const [berakhir, setBerakhir] = useState<string | null>(null);
  const { pending, galat, jalankan } = useAksi();

  if (berakhir) {
    return (
      <p className="rounded-2xl bg-[var(--mint-muda)] p-4 font-semibold text-[#0b6b52]">
        Langganan aktif sampai {new Date(berakhir).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" })}. ✓
      </p>
    );
  }
  return (
    <form className="space-y-3" onSubmit={(e) => {
      e.preventDefault();
      jalankan(async () => {
        const r = await pakaiKode(kode);
        if (r.ok) { setBerakhir(r.berakhir); router.refresh(); return { ok: true }; }
        return r;
      });
    }}>
      <label className="block">
        <span className="text-sm font-semibold">Kode aktivasi</span>
        <input className={`${input} font-mono uppercase tracking-wider`} value={kode} placeholder="SPMB-XXXXX" maxLength={10}
          autoCapitalize="characters" autoComplete="off" spellCheck={false} onChange={(e) => setKode(e.target.value.toUpperCase())} />
      </label>
      <Galat>{galat}</Galat>
      <button className={tombol} disabled={pending || kode.length < 10}>{pending ? "Memeriksa…" : "Aktifkan"}</button>
    </form>
  );
}
