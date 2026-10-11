-- Nomor pendaftaran baru: 6 angka (mudah diketik di HP), unik per sekolah.
-- Nomor lama (26-A1B2C3) tetap berlaku.
do $$
declare d text; lama text;
begin
  d := pg_get_functiondef('public.daftar_pendaftar(text,uuid,text,date,jsonb,text,boolean,text)'::regprocedure);
  lama := d;
  d := replace(d,
    $o$nomor := to_char(now(), 'YY') || '-' || upper(substr(encode(extensions.gen_random_bytes(4), 'hex'), 1, 6));$o$,
    $n$loop
    nomor := (100000 + (('x' || encode(extensions.gen_random_bytes(4), 'hex'))::bit(32)::bigint % 900000))::text;
    exit when not exists (select 1 from pendaftar x where x.sekolah_id = s.id and x.nomor = daftar_pendaftar.nomor);
  end loop;$n$);
  if d = lama then raise exception 'pola nomor tidak ditemukan'; end if;
  execute d;
end $$;

-- Cek status cukup dengan nomor (keputusan pemilik). Unggah berkas tetap memakai tanggal lahir.
create or replace function cek_status_nomor(p_slug text, p_nomor text) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'nomor', p.nomor, 'nama_anak', p.nama_anak, 'status', p.status, 'catatan', p.catatan,
    'sekolah', s.nama, 'jalur', j.nama, 'syarat_berkas', coalesce(to_jsonb(j.syarat_berkas), '[]'),
    'berkas', coalesce((select jsonb_agg(b.jenis) from berkas b where b.pendaftar_id = p.id), '[]'))
  from pendaftar p join sekolah s on s.id = p.sekolah_id left join jalur j on j.id = p.jalur_id
  where s.slug = p_slug and p.nomor = upper(trim(p_nomor))
$$;
revoke all on function cek_status_nomor(text, text) from public;
grant execute on function cek_status_nomor(text, text) to anon, authenticated;
