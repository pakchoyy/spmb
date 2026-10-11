-- Pemakaian penyimpanan untuk halaman /super (hanya service_role).
create or replace function pemakaian_penyimpanan() returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'db_mb', round(pg_database_size(current_database()) / 1048576.0, 1),
    'file_mb', coalesce((select round(sum((metadata->>'size')::bigint) / 1048576.0, 1) from storage.objects), 0),
    'sekolah', coalesce((
      select jsonb_agg(x order by x.mb desc) from (
        select s.id, s.nama, s.slug, round(sum((o.metadata->>'size')::bigint) / 1048576.0, 1) mb, count(o.id) berkas
        from sekolah s join storage.objects o on split_part(o.name, '/', 1) = s.id::text
        group by s.id, s.nama, s.slug) x), '[]'))
$$;
revoke execute on function pemakaian_penyimpanan() from public, anon, authenticated;
grant execute on function pemakaian_penyimpanan() to service_role;
