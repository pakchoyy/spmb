"use server";

import { after } from "next/server";
import { bolehLanjut, hashPerangkat } from "@/lib/perangkat";
import { kirimPushSekolah } from "@/lib/push";
import { catatGalat } from "@/lib/galat";
import { supabaseAnon } from "@/lib/supabase/anon";
import { supabaseService } from "@/lib/supabase/admin";
import { lolosTurnstile } from "@/lib/turnstile";
import { MAKS_BYTE, MIME, normalWa, pesanError, type SekolahPublik } from "@/lib/berkas";

type Hasil = { ok: true; nomor?: string } | { ok: false; pesan: string };

export async function kirimPendaftaran(slug: string, data: {
  jalur: string | null; namaAnak: string; tglLahir: string; wa: string;
  isian: Record<string, string>; setuju: boolean; turnstile: string | null;
}): Promise<Hasil> {
  if (!(await lolosTurnstile(data.turnstile))) return { ok: false, pesan: "Verifikasi gagal. Muat ulang halaman." };
  const db = supabaseAnon();
  const { data: s } = await db.rpc("sekolah_publik", { p_slug: slug });
  const sekolah = s as SekolahPublik | null;
  if (!sekolah) return { ok: false, pesan: "Sekolah tidak ditemukan." };

  const nama = data.namaAnak.trim();
  if (nama.length < 2) return { ok: false, pesan: "Isi nama lengkap anak." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.tglLahir)) return { ok: false, pesan: "Isi tanggal lahir." };

  const wa = normalWa(data.wa);
  if (!wa) return { ok: false, pesan: pesanError("wa_tidak_valid") };

  // hanya terima isian untuk field yang memang ada; wajib dicek di server
  const isian: Record<string, string> = {};
  for (const f of sekolah.form) {
    const v = (data.isian[f.id] ?? "").trim().slice(0, 500);
    if (f.wajib && !v) return { ok: false, pesan: `Isi "${f.label}".` };
    if (f.tipe === "pilihan" && v && !f.opsi?.includes(v)) return { ok: false, pesan: `Pilihan "${f.label}" tidak valid.` };
    if (v) isian[f.label] = v;
  }

  // perangkat = hash IP + user agent; cukup untuk pembatasan kasar
  const perangkat = await hashPerangkat();

  // hanya bisa dipanggil server (service_role): Turnstile dan validasi di atas tidak bisa dilewati
  const { data: nomor, error } = await supabaseService().rpc("daftar_pendaftar", {
    p_slug: slug, p_jalur: data.jalur, p_nama_anak: nama, p_tgl_lahir: data.tglLahir,
    p_isian: isian, p_perangkat: perangkat, p_setuju: data.setuju, p_wa: wa,
  });
  if (error) {
    // galat tak terduga (bukan validasi biasa) dicatat agar langsung terlihat di /super/galat
    if (!/^[a-z_]+$/.test(error.message)) await catatGalat("server", `daftar_pendaftar: ${error.message}`, `/${slug}/daftar`);
    return { ok: false, pesan: pesanError(error.message) };
  }
  // notifikasi HP ke admin sekolah, setelah respons terkirim agar orang tua tidak menunggu
  after(async () => {
    const { data: sk } = await supabaseService().from("sekolah").select("id").eq("slug", slug).maybeSingle();
    if (sk) await kirimPushSekolah(sk.id, { judul: "Pendaftar baru", isi: `${nama} baru saja mendaftar (${nomor}).`, url: "/admin?status=Baru" });
  });
  return { ok: true, nomor: nomor as string };
}

/** Jalur cadangan (lewat server) bila unggah langsung ke Storage gagal di HP tertentu. */
export async function unggahBerkas(slug: string, nomor: string, tglLahir: string, jenis: string, form: FormData): Promise<Hasil> {
  const file = form.get("file");
  if (!(file instanceof File)) return { ok: false, pesan: "Berkas tidak ditemukan." };
  if (file.size > MAKS_BYTE) return { ok: false, pesan: "Ukuran berkas maksimal 2 MB." };
  if (!(await bolehLanjut("unggah", 40, 60))) return { ok: false, pesan: "Terlalu banyak unggahan. Coba lagi 1 jam lagi." };
  // pastikan isi file sesuai jenisnya (bukan sekadar nama/tipe yang dikirim browser)
  const awal = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  const cocok = file.type === "application/pdf" ? String.fromCharCode(...awal.slice(0, 4)) === "%PDF"
    : file.type === "image/png" ? awal[0] === 0x89 && awal[1] === 0x50 && awal[2] === 0x4e && awal[3] === 0x47
    : file.type === "image/jpeg" ? awal[0] === 0xff && awal[1] === 0xd8
    : false;
  if (!cocok) return { ok: false, pesan: "Berkas rusak atau bukan PDF/JPG/PNG. Coba foto ulang." };

  const svc = supabaseService();
  const { data: info, error } = await svc.rpc("siapkan_berkas", { p_slug: slug, p_nomor: nomor, p_tgl: tglLahir, p_jenis: jenis });
  if (error) return { ok: false, pesan: "Data pendaftaran tidak cocok." };
  const { sekolah_id, pendaftar_id, format } = info as { sekolah_id: string; pendaftar_id: string; format: string[] };

  const ext = Object.keys(MIME).find((e) => MIME[e] === file.type);
  if (!ext || !format.includes(ext)) return { ok: false, pesan: `Format berkas harus ${format.join(", ").toUpperCase()}.` };

  const path = `${sekolah_id}/${pendaftar_id}/${jenis.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.${ext}`;
  const { error: up } = await svc.storage.from("berkas").upload(path, file, { contentType: file.type, upsert: true });
  if (up) return { ok: false, pesan: "Unggah gagal. Coba lagi." };

  const { data: lama, error: cat } = await svc.rpc("catat_berkas", { p_pendaftar: pendaftar_id, p_jenis: jenis, p_path: path, p_ukuran: file.size });
  if (cat) return { ok: false, pesan: "Unggah gagal. Coba lagi." };
  if (lama && lama !== path) await svc.storage.from("berkas").remove([lama as string]);
  return { ok: true };
}

type Izin = { ok: true; path: string; token: string } | { ok: false; pesan: string };

const jenisAman = (jenis: string) => jenis.replace(/[^a-z0-9]+/gi, "-").toLowerCase();

/**
 * Langkah 1 unggah berkas: server memeriksa identitas pendaftar lalu memberi izin unggah sekali pakai.
 * Berkas dikirim langsung dari HP ke Supabase Storage (tidak lewat server Vercel, hemat transfer).
 */
export async function mintaUnggah(slug: string, nomor: string, tglLahir: string, jenis: string, tipe: string, ukuran: number): Promise<Izin> {
  if (!(ukuran > 0 && ukuran <= MAKS_BYTE)) return { ok: false, pesan: "Ukuran berkas maksimal 2 MB." };
  if (!(await bolehLanjut("unggah", 40, 60))) return { ok: false, pesan: "Terlalu banyak unggahan. Coba lagi 1 jam lagi." };
  const svc = supabaseService();
  const { data: info, error } = await svc.rpc("siapkan_berkas", { p_slug: slug, p_nomor: nomor, p_tgl: tglLahir, p_jenis: jenis });
  if (error) return { ok: false, pesan: "Data pendaftaran tidak cocok." };
  const { sekolah_id, pendaftar_id, format } = info as { sekolah_id: string; pendaftar_id: string; format: string[] };
  const ext = Object.keys(MIME).find((e) => MIME[e] === tipe);
  if (!ext || !format.includes(ext)) return { ok: false, pesan: `Format berkas harus ${format.join(", ").toUpperCase()}.` };

  const path = `${sekolah_id}/${pendaftar_id}/${jenisAman(jenis)}.${ext}`;
  const { data, error: e2 } = await svc.storage.from("berkas").createSignedUploadUrl(path, { upsert: true });
  if (e2 || !data) return { ok: false, pesan: "Unggah gagal. Coba lagi." };
  return { ok: true, path, token: data.token };
}

/** Langkah 2: setelah berkas sampai di Storage, server memeriksa isinya (8 byte pertama saja) lalu mencatatnya. */
export async function selesaiUnggah(slug: string, nomor: string, tglLahir: string, jenis: string, path: string): Promise<Hasil> {
  const svc = supabaseService();
  const { data: info, error } = await svc.rpc("siapkan_berkas", { p_slug: slug, p_nomor: nomor, p_tgl: tglLahir, p_jenis: jenis });
  if (error) return { ok: false, pesan: "Data pendaftaran tidak cocok." };
  const { sekolah_id, pendaftar_id } = info as { sekolah_id: string; pendaftar_id: string };
  const awalan = `${sekolah_id}/${pendaftar_id}/${jenisAman(jenis)}.`;
  const ext = path.slice(awalan.length);
  if (!path.startsWith(awalan) || !(ext in MIME)) return { ok: false, pesan: "Berkas tidak valid." };

  // ukuran dari metadata Storage, isi dicek lewat 8 byte pertama (Range) supaya tidak mengunduh seluruh file
  const { data: daftar } = await svc.storage.from("berkas").list(`${sekolah_id}/${pendaftar_id}`, { search: `${jenisAman(jenis)}.${ext}` });
  const obj = daftar?.find((o) => o.name === `${jenisAman(jenis)}.${ext}`);
  const ukuran = Number((obj?.metadata as { size?: number } | undefined)?.size ?? 0);
  if (!obj || ukuran <= 0) return { ok: false, pesan: "Berkas belum terkirim. Coba lagi." };
  const { data: tanda } = await svc.storage.from("berkas").createSignedUrl(path, 60);
  const awal = tanda ? new Uint8Array(await (await fetch(tanda.signedUrl, { headers: { Range: "bytes=0-7" } })).arrayBuffer()) : new Uint8Array();
  const cocok = ext === "pdf" ? String.fromCharCode(...awal.slice(0, 4)) === "%PDF"
    : ext === "png" ? awal[0] === 0x89 && awal[1] === 0x50 && awal[2] === 0x4e && awal[3] === 0x47
    : awal[0] === 0xff && awal[1] === 0xd8;
  if (!cocok) {
    await svc.storage.from("berkas").remove([path]);
    return { ok: false, pesan: "Berkas rusak atau bukan PDF/JPG/PNG. Coba foto ulang." };
  }

  const { data: lama, error: cat } = await svc.rpc("catat_berkas", { p_pendaftar: pendaftar_id, p_jenis: jenis, p_path: path, p_ukuran: ukuran });
  if (cat) return { ok: false, pesan: "Unggah gagal. Coba lagi." };
  if (lama && lama !== path) await svc.storage.from("berkas").remove([lama as string]);
  return { ok: true };
}
