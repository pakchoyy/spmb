-- Logo, banner, dan galeri sekolah: bucket publik (bukan data anak), batas 2 MB.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('sekolah-aset', 'sekolah-aset', true, 2097152, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 2097152,
  allowed_mime_types = excluded.allowed_mime_types;
