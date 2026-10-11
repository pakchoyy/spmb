-- Jalur "Reguler" untuk sekolah yang tidak membagi jalur, supaya tetap bisa meminta syarat berkas.
alter table jalur drop constraint jalur_nama_check;
alter table jalur add constraint jalur_nama_check check (nama in ('Reguler','Domisili','Afirmasi','Prestasi','Mutasi'));
