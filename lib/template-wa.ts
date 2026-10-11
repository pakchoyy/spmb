/** Template pesan WhatsApp admin ke orang tua. Teks bisa diubah admin sebelum dikirim. */
export type DataTemplate = { anak: string; nomor: string; sekolah: string; tautanCek: string; berkasKurang: string[]; catatan: string | null };

export const TEMPLATE_WA: { id: string; label: string; teks: (d: DataTemplate) => string }[] = [
  { id: "diterima", label: "Selamat diterima", teks: (d) =>
    `Assalamu'alaikum Bapak/Ibu orang tua ${d.anak}.\n\nSelamat! Ananda ${d.anak} (nomor ${d.nomor}) *DITERIMA* di ${d.sekolah}. 🎉\n\nInformasi daftar ulang akan kami sampaikan berikutnya. Status bisa dicek di:\n${d.tautanCek}\n\nTerima kasih.` },
  { id: "daftar-ulang", label: "Undangan daftar ulang", teks: (d) =>
    `Bapak/Ibu orang tua ${d.anak} (nomor ${d.nomor}),\n\nKami mengundang Bapak/Ibu untuk daftar ulang di ${d.sekolah} pada:\nHari/tanggal: ...\nJam: ...\nMembawa: ...\n\nTerima kasih.` },
  { id: "berkas", label: "Berkas kurang", teks: (d) =>
    `Bapak/Ibu orang tua ${d.anak} (nomor ${d.nomor}),\n\nBerkas pendaftaran di ${d.sekolah} belum lengkap${d.berkasKurang.length ? `: ${d.berkasKurang.join(", ")}` : ""}. Mohon diunggah lewat halaman cek status:\n${d.tautanCek}\n\nTerima kasih.` },
  { id: "cadangan", label: "Masuk cadangan", teks: (d) =>
    `Bapak/Ibu orang tua ${d.anak} (nomor ${d.nomor}),\n\nAnanda ${d.anak} saat ini masuk *daftar cadangan* di ${d.sekolah}.${d.catatan ? `\nCatatan: ${d.catatan}` : ""}\nKami akan menghubungi Bapak/Ibu bila ada kursi kosong.\n\nTerima kasih.` },
  { id: "ditolak", label: "Belum diterima", teks: (d) =>
    `Bapak/Ibu orang tua ${d.anak} (nomor ${d.nomor}),\n\nMohon maaf, ananda ${d.anak} belum dapat diterima di ${d.sekolah}.${d.catatan ? `\nCatatan: ${d.catatan}` : ""}\n\nTerima kasih atas kepercayaan Bapak/Ibu.` },
];
