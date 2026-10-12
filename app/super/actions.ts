"use server";

import { revalidatePath } from "next/cache";
import { wajibPemilik } from "@/lib/pemilik";
import { SLUG_RE, SLUG_DIPESAN } from "@/lib/slug";

type Hasil = { ok: true } | { ok: false; pesan: string };
const gagal = (pesan: string): Hasil => ({ ok: false, pesan });
const UUID = /^[0-9a-f-]{36}$/;

async function catat(svc: Awaited<ReturnType<typeof wajibPemilik>>["svc"], oleh: string, sekolahId: string | null, peristiwa: string, detail: object) {
  await svc.from("log_langganan").insert({ sekolah_id: sekolahId, peristiwa, detail: { ...detail, oleh } });
}
const segarkan = (id?: string) => { revalidatePath("/super"); if (id) revalidatePath(`/super/sekolah/${id}`); };

export async function setNonaktif(id: string, nonaktif: boolean): Promise<Hasil> {
  const { svc, email } = await wajibPemilik();
  if (!UUID.test(id)) return gagal("ID tidak valid.");
  const { error } = await svc.from("sekolah").update({ nonaktif }).eq("id", id);
  if (error) return gagal("Gagal menyimpan.");
  await catat(svc, email, id, nonaktif ? "pemilik_nonaktifkan" : "pemilik_aktifkan_kembali", {});
  segarkan(id);
  return { ok: true };
}

export async function setVerifikasi(id: string, terverifikasi: boolean): Promise<Hasil> {
  const { svc, email } = await wajibPemilik();
  if (!UUID.test(id)) return gagal("ID tidak valid.");
  const { data, error } = await svc.from("sekolah").update({ terverifikasi }).eq("id", id).select("slug").single();
  if (error) return gagal("Gagal menyimpan.");
  await catat(svc, email, id, terverifikasi ? "pemilik_verifikasi" : "pemilik_cabut_verifikasi", {});
  revalidatePath(`/${data.slug}`);
  segarkan(id);
  return { ok: true };
}

export async function setBatal(id: string, dibatalkan: boolean): Promise<Hasil> {
  const { svc, email } = await wajibPemilik();
  if (!UUID.test(id)) return gagal("ID tidak valid.");
  const { error } = await svc.from("langganan").update({ dibatalkan }).eq("sekolah_id", id);
  if (error) return gagal("Gagal menyimpan.");
  await catat(svc, email, id, dibatalkan ? "pemilik_batalkan_langganan" : "pemilik_pulihkan_langganan", {});
  segarkan(id);
  return { ok: true };
}

/** Untuk sekolah percontohan atau kompensasi: menambah masa aktif tanpa kode. */
export async function beriMasaAktif(id: string, hari: number): Promise<Hasil> {
  const { svc, email } = await wajibPemilik();
  if (!UUID.test(id)) return gagal("ID tidak valid.");
  if (!Number.isInteger(hari) || hari < 1 || hari > 730) return gagal("Isi jumlah hari 1–730.");
  const { data: l } = await svc.from("langganan").select("trial_until,active_until").eq("sekolah_id", id).maybeSingle();
  if (!l) return gagal("Sekolah tidak ditemukan.");
  const dasar = Math.max(Date.now(), new Date(l.active_until ?? l.trial_until).getTime());
  const baru = new Date(dasar + hari * 86400000).toISOString();
  const { error } = await svc.from("langganan").update({ active_until: baru }).eq("sekolah_id", id);
  if (error) return gagal("Gagal menyimpan.");
  await catat(svc, email, id, "pemilik_beri_masa_aktif", { hari, sampai: baru });
  segarkan(id);
  return { ok: true };
}

export async function gantiSlug(id: string, slug: string): Promise<Hasil> {
  const { svc } = await wajibPemilik();
  const s = slug.trim().toLowerCase();
  if (!UUID.test(id)) return gagal("ID tidak valid.");
  if (!SLUG_RE.test(s) || SLUG_DIPESAN.includes(s)) return gagal("Alamat tidak valid (huruf kecil, angka, tanda hubung; 3–40 karakter).");
  const { error } = await svc.rpc("ganti_slug", { p_sekolah: id, p_slug: s });
  if (error) return gagal(error.message === "slug_dipakai" ? "Alamat itu sudah dipakai sekolah lain." : "Gagal mengganti alamat.");
  revalidatePath(`/${s}`);
  segarkan(id);
  return { ok: true };
}

export async function gantiEmail(id: string, emailBaru: string): Promise<Hasil> {
  const { svc, email } = await wajibPemilik();
  const em = emailBaru.trim().toLowerCase();
  if (!UUID.test(id)) return gagal("ID tidak valid.");
  if (!/^\S+@\S+\.\S+$/.test(em) || em.length > 200) return gagal("Isi email yang benar.");

  const { data: a } = await svc.from("admin_sekolah").select("user_id,email").eq("sekolah_id", id).maybeSingle();
  if (!a) return gagal("Admin sekolah tidak ditemukan.");
  if (a.email === em) return { ok: true };
  if ((await svc.from("admin_sekolah").select("sekolah_id").eq("email", em).maybeSingle()).data) return gagal("Email itu sudah dipakai sekolah lain.");

  // email_confirm: true karena pemilik sudah memverifikasi permintaan (lihat PRD: atas permintaan sekolah)
  const { error: e1 } = await svc.auth.admin.updateUserById(a.user_id, { email: em, email_confirm: true });
  if (e1) return gagal("Gagal mengganti email di akun login. Mungkin sudah dipakai akun lain.");
  const { error: e2 } = await svc.from("admin_sekolah").update({ email: em }).eq("sekolah_id", id);
  if (e2) {
    await svc.auth.admin.updateUserById(a.user_id, { email: a.email, email_confirm: true }); // kembalikan agar tetap sinkron
    return gagal("Gagal menyimpan. Perubahan dibatalkan.");
  }
  await catat(svc, email, id, "pemilik_ganti_email", { dari: a.email, ke: em });
  segarkan(id);
  return { ok: true };
}

export async function simpanPengaturan(f: { lynk: string; harga: string; komisi: string; batas: string }): Promise<Hasil> {
  const { svc, email } = await wajibPemilik();
  const lynk = f.lynk.trim();
  if (lynk && !/^https:\/\//.test(lynk)) return gagal("Link produk harus diawali https://");
  const angka = (s: string) => (s.trim() === "" ? null : Number(s));
  const harga = angka(f.harga), komisi = angka(f.komisi), batas = angka(f.batas);
  for (const n of [harga, komisi, batas]) if (n !== null && (!Number.isInteger(n) || n < 0)) return gagal("Nominal harus angka bulat 0 atau lebih.");
  if (komisi === null || batas === null) return gagal("Isi nominal komisi dan batas pencairan.");

  const { data: lama } = await svc.from("pengaturan").select("komisi_nominal,batas_pencairan").eq("id", 1).single();
  const { error } = await svc.from("pengaturan").update({
    lynk_url: lynk || null, harga_paket: harga, komisi_nominal: komisi, batas_pencairan: batas,
  }).eq("id", 1);
  if (error) return gagal("Gagal menyimpan.");
  // perubahan nominal komisi wajib tercatat (PRD)
  if (lama && (lama.komisi_nominal !== komisi || lama.batas_pencairan !== batas)) {
    await catat(svc, email, null, "komisi_diubah", { komisi: [lama.komisi_nominal, komisi], batas: [lama.batas_pencairan, batas] });
  }
  revalidatePath("/super/pengaturan");
  revalidatePath("/admin/langganan");
  return { ok: true };
}

export type TestimoniIsi = { nama: string; jabatan: string; rating: number; isi: string; namaSekolah: string };

function cekTestimoni(f: TestimoniIsi): string | null {
  if (f.nama.trim().length < 2) return "Isi nama penulis.";
  if (!Number.isInteger(f.rating) || f.rating < 1 || f.rating > 5) return "Rating 1 sampai 5.";
  const n = f.isi.trim().length;
  if (n < 10 || n > 300) return "Isi testimoni 10–300 huruf.";
  return null;
}
const segarkanTestimoni = () => { revalidatePath("/"); revalidatePath("/super/testimoni"); };

/** Tambah testimoni dari sekolah yang sudah memberi izin (mis. lewat WhatsApp). */
export async function tambahTestimoni(f: TestimoniIsi): Promise<Hasil> {
  const { svc, email } = await wajibPemilik();
  const g = cekTestimoni(f); if (g) return gagal(g);
  if (f.namaSekolah.trim().length < 3) return gagal("Isi nama sekolah.");
  const { error } = await svc.from("testimoni").insert({
    nama_sekolah: f.namaSekolah.trim().slice(0, 150), nama: f.nama.trim().slice(0, 80),
    jabatan: f.jabatan.trim().slice(0, 60) || null, rating: f.rating, isi: f.isi.trim(),
  });
  if (error) return gagal("Gagal menyimpan.");
  await catat(svc, email, null, "pemilik_tambah_testimoni", { sekolah: f.namaSekolah });
  segarkanTestimoni();
  return { ok: true };
}

export async function ubahTestimoni(id: string, f: TestimoniIsi): Promise<Hasil> {
  const { svc, email } = await wajibPemilik();
  if (!UUID.test(id)) return gagal("ID tidak valid.");
  const g = cekTestimoni(f); if (g) return gagal(g);
  const { error } = await svc.from("testimoni").update({
    nama: f.nama.trim().slice(0, 80), jabatan: f.jabatan.trim().slice(0, 60) || null, rating: f.rating, isi: f.isi.trim(),
    ...(f.namaSekolah.trim() ? { nama_sekolah: f.namaSekolah.trim().slice(0, 150) } : {}),
  }).eq("id", id);
  if (error) return gagal("Gagal menyimpan.");
  await catat(svc, email, null, "pemilik_ubah_testimoni", { id });
  segarkanTestimoni();
  return { ok: true };
}

export async function setTampilTestimoni(id: string, tampil: boolean): Promise<Hasil> {
  const { svc, email } = await wajibPemilik();
  if (!UUID.test(id)) return gagal("ID tidak valid.");
  const { error } = await svc.from("testimoni").update({ tampil }).eq("id", id);
  if (error) return gagal("Gagal menyimpan.");
  await catat(svc, email, null, tampil ? "pemilik_tampilkan_testimoni" : "pemilik_sembunyikan_testimoni", { id });
  segarkanTestimoni();
  return { ok: true };
}

export async function hapusTestimoni(id: string): Promise<Hasil> {
  const { svc, email } = await wajibPemilik();
  if (!UUID.test(id)) return gagal("ID tidak valid.");
  const { error } = await svc.from("testimoni").delete().eq("id", id);
  if (error) return gagal("Gagal menghapus.");
  await catat(svc, email, null, "pemilik_hapus_testimoni", { id });
  segarkanTestimoni();
  return { ok: true };
}

export async function setMasukanSelesai(id: string, selesai: boolean): Promise<Hasil> {
  const { svc } = await wajibPemilik();
  if (!UUID.test(id)) return gagal("ID tidak valid.");
  const { error } = await svc.from("masukan").update({ selesai }).eq("id", id);
  if (error) return gagal("Gagal menyimpan.");
  revalidatePath("/super/masukan");
  revalidatePath("/super");
  return { ok: true };
}

/** Catat komisi ajakan yang sudah dibayarkan ke sekolah (menambah total dicairkan). */
export async function catatPencairan(id: string, jumlah: number): Promise<Hasil> {
  const { svc, email } = await wajibPemilik();
  if (!UUID.test(id)) return gagal("ID tidak valid.");
  const n = Math.round(Number(jumlah));
  if (!(n > 0 && n <= 10_000_000)) return gagal("Jumlah tidak valid.");
  const { data: s } = await svc.from("sekolah").select("komisi_dicairkan").eq("id", id).single();
  const { error } = await svc.from("sekolah").update({ komisi_dicairkan: (s?.komisi_dicairkan ?? 0) + n }).eq("id", id);
  if (error) return gagal("Gagal menyimpan.");
  await catat(svc, email, id, "komisi_dicairkan", { jumlah: n });
  segarkan(id);
  return { ok: true };
}

/** Ganti token tautan aktivasi (bila tautan setelah-bayar bocor). Tautan lama langsung tidak berlaku. */
export async function gantiTokenAktivasi(): Promise<Hasil> {
  const { svc, email } = await wajibPemilik();
  const token = Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(16).padStart(2, "0")).join("");
  const { error } = await svc.from("pengaturan").update({ token_aktivasi: token }).eq("id", 1);
  if (error) return gagal("Gagal mengganti token.");
  await catat(svc, email, null, "token_aktivasi_diganti", {});
  revalidatePath("/super/pengaturan");
  return { ok: true };
}

/** Pemilik membuatkan kode aktivasi (berlaku 24 jam) untuk email admin sekolah. */
export async function buatKodePemilik(email: string): Promise<{ ok: true; kode: string } | { ok: false; pesan: string }> {
  const { svc } = await wajibPemilik();
  const em = email.trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(em)) return { ok: false, pesan: "Isi email yang benar." };
  const { data, error } = await svc.rpc("buat_kode_pemilik", { p_email: em, p_jam: 24 });
  if (error || typeof data !== "string") return { ok: false, pesan: error?.message.includes("email_tidak_terdaftar") ? "Email ini belum terdaftar sebagai admin sekolah." : "Gagal membuat kode." };
  revalidatePath("/super");
  return { ok: true, kode: data };
}
