-- Remove both inherited PUBLIC and direct application-role grants.
-- Internal functions remain executable by their owner from SECURITY DEFINER
-- trigger/RPC bodies. Do not remove authenticated grants from RLS helpers.
begin;
create or replace function public.ensure_user_pack(target_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  resolved_pack_id uuid;
begin
  insert into public.packs (owner_id)
  values (target_user_id)
  on conflict (owner_id) do update set owner_id = excluded.owner_id
  returning id into resolved_pack_id;

  insert into public.pack_members (pack_id, user_id, role)
  values (resolved_pack_id, target_user_id, 'owner')
  on conflict (pack_id, user_id) do update set role = 'owner';

  return resolved_pack_id;
end;
$$;
create or replace function public.accept_pack_invite(invite_token text)
returns table (pack_id uuid, role text)
language plpgsql
security definer
set search_path = public
as $$
declare
  invite_row public.pack_invites;
  account_email text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  account_email := lower(trim(coalesce(auth.jwt() ->> 'email', '')));

  select *
  into invite_row
  from public.pack_invites
  where token = invite_token
    and accepted_at is null
    and expires_at > now()
  limit 1;

  if invite_row.id is null then
    raise exception 'Invite is invalid or expired';
  end if;

  if account_email = '' or account_email <> lower(trim(invite_row.email)) then
    raise exception 'Sign in with the email address that received this invite';
  end if;

  insert into public.pack_members (pack_id, user_id, role)
  values (invite_row.pack_id, auth.uid(), invite_row.role)
  on conflict on constraint pack_members_pack_id_user_id_key do update set role = excluded.role;

  update public.pack_invites
  set accepted_at = now()
  where id = invite_row.id;

  return query select invite_row.pack_id, invite_row.role;
end;
$$;
alter function public.set_updated_at() set search_path = '';
revoke all on function public.ensure_user_pack(uuid) from public, anon, authenticated;
revoke all on function public.assert_rate_limit(text,integer,integer) from public, anon, authenticated;
revoke all on function public.create_pack_for_profile() from public, anon, authenticated;
revoke all on function public.rate_limit_challenge_request() from public, anon, authenticated;
revoke all on function public.rate_limit_location_candidate() from public, anon, authenticated;
revoke all on function public.rate_limit_memory_photos() from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;

revoke all on function public.accept_pack_invite(text) from public, anon;
revoke all on function public.create_pack_invite(text,text) from public, anon;
revoke all on function public.can_contribute_to_dog(uuid) from public, anon;
revoke all on function public.can_view_dog(uuid) from public, anon;
revoke all on function public.is_internal_user() from public, anon;
revoke all on function public.is_pack_member(uuid) from public, anon;
revoke all on function public.is_pack_owner(uuid) from public, anon;
grant execute on function public.accept_pack_invite(text) to authenticated;
grant execute on function public.create_pack_invite(text,text) to authenticated;
grant execute on function public.can_contribute_to_dog(uuid) to authenticated;
grant execute on function public.can_view_dog(uuid) to authenticated;
grant execute on function public.is_internal_user() to authenticated;
grant execute on function public.is_pack_member(uuid) to authenticated;
grant execute on function public.is_pack_owner(uuid) to authenticated;
commit;
