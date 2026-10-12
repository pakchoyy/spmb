-- Pemilik membuatkan kode aktivasi untuk email admin tertentu (mis. kode kedaluwarsa). Hanya service_role.
create or replace function buat_kode_pemilik(p_email text, p_jam int default 24) returns text
language plpgsql security definer set search_path = public as $$
declare sid uuid; v text; alfabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; i int;
begin
  select sekolah_id into sid from admin_sekolah where email = lower(trim(p_email));
  if sid is null then raise exception 'email_tidak_terdaftar'; end if;
  loop
    v := 'SPMB-';
    for i in 1..5 loop v := v || substr(alfabet, 1 + get_byte(extensions.gen_random_bytes(1), 0) % 31, 1); end loop;
    exit when not exists (select 1 from kode_aktivasi where kode = v);
  end loop;
  insert into kode_aktivasi (kode, sekolah_id, email, kedaluwarsa)
    values (v, sid, lower(trim(p_email)), now() + make_interval(hours => least(greatest(p_jam, 1), 168)));
  insert into log_langganan (sekolah_id, peristiwa, detail) values (sid, 'kode_dibuat', jsonb_build_object('kode', v, 'lewat', 'pemilik'));
  return v;
end $$;
revoke all on function buat_kode_pemilik(text, int) from public, anon, authenticated;
grant execute on function buat_kode_pemilik(text, int) to service_role;
