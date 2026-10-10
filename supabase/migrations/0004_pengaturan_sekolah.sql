-- Pengaturan sekolah: izin unggah aset, batas galeri, dan aturan edit jalur (opsi A).

-- format berkas harus subset dari pdf/jpg/png dan tidak kosong
alter table sekolah add constraint format_berkas_valid
  check (cardinality(format_berkas) > 0 and format_berkas <@ array['pdf','jpg','png']);

-- admin hanya boleh menulis ke folder sekolahnya sendiri, dan hanya saat trial/aktif
create policy aset_baca on storage.objects for select to authenticated
  using (bucket_id = 'sekolah-aset' and (storage.foldername(name))[1] = sekolah_saya()::text);
create policy aset_tambah on storage.objects for insert to authenticated
  with check (bucket_id = 'sekolah-aset' and (storage.foldername(name))[1] = sekolah_saya()::text and bisa_tulis(sekolah_saya()));
create policy aset_ubah on storage.objects for update to authenticated
  using (bucket_id = 'sekolah-aset' and (storage.foldername(name))[1] = sekolah_saya()::text and bisa_tulis(sekolah_saya()));
create policy aset_hapus on storage.objects for delete to authenticated
  using (bucket_id = 'sekolah-aset' and (storage.foldername(name))[1] = sekolah_saya()::text);

-- galeri maksimal 6 foto per sekolah
create function batasi_galeri() returns trigger language plpgsql as $$
begin
  if (select count(*) from galeri where sekolah_id = new.sekolah_id) >= 6 then
    raise exception 'galeri_penuh';
  end if;
  return new;
end $$;
create trigger galeri_maks before insert on galeri for each row execute function batasi_galeri();

-- Aturan edit jalur (opsi A): setelah periode dibuka atau sudah ada pendaftar,
-- nama dan syarat berkas boleh diubah, tetapi kuota dan periode terkunci.
create function jalur_terkunci(j jalur) returns boolean language sql stable security definer set search_path = public as $$
  select (j.buka is not null and j.buka <= now()) or exists (select 1 from pendaftar where jalur_id = j.id)
$$;

create function jaga_jalur() returns trigger language plpgsql as $$
begin
  if tg_op = 'DELETE' then
    if exists (select 1 from pendaftar where jalur_id = old.id) then raise exception 'jalur_terkunci'; end if;
    return old;
  end if;
  if jalur_terkunci(old) and (new.kuota is distinct from old.kuota or new.buka is distinct from old.buka
      or new.tutup is distinct from old.tutup) then
    raise exception 'jalur_terkunci';
  end if;
  if new.buka is not null and new.tutup is not null and new.tutup <= new.buka then
    raise exception 'periode_tidak_valid';
  end if;
  return new;
end $$;
create trigger jalur_jaga before update or delete on jalur for each row execute function jaga_jalur();

create function jaga_jalur_baru() returns trigger language plpgsql as $$
begin
  if new.buka is not null and new.tutup is not null and new.tutup <= new.buka then
    raise exception 'periode_tidak_valid';
  end if;
  return new;
end $$;
create trigger jalur_baru before insert on jalur for each row execute function jaga_jalur_baru();

-- dipakai UI untuk menampilkan kunci per jalur
grant execute on function jalur_terkunci(jalur) to authenticated;
