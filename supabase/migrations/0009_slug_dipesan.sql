-- Daftar slug dipesan diperluas (auth, keluar adalah rute level atas). Satu sumber kebenaran: slug_dipesan().
create function slug_dipesan() returns text[] language sql immutable as $$
  select array['admin','masuk','daftar','aktivasi','super','api','auth','keluar']
$$;
grant execute on function slug_dipesan() to anon, authenticated, service_role;

alter table sekolah drop constraint sekolah_slug_check;
alter table sekolah add constraint sekolah_slug_check
  check (slug ~ '^[a-z0-9](?:[a-z0-9-]{1,38})[a-z0-9]$' and slug <> all (slug_dipesan()));

create or replace function cek_slug(p_slug text) returns boolean
language sql stable security definer set search_path = public as $$
  select p_slug ~ '^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$'
     and p_slug <> all (slug_dipesan())
     and not exists (select 1 from sekolah where slug = p_slug)
     and not exists (select 1 from slug_lama where slug = p_slug)
$$;

create or replace function ganti_slug(p_sekolah uuid, p_slug text) returns text
language plpgsql security definer set search_path = public as $$
declare lama text;
begin
  select slug into lama from sekolah where id = p_sekolah for update;
  if lama is null then raise exception 'sekolah_tidak_ada'; end if;
  if lama = p_slug then return lama; end if;
  if p_slug !~ '^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$' or p_slug = any (slug_dipesan()) then
    raise exception 'slug_tidak_valid';
  end if;
  if exists (select 1 from sekolah where slug = p_slug)
     or exists (select 1 from slug_lama where slug = p_slug and sekolah_id <> p_sekolah) then
    raise exception 'slug_dipakai';
  end if;
  delete from slug_lama where slug = p_slug;
  insert into slug_lama (slug, sekolah_id) values (lama, p_sekolah);
  update sekolah set slug = p_slug where id = p_sekolah;
  insert into log_langganan (sekolah_id, peristiwa, detail)
    values (p_sekolah, 'pemilik_ganti_slug', jsonb_build_object('dari', lama, 'ke', p_slug));
  return p_slug;
end $$;
