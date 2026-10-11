"use client";

import { useAksi } from "@/components/aksi";
import { setMasukanSelesai } from "../actions";

export default function TombolSelesai({ id, selesai }: { id: string; selesai: boolean }) {
  const a = useAksi();
  return (
    <button className="btn btn-pil btn-lembut" disabled={a.pending} onClick={() => a.jalankan(() => setMasukanSelesai(id, !selesai))}>
      {selesai ? "Buka lagi" : "Tandai selesai"}
    </button>
  );
}
