-- Harden the PawStreak public function API without changing RLS behavior.
--
-- Trigger/internal helper functions do not need Data API access. The seven
-- authenticated functions below are intentionally retained because they are
-- either explicit RPC endpoints or are evaluated by authenticated RLS policies.

alter function public.set_updated_at() set search_path = '';

revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.accept_pack_invite(text) from public, anon, authenticated;
revoke execute on function public.assert_rate_limit(text, integer, integer) from public, anon, authenticated;
revoke execute on function public.can_contribute_to_dog(uuid) from public, anon, authenticated;
revoke execute on function public.can_view_dog(uuid) from public, anon, authenticated;
revoke execute on function public.create_pack_for_profile() from public, anon, authenticated;
revoke execute on function public.create_pack_invite(text, text) from public, anon, authenticated;
revoke execute on function public.ensure_user_pack(uuid) from public, anon, authenticated;
revoke execute on function public.is_internal_user() from public, anon, authenticated;
revoke execute on function public.is_pack_member(uuid) from public, anon, authenticated;
revoke execute on function public.is_pack_owner(uuid) from public, anon, authenticated;
revoke execute on function public.rate_limit_challenge_request() from public, anon, authenticated;
revoke execute on function public.rate_limit_location_candidate() from public, anon, authenticated;
revoke execute on function public.rate_limit_memory_photos() from public, anon, authenticated;

grant execute on function public.accept_pack_invite(text) to authenticated;
grant execute on function public.can_contribute_to_dog(uuid) to authenticated;
grant execute on function public.can_view_dog(uuid) to authenticated;
grant execute on function public.create_pack_invite(text, text) to authenticated;
grant execute on function public.is_internal_user() to authenticated;
grant execute on function public.is_pack_member(uuid) to authenticated;
grant execute on function public.is_pack_owner(uuid) to authenticated;

-- Abort the migration if its resulting API surface differs from the reviewed
-- allowlist. This is intentionally part of the migration so hosted execution
-- verifies the same invariants as repository QA.
do $$
declare
  function_row record;
  authenticated_allowlist constant text[] := array[
    'accept_pack_invite',
    'can_contribute_to_dog',
    'can_view_dog',
    'create_pack_invite',
    'is_internal_user',
    'is_pack_member',
    'is_pack_owner'
  ];
  target_names constant text[] := array[
    'accept_pack_invite',
    'assert_rate_limit',
    'can_contribute_to_dog',
    'can_view_dog',
    'create_pack_for_profile',
    'create_pack_invite',
    'ensure_user_pack',
    'is_internal_user',
    'is_pack_member',
    'is_pack_owner',
    'rate_limit_challenge_request',
    'rate_limit_location_candidate',
    'rate_limit_memory_photos',
    'set_updated_at'
  ];
begin
  if (
    select count(*)
    from pg_catalog.pg_proc p
    join pg_catalog.pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = any(target_names)
  ) <> 14 then
    raise exception 'Unexpected PawStreak function inventory during privilege hardening';
  end if;

  for function_row in
    select p.oid, p.proname, p.proacl
    from pg_catalog.pg_proc p
    join pg_catalog.pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = any(target_names)
  loop
    if has_function_privilege('anon', function_row.oid, 'EXECUTE') then
      raise exception 'anon still has EXECUTE on public.%', function_row.proname;
    end if;

    if exists (
      select 1
      from pg_catalog.aclexplode(
        coalesce(
          function_row.proacl,
          pg_catalog.acldefault('f', (select p.proowner from pg_catalog.pg_proc p where p.oid = function_row.oid))
        )
      ) acl
      where acl.grantee = 0
        and acl.privilege_type = 'EXECUTE'
    ) then
      raise exception 'PUBLIC still has EXECUTE on public.%', function_row.proname;
    end if;

    if function_row.proname = any(authenticated_allowlist) then
      if not has_function_privilege('authenticated', function_row.oid, 'EXECUTE') then
        raise exception 'authenticated lost required EXECUTE on public.%', function_row.proname;
      end if;
    elsif has_function_privilege('authenticated', function_row.oid, 'EXECUTE') then
      raise exception 'authenticated still has internal EXECUTE on public.%', function_row.proname;
    end if;
  end loop;

  if not exists (
    select 1
    from pg_catalog.pg_proc p
    join pg_catalog.pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'set_updated_at'
      and coalesce(p.proconfig, '{}'::text[]) @> array['search_path=""']
  ) then
    raise exception 'public.set_updated_at() does not have an empty search_path';
  end if;
end;
$$;
