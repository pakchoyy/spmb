-- Langganan: sekolah yang dibatalkan/dinonaktifkan pemilik tidak bisa membuka diri sendiri lewat kode baru.

create or replace function status_saya() returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'status', langganan_status(l.sekolah_id), 'trial_until', l.trial_until, 'active_until', l.active_until,
    'dibatalkan', l.dibatalkan, 'dinonaktifkan', s.nonaktif, 'email', a.email)
  from langganan l join sekolah s on s.id = l.sekolah_id join admin_sekolah a on a.sekolah_id = s.id
  where l.sekolah_id = sekolah_saya()
$$;

create or replace function gunakan_kode(p_kode text) returns timestamptz
language plpgsql security definer set search_path = public as $$
declare sid uuid := sekolah_saya(); k kode_aktivasi%rowtype; base timestamptz; baru timestamptz;
begin
  if sid is null then raise exception 'belum_masuk'; end if;
  -- dibatalkan/dinonaktifkan pemilik: hanya pemilik yang bisa membukanya kembali
  if exists (select 1 from langganan l join sekolah s on s.id = l.sekolah_id
             where l.sekolah_id = sid and (l.dibatalkan or s.nonaktif)) then
    raise exception 'langganan_dibatalkan';
  end if;
  select * into k from kode_aktivasi where kode = upper(trim(p_kode)) and sekolah_id = sid for update;
  if not found or k.dipakai_pada is not null then raise exception 'kode_tidak_valid'; end if;
  update kode_aktivasi set dipakai_pada = now() where kode = k.kode;
  -- perpanjangan menambah 1 tahun dari tanggal berakhir, sisa hari tidak hangus
  select greatest(coalesce(active_until, now()), now()) into base from langganan where sekolah_id = sid;
  update langganan set active_until = base + interval '1 year' where sekolah_id = sid returning active_until into baru;
  insert into log_langganan (sekolah_id, peristiwa, detail) values (sid, 'kode_dipakai', jsonb_build_object('kode', k.kode));
  return baru;
end $$;

create or replace function minta_kode_aktivasi(p_email text) returns text
language plpgsql security definer set search_path = public as $$
declare sid uuid; v text; alfabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; i int;
begin
  select sekolah_id into sid from admin_sekolah where email = lower(trim(p_email));
  if sid is null then return null; end if;
  if exists (select 1 from langganan l join sekolah s on s.id = l.sekolah_id
             where l.sekolah_id = sid and (l.dibatalkan or s.nonaktif)) then
    return null;
  end if;
  if (select count(*) from kode_aktivasi where email = lower(trim(p_email)) and dibuat_pada > now() - interval '1 day') >= 3 then
    raise exception 'batas_harian';
  end if;
  loop
    v := 'SPMB-';
    for i in 1..5 loop v := v || substr(alfabet, 1 + get_byte(gen_random_bytes(1), 0) % 31, 1); end loop;
    exit when not exists (select 1 from kode_aktivasi where kode = v);
  end loop;
  insert into kode_aktivasi (kode, sekolah_id, email) values (v, sid, lower(trim(p_email)));
  insert into log_langganan (sekolah_id, peristiwa, detail) values (sid, 'kode_dibuat', jsonb_build_object('kode', v));
  return v;
end $$;

grant execute on function status_saya(), gunakan_kode(text) to authenticated;
revoke all on function minta_kode_aktivasi(text) from public, anon, authenticated;
grant execute on function minta_kode_aktivasi(text) to service_role;
