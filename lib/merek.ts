// Identitas aplikasi di satu tempat.
export const NAMA_APP = "Yuk Masuk!";
export const NOMOR_WA = "6289530713597"; // bantuan, kritik & saran

/** Host aplikasi tanpa protokol, untuk contoh alamat halaman sekolah. */
export const HOST_APP = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://yukmasuk.id").replace(/^https?:\/\//, "").replace(/\/$/, "");

export const linkWaBantuan = (pesan: string) => `https://wa.me/${NOMOR_WA}?text=${encodeURIComponent(pesan)}`;

export const PESAN_WA = {
  umum: `Halo, saya ada kendala di aplikasi ${NAMA_APP}: `,
  sekolah: `Halo, saya admin sekolah pengguna ${NAMA_APP}. Saya ada kendala: `,
  harga: `Halo, saya ingin tahu harga paket ${NAMA_APP} untuk sekolah kami.`,
  saran: `Halo, saya punya kritik/saran untuk ${NAMA_APP}: `,
};
