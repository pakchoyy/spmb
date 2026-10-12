-- Harga promo: harga coret (harga normal) dan batas waktu promo. Lewat batas, tampil harga biasa.
alter table pengaturan add column harga_coret int check (harga_coret is null or harga_coret >= 0);
alter table pengaturan add column promo_sampai timestamptz;
