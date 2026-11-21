\set ON_ERROR_STOP on
create function public.qa_assert(ok boolean, message text) returns void language plpgsql as $$ begin if not coalesce(ok,false) then raise exception 'FAIL: %',message; end if; raise notice 'PASS: %',message; end $$;
select qa_assert(not has_function_privilege('anon','public.ensure_user_pack(uuid)','EXECUTE'),'anonymous internal mutator blocked');
select qa_assert(not has_function_privilege('authenticated','public.ensure_user_pack(uuid)','EXECUTE'),'signed-in internal mutator blocked');
select qa_assert(not has_function_privilege('anon','public.create_pack_invite(text,text)','EXECUTE'),'anonymous invite RPC blocked');
select qa_assert(has_function_privilege('authenticated','public.can_view_dog(uuid)','EXECUTE'),'authenticated RLS helper retained');
insert into auth.users(id,email) values
('00000000-0000-0000-0000-000000000001','owner@test.invalid'),
('00000000-0000-0000-0000-000000000002','viewer@test.invalid'),
('00000000-0000-0000-0000-000000000003','stranger@test.invalid');
set role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',false);
select set_config('request.jwt.claims','{"email":"owner@test.invalid"}',false);
insert into public.profiles(id,email) values(auth.uid(),'owner@test.invalid');
select qa_assert((select count(*)=1 from public.packs),'signup trigger still creates own Pack');
insert into public.dogs(id,user_id,name) values('10000000-0000-0000-0000-000000000001',auth.uid(),'Test dog');
update public.dogs set name='Updated test dog' where id='10000000-0000-0000-0000-000000000001';
select qa_assert((select name='Updated test dog' from dogs limit 1),'updated_at trigger survives revoked direct execution');
select (public.create_pack_invite('viewer@test.invalid','viewer')).token as invite_token \gset
insert into public.memories(id,user_id,dog_id,place_id,place_name,route_points) values('20000000-0000-0000-0000-000000000001',auth.uid(),'10000000-0000-0000-0000-000000000001','neighborhood-walk','Test walk','[{"lat":32.7,"lng":-117.1,"capturedAt":"2026-11-21T12:00:00Z"}]');
insert into storage.objects(bucket_id,name) values('memory-videos',auth.uid()::text || '/20000000-0000-0000-0000-000000000001/clip');
update public.memories set video_path=auth.uid()::text || '/' || id::text || '/clip' where id='20000000-0000-0000-0000-000000000001';
select qa_assert((select count(*)=1 from storage.objects where bucket_id='memory-videos'),'owner can upload/read clip metadata');
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',false);
select set_config('request.jwt.claims','{"email":"viewer@test.invalid"}',false);
insert into public.profiles(id,email) values(auth.uid(),'viewer@test.invalid');
select * from public.accept_pack_invite(:'invite_token');
select qa_assert((select count(*)=1 from public.dogs),'viewer can read shared dog');
select qa_assert((select count(*)=1 from public.memories),'viewer can read shared memory and route');
select qa_assert((select count(*)=0 from storage.objects where bucket_id='memory-videos'),'video remains owner-only even for shared Pack viewer');
update public.dogs set name='unauthorized' where id='10000000-0000-0000-0000-000000000001';
select qa_assert((select name='Updated test dog' from dogs limit 1),'viewer cannot edit owner dog');
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000003',false);
select set_config('request.jwt.claims','{"email":"stranger@test.invalid"}',false);
insert into public.profiles(id,email) values(auth.uid(),'stranger@test.invalid');
select qa_assert((select count(*)=0 from public.dogs),'unrelated account cannot read dog');
select qa_assert((select count(*)=0 from public.memories),'unrelated account cannot read memory or route');
select qa_assert((select count(*)=0 from storage.objects),'unrelated account cannot read media');
do $$ begin
 begin
 insert into storage.objects(bucket_id,name) values('memory-videos','00000000-0000-0000-0000-000000000001/20000000-0000-0000-0000-000000000001/injected');
 raise exception 'FAIL: cross-owner upload allowed';
 exception when insufficient_privilege then raise notice 'PASS: cross-owner upload rejected'; end;
 begin
 perform public.ensure_user_pack('00000000-0000-0000-0000-000000000001');
 raise exception 'FAIL: internal mutator allowed';
 exception when insufficient_privilege then raise notice 'PASS: actual internal mutator call rejected'; end;
end $$;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',false);
do $$ begin
 begin
 update memories set route_points='{}' where id='20000000-0000-0000-0000-000000000001';
 raise exception 'FAIL: non-array route allowed';
 exception when check_violation then raise notice 'PASS: non-array route rejected'; end;
 begin
 update memories set video_path='someone-else/clip' where id='20000000-0000-0000-0000-000000000001';
 raise exception 'FAIL: foreign video pointer allowed';
 exception when check_violation then raise notice 'PASS: foreign video pointer rejected'; end;
end $$;
update memories set video_path=null where id='20000000-0000-0000-0000-000000000001';
delete from storage.objects where bucket_id='memory-videos';
select qa_assert((select count(*)=0 from storage.objects where bucket_id='memory-videos'),'owner can delete video');
reset role;
insert into public.native_push_devices(user_id,token,environment) values('00000000-0000-0000-0000-000000000001',repeat('a',64),'sandbox');
select qa_assert(not has_table_privilege('anon','public.native_push_devices','SELECT'),'anonymous push tokens inaccessible');
select qa_assert(not has_table_privilege('authenticated','public.native_push_devices','INSERT'),'client cannot register arbitrary push tokens directly');
set role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',false);
select qa_assert((select count(*)=1 from native_push_devices),'owner can read own device preferences');
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',false);
select qa_assert((select count(*)=0 from native_push_devices),'Pack viewer cannot read owner push token');
reset role;
