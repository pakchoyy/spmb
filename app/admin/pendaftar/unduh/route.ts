import ExcelJS from "exceljs";
import { type NextRequest } from "next/server";
import { wajibAdmin } from "@/lib/sekolah-saya";
import { bacaFilter, tglId } from "@/lib/pendaftar";

const BATAS = 10000;

// Boleh diunduh kapan pun (termasuk masa tenggang dan nonaktif): RLS membaca data sekolah sendiri.
export async function GET(req: NextRequest) {
  const { db, sekolah } = await wajibAdmin();
  const f = bacaFilter(Object.fromEntries(req.nextUrl.searchParams));

  let q = db.from("pendaftar")
    .select("nomor,nama_anak,tanggal_lahir,isian,status,catatan,wa_ortu,dibuat_pada,jalur(nama),berkas(jenis)")
    .order("dibuat_pada", { ascending: true }).limit(BATAS);
  q = q.eq("diarsip", f.arsip === "1"); // default hanya pendaftar aktif; ?arsip=1 untuk data arsip
  if (f.status) q = q.eq("status", f.status);
  if (f.jalur) q = q.eq("jalur_id", f.jalur);
  if (f.q) q = q.or(`nama_anak.ilike.%${f.q}%,nomor.ilike.%${f.q}%`);
  const { data, error } = await q;
  if (error) return new Response("Gagal mengambil data", { status: 500 });

  const baris = data ?? [];
  const kolomIsian = [...new Set(baris.flatMap((r) => Object.keys((r.isian ?? {}) as object)))];
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Pendaftar");
  ws.columns = [
    { header: "No. Pendaftaran", key: "nomor", width: 16 }, { header: "Nama Anak", key: "nama", width: 28 },
    { header: "Tanggal Lahir", key: "tgl", width: 16 }, { header: "Jalur", key: "jalur", width: 14 },
    { header: "Status", key: "status", width: 12 }, { header: "Catatan", key: "catatan", width: 30 },
    { header: "WhatsApp", key: "wa", width: 16 }, { header: "Berkas Terunggah", key: "berkas", width: 28 },
    { header: "Waktu Daftar", key: "waktu", width: 22 },
    ...kolomIsian.map((k) => ({ header: k, key: `i:${k}`, width: 20 })),
  ];
  ws.getRow(1).font = { bold: true };
  ws.views = [{ state: "frozen", ySplit: 1 }];
  for (const r of baris) {
    const jalur = (Array.isArray(r.jalur) ? r.jalur[0] : r.jalur) as { nama: string } | null;
    const isian = (r.isian ?? {}) as Record<string, string>;
    ws.addRow({
      nomor: r.nomor, nama: r.nama_anak, tgl: tglId(r.tanggal_lahir), jalur: jalur?.nama ?? "", status: r.status,
      catatan: r.catatan ?? "",
      wa: r.wa_ortu ? `+${r.wa_ortu}` : "", // string = sel teks; Excel tidak menjalankannya sebagai rumus
      berkas: (r.berkas as { jenis: string }[]).map((b) => b.jenis).join(", "), waktu: tglId(r.dibuat_pada, true),
      ...Object.fromEntries(kolomIsian.map((k) => [`i:${k}`, isian[k] ?? ""])),
    });
  }
  const buf = await wb.xlsx.writeBuffer();
  return new Response(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="pendaftar-${sekolah.slug}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
