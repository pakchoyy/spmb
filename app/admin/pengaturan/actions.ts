"use server";

import { revalidatePath } from "next/cache";
import { wajibAdmin } from "@/lib/sekolah-saya";
import type { Jadwal, Prestasi } from "@/lib/berkas";

type Hasil = { ok: true } | { ok: false; pesan: string };
const gagal = (pesan: string): Hasil => ({ ok: false, pesan });

const PESAN: Record<string, string> = {
  jalur_terkunci: "Jalur ini sudah dibuka atau punya pendaftar. Kuota dan periode tidak bisa diubah, dan jalur tidak bisa dihapus.",
  periode_tidak_valid: "Tanggal tutup harus setelah tanggal buka.",
  galeri_penuh: "Galeri maksimal 6 foto.",
  "23505": "Data ini sudah ada.",
};
// RLS menolak tulis saat langganan tenggang atau nonaktif; pesan dibuat ramah.
const pesanDb = (e: { message: string; code?: string }) =>
  PESAN[e.message] ?? PESAN[e.code ?? ""] ?? (e.code === "42501" ? "Langganan Anda tidak aktif, data hanya bisa dibaca." : "Gagal menyimpan. Coba lagi.");

const tampilkan = (slug: string) => { revalidatePath(`/${slug}`); revalidatePath("/admin/pengaturan"); };

const bersih = (s: string, maks: number) => s.trim().slice(0, maks);
const nomorWa = (s: string) => s.replace(/[^\d+]/g, "").slice(0, 20);

export async function simpanProfil(f: {
  nama: string; alamat: string; warna: string; wa: string; peta: string; instagram: string;
  keunggulan: string[]; format: string[]; tampilKuota: boolean; tampilDiBeranda: boolean; akreditasi: string;
}): Promise<Hasil> {
  const { db, sekolah } = await wajibAdmin();
  if (bersih(f.nama, 150).length < 3) return gagal("Isi nama sekolah.");
  if (!/^#[0-9a-fA-F]{6}$/.test(f.warna)) return gagal("Warna tidak valid.");
  if (f.peta && !/^https:\/\//.test(f.peta)) return gagal("Link peta harus diawali https://");
  const ig = f.instagram.trim().replace(/^@/, "");
  if (ig && !/^[A-Za-z0-9._]{1,30}$/.test(ig)) return gagal("Nama Instagram tidak valid.");
  const keunggulan = f.keunggulan.map((k) => bersih(k, 120)).filter(Boolean).slice(0, 5);
  const format = f.format.filter((x) => ["pdf", "jpg", "png"].includes(x));
  if (!format.length) return gagal("Pilih minimal satu format berkas.");

  const { error } = await db.from("sekolah").update({
    nama: bersih(f.nama, 150), alamat: bersih(f.alamat, 300) || null, warna_aksen: f.warna,
    kontak_wa: nomorWa(f.wa) || null, peta_url: bersih(f.peta, 500) || null, instagram: ig || null,
    keunggulan, format_berkas: format, tampil_kuota: f.tampilKuota, tampil_di_beranda: f.tampilDiBeranda,
    akreditasi: bersih(f.akreditasi, 40) || null,
  }).eq("id", sekolah.id);
  if (error) return gagal(pesanDb(error));
  tampilkan(sekolah.slug);
  return { ok: true };
}

const TIPE = ["image/webp", "image/jpeg", "image/png"];

export async function unggahGambar(jenis: "logo" | "banner" | "galeri", form: FormData): Promise<Hasil> {
  const file = form.get("file");
  if (!(file instanceof File)) return gagal("Berkas tidak ditemukan.");
  if (!TIPE.includes(file.type)) return gagal("Gunakan gambar JPG, PNG, atau WebP.");
  if (file.size > 2 * 1024 * 1024) return gagal("Ukuran gambar maksimal 2 MB.");

  const { db, sekolah } = await wajibAdmin();
  const ext = file.type === "image/webp" ? "webp" : file.type === "image/png" ? "png" : "jpg";
  // nama unik per unggahan supaya cache browser dan CDN tidak menampilkan gambar lama
  const path = `${sekolah.id}/${jenis}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  let lama: string | null = null;
  let urutan = 1;
  if (jenis === "galeri") {
    const { count } = await db.from("galeri").select("id", { count: "exact", head: true });
    if ((count ?? 0) >= 6) return gagal(PESAN.galeri_penuh);
    const { data: akhir } = await db.from("galeri").select("urutan").order("urutan", { ascending: false }).limit(1).maybeSingle();
    urutan = (akhir?.urutan ?? 0) + 1;
  } else {
    const kolom = jenis === "logo" ? "logo_path" : "banner_path";
    const { data } = await db.from("sekolah").select(kolom).eq("id", sekolah.id).single();
    lama = (data as Record<string, string | null> | null)?.[kolom] ?? null;
  }

  const { error: up } = await db.storage.from("sekolah-aset").upload(path, file, { contentType: file.type });
  if (up) return gagal("Langganan Anda tidak aktif atau unggah gagal. Coba lagi.");

  const { error } = jenis === "galeri"
    ? await db.from("galeri").insert({ sekolah_id: sekolah.id, path, urutan })
    : await db.from("sekolah").update({ [jenis === "logo" ? "logo_path" : "banner_path"]: path }).eq("id", sekolah.id);
  if (error) { await db.storage.from("sekolah-aset").remove([path]); return gagal(pesanDb(error)); }
  if (lama) await db.storage.from("sekolah-aset").remove([lama]);
  tampilkan(sekolah.slug);
  return { ok: true };
}

export async function hapusGambar(jenis: "logo" | "banner" | "galeri", id?: string): Promise<Hasil> {
  const { db, sekolah } = await wajibAdmin();
  let path: string | null = null;
  if (jenis === "galeri") {
    const { data } = await db.from("galeri").delete().eq("id", id ?? "").select("path").maybeSingle();
    path = data?.path ?? null;
  } else {
    const kolom = jenis === "logo" ? "logo_path" : "banner_path";
    const { data } = await db.from("sekolah").select(kolom).eq("id", sekolah.id).single();
    path = (data as Record<string, string | null> | null)?.[kolom] ?? null;
    const { error } = await db.from("sekolah").update({ [kolom]: null }).eq("id", sekolah.id);
    if (error) return gagal(pesanDb(error));
  }
  if (path) await db.storage.from("sekolah-aset").remove([path]);
  tampilkan(sekolah.slug);
  return { ok: true };
}

export async function simpanJalur(f: {
  id?: string; nama: string; aktif: boolean; kuota: string; buka: string; tutup: string; syarat: string[];
}): Promise<Hasil> {
  const { db, sekolah } = await wajibAdmin();
  if (!["Domisili", "Afirmasi", "Prestasi", "Mutasi"].includes(f.nama)) return gagal("Nama jalur tidak valid.");
  const kuota = f.kuota.trim() === "" ? null : Number.parseInt(f.kuota, 10);
  if (kuota !== null && (!Number.isInteger(kuota) || kuota < 0)) return gagal("Kuota harus angka 0 atau lebih.");
  const syarat = [...new Set(f.syarat.map((s) => bersih(s, 60)).filter(Boolean))].slice(0, 15);
  const baris = { nama: f.nama, aktif: f.aktif, kuota, buka: f.buka || null, tutup: f.tutup || null, syarat_berkas: syarat };

  const { error } = f.id
    ? await db.from("jalur").update(baris).eq("id", f.id)
    : await db.from("jalur").insert({ ...baris, sekolah_id: sekolah.id });
  if (error) return gagal(pesanDb(error));
  tampilkan(sekolah.slug);
  return { ok: true };
}

export async function hapusJalur(id: string): Promise<Hasil> {
  const { db, sekolah } = await wajibAdmin();
  const { error } = await db.from("jalur").delete().eq("id", id);
  if (error) return gagal(pesanDb(error));
  tampilkan(sekolah.slug);
  return { ok: true };
}

export async function simpanField(f: {
  id?: string; label: string; tipe: string; opsi: string; wajib: boolean;
}): Promise<Hasil> {
  const { db, sekolah } = await wajibAdmin();
  const label = bersih(f.label, 80);
  if (!label) return gagal("Isi nama isian.");
  if (!["teks", "angka", "tanggal", "pilihan", "paragraf"].includes(f.tipe)) return gagal("Jenis isian tidak valid.");
  const opsi = f.tipe === "pilihan" ? [...new Set(f.opsi.split("\n").map((o) => bersih(o, 80)).filter(Boolean))].slice(0, 30) : null;
  if (f.tipe === "pilihan" && !opsi?.length) return gagal("Isi minimal satu pilihan (satu per baris).");

  if (f.id) {
    const { error } = await db.from("form_field").update({ label, tipe: f.tipe, opsi, wajib: f.wajib }).eq("id", f.id);
    if (error) return gagal(pesanDb(error));
  } else {
    const { data: akhir } = await db.from("form_field").select("urutan").order("urutan", { ascending: false }).limit(1).maybeSingle();
    const { error } = await db.from("form_field").insert({
      sekolah_id: sekolah.id, label, tipe: f.tipe, opsi, wajib: f.wajib, urutan: (akhir?.urutan ?? 0) + 1,
    });
    if (error) return gagal(pesanDb(error));
  }
  tampilkan(sekolah.slug);
  return { ok: true };
}

export async function hapusField(id: string): Promise<Hasil> {
  const { db, sekolah } = await wajibAdmin();
  const { error } = await db.from("form_field").delete().eq("id", id);
  if (error) return gagal(pesanDb(error));
  tampilkan(sekolah.slug);
  return { ok: true };
}

/** Tukar urutan dengan tetangganya; urutan dinormalkan 1..n supaya selalu unik. */
export async function geserField(id: string, arah: -1 | 1): Promise<Hasil> {
  const { db, sekolah } = await wajibAdmin();
  const { data } = await db.from("form_field").select("id").order("urutan").order("id");
  const ids = (data ?? []).map((r) => r.id as string);
  const i = ids.indexOf(id), j = i + arah;
  if (i < 0 || j < 0 || j >= ids.length) return { ok: true };
  [ids[i], ids[j]] = [ids[j], ids[i]];
  for (const [n, fid] of ids.entries()) {
    const { error } = await db.from("form_field").update({ urutan: n + 1 }).eq("id", fid);
    if (error) return gagal(pesanDb(error));
  }
  tampilkan(sekolah.slug);
  return { ok: true };
}

/** Dipanggil saat QR diunduh: alamat dianggap sudah dibagikan. */
export async function kunciSlug(): Promise<Hasil> {
  const { db, sekolah } = await wajibAdmin();
  await db.from("sekolah").update({ slug_dikunci: true }).eq("id", sekolah.id);
  return { ok: true };
}

const tanggal = (s: string | null | undefined) => (s && /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null);

export async function simpanJadwal(daftar: Jadwal[]): Promise<Hasil> {
  const { db, sekolah } = await wajibAdmin();
  const jadwal: Jadwal[] = [];
  for (const j of daftar.slice(0, 8)) {
    const judul = bersih(j.judul ?? "", 80), mulai = tanggal(j.mulai), selesai = tanggal(j.selesai);
    if (!judul && !mulai) continue;
    if (!judul || !mulai) return gagal("Setiap tahap perlu nama dan tanggal mulai.");
    if (selesai && selesai < mulai) return gagal(`Tanggal selesai "${judul}" harus setelah tanggal mulai.`);
    jadwal.push({ judul, mulai, selesai });
  }
  jadwal.sort((a, b) => a.mulai.localeCompare(b.mulai));
  const { error } = await db.from("sekolah").update({ jadwal }).eq("id", sekolah.id);
  if (error) return gagal(pesanDb(error));
  tampilkan(sekolah.slug);
  return { ok: true };
}

const ambilPrestasi = async (db: Awaited<ReturnType<typeof wajibAdmin>>["db"], id: string) =>
  ((await db.from("sekolah").select("prestasi").eq("id", id).single()).data?.prestasi ?? []) as Prestasi[];

export async function tambahPrestasi(form: FormData): Promise<Hasil> {
  const { db, sekolah } = await wajibAdmin();
  const judul = bersih(String(form.get("judul") ?? ""), 60), nama = bersih(String(form.get("nama") ?? ""), 80);
  const ket = bersih(String(form.get("ket") ?? ""), 160);
  if (!judul || !nama) return gagal("Isi gelar prestasi dan nama siswa.");
  const daftar = await ambilPrestasi(db, sekolah.id);
  if (daftar.length >= 12) return gagal("Prestasi maksimal 12.");

  let foto: string | null = null;
  const file = form.get("file");
  if (file instanceof File && file.size > 0) {
    if (!TIPE.includes(file.type)) return gagal("Gunakan gambar JPG, PNG, atau WebP.");
    if (file.size > 2 * 1024 * 1024) return gagal("Ukuran gambar maksimal 2 MB.");
    foto = `${sekolah.id}/prestasi-${crypto.randomUUID().slice(0, 8)}.${file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg"}`;
    const { error } = await db.storage.from("sekolah-aset").upload(foto, file, { contentType: file.type });
    if (error) return gagal("Gagal mengunggah foto. Coba lagi.");
  }
  const { error } = await db.from("sekolah").update({ prestasi: [...daftar, { judul, nama, ket, foto }] }).eq("id", sekolah.id);
  if (error) { if (foto) await db.storage.from("sekolah-aset").remove([foto]); return gagal(pesanDb(error)); }
  tampilkan(sekolah.slug);
  return { ok: true };
}

export async function hapusPrestasi(i: number): Promise<Hasil> {
  const { db, sekolah } = await wajibAdmin();
  const daftar = await ambilPrestasi(db, sekolah.id);
  const p = daftar[i];
  if (!p) return gagal("Prestasi tidak ditemukan.");
  const { error } = await db.from("sekolah").update({ prestasi: daftar.filter((_, n) => n !== i) }).eq("id", sekolah.id);
  if (error) return gagal(pesanDb(error));
  if (p.foto) await db.storage.from("sekolah-aset").remove([p.foto]);
  tampilkan(sekolah.slug);
  return { ok: true };
}
