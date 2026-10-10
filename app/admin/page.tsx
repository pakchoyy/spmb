import Link from "next/link";
import { wajibAdmin } from "@/lib/sekolah-saya";

export const dynamic = "force-dynamic";

type Status = { status: "trial" | "aktif" | "tenggang" | "nonaktif"; trial_until: string; active_until: string | null };
const LABEL = { trial: "Coba gratis", aktif: "Aktif", tenggang: "Masa tenggang (hanya baca)", nonaktif: "Nonaktif" };

export default async function Admin() {
  const { db, sekolah } = await wajibAdmin();
  const { data } = await db.rpc("status_saya");
  const st = data as Status | null;
  const akhir = st ? new Date(st.active_until ?? st.trial_until) : null;
  const sisa = akhir ? Math.max(0, Math.ceil((akhir.getTime() - new Date().getTime()) / 86400000)) : 0;

  return (
    <main className="mx-auto w-full max-w-2xl space-y-6 px-5 py-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-neutral-600">Admin sekolah</p>
          <h1 className="font-serif text-2xl font-bold">{sekolah.nama}</h1>
        </div>
        <form action="/keluar" method="post"><button className="rounded-lg border px-4 py-2 text-sm">Keluar</button></form>
      </header>

      <section className="rounded-xl border bg-white p-4">
        <p className="text-sm text-neutral-600">Langganan</p>
        <p className="text-xl font-bold">{st ? LABEL[st.status] : "-"}</p>
        {st && (st.status === "trial" || st.status === "aktif") && <p className="text-sm">Sisa {sisa} hari</p>}
        <Link className="mt-2 inline-block text-sm underline" href="/admin/langganan">Kelola langganan</Link>
      </section>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="font-bold">Panduan awal</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
          <li><Link className="underline" href="/admin/pengaturan">Isi profil dan pasang logo</Link></li>
          <li>Atur jalur dan form pendaftaran</li>
          <li>Bagikan halaman: <Link className="underline" href={`/${sekolah.slug}`}>/{sekolah.slug}</Link></li>
        </ol>
      </section>
    </main>
  );
}
