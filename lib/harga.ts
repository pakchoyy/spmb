/** Harga paket dengan promo. Setelah batas promo, yang tampil hanya harga biasa. */
export type HargaPaket = { harga: number; coret: number | null; promoSampai: string | null; promoAktif: boolean };

export function hargaTampil(p: { harga_paket: number | null; harga_coret: number | null; promo_sampai: string | null } | null): HargaPaket | null {
  if (!p?.harga_paket) return null;
  const aktif = !!p.harga_coret && !!p.promo_sampai && new Date(p.promo_sampai).getTime() > Date.now();
  return { harga: p.harga_paket, coret: aktif ? p.harga_coret : null, promoSampai: aktif ? p.promo_sampai : null, promoAktif: aktif };
}

export const rupiahHarga = (n: number) => `Rp${n.toLocaleString("id-ID")}`;
export const tglPromo = (iso: string) => new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" });
