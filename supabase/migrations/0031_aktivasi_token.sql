-- Aktivasi lewat bgy-store: setelah bayar, pembeli diarahkan ke /aktivasi?t=<token>.
-- Tanpa token yang benar kode tidak dibuat. Kode sekali pakai dan berlaku 1 jam.
alter table pengaturan add column token_aktivasi text not null
  default encode(extensions.gen_random_bytes(12), 'hex');
alter table kode_aktivasi add column kedaluwarsa timestamptz not null default now() + interval '1 hour';

create or replace function minta_kode_aktivasi(p_email text, p_token text) returns text
language plpgsql security definer set search_path = public as $$
declare sid uuid; v text; alfabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; i int;
begin
  if p_token is null or p_token <> (select token_aktivasi from pengaturan where id = 1) then raise exception 'token_salah'; end if;
  select sekolah_id into sid from admin_sekolah where email = lower(trim(p_email));
  if sid is null then raise exception 'email_tidak_terdaftar'; end if;
  if exists (select 1 from langganan l join sekolah s on s.id = l.sekolah_id where l.sekolah_id = sid and (l.dibatalkan or s.nonaktif)) then
    raise exception 'langganan_dibatalkan'; end if;
  if (select count(*) from kode_aktivasi where email = lower(trim(p_email)) and dibuat_pada > now() - interval '1 day') >= 3 then
    raise exception 'batas_harian'; end if;
  loop
    v := 'SPMB-';
    for i in 1..5 loop v := v || substr(alfabet, 1 + get_byte(extensions.gen_random_bytes(1), 0) % 31, 1); end loop;
    exit when not exists (select 1 from kode_aktivasi where kode = v);
  end loop;
  insert into kode_aktivasi (kode, sekolah_id, email) values (v, sid, lower(trim(p_email)));
  insert into log_langganan (sekolah_id, peristiwa, detail) values (sid, 'kode_dibuat', jsonb_build_object('kode', v, 'lewat', 'toko'));
  return v;
end $$;
revoke all on function minta_kode_aktivasi(text, text) from public, anon, authenticated;
grant execute on function minta_kode_aktivasi(text, text) to service_role;
-- versi lama tanpa token tidak dipakai lagi
revoke all on function minta_kode_aktivasi(text) from public, anon, authenticated, service_role;

create or replace function gunakan_kode(p_kode text) returns timestamptz
language plpgsql security definer set search_path = public as $$
declare sid uuid := sekolah_saya(); k kode_aktivasi%rowtype; base timestamptz; baru timestamptz;
begin
  if sid is null then raise exception 'belum_masuk'; end if;
  if exists (select 1 from langganan l join sekolah s on s.id = l.sekolah_id where l.sekolah_id = sid and (l.dibatalkan or s.nonaktif)) then
    raise exception 'langganan_dibatalkan'; end if;
  select * into k from kode_aktivasi where kode = upper(trim(p_kode)) and sekolah_id = sid for update;
  if not found or k.dipakai_pada is not null then raise exception 'kode_tidak_valid'; end if;
  if now() > k.kedaluwarsa then raise exception 'kode_kedaluwarsa'; end if;
  update kode_aktivasi set dipakai_pada = now() where kode = k.kode;
  select greatest(coalesce(active_until, now()), now()) into base from langganan where sekolah_id = sid;
  update langganan set active_until = base + interval '1 year' where sekolah_id = sid returning active_until into baru;
  insert into log_langganan (sekolah_id, peristiwa, detail) values (sid, 'kode_dipakai', jsonb_build_object('kode', k.kode));
  return baru;
end $$;
