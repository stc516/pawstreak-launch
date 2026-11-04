-- Supabase grants EXECUTE to anon/authenticated by default for public RPCs.
-- Revoke direct access to privileged helpers, then grant only the authenticated
-- functions referenced by row-level security policies and the two Edge RPCs.

revoke execute on function public.is_pack_owner(uuid) from public, anon, authenticated;
revoke execute on function public.is_pack_member(uuid) from public, anon, authenticated;
revoke execute on function public.can_view_dog(uuid) from public, anon, authenticated;
revoke execute on function public.can_contribute_to_dog(uuid) from public, anon, authenticated;
revoke execute on function public.ensure_user_pack(uuid) from public, anon, authenticated;
revoke execute on function public.create_pack_for_profile() from public, anon, authenticated;
revoke execute on function public.assert_rate_limit(text, integer, integer) from public, anon, authenticated;
revoke execute on function public.create_pack_invite(text, text) from public, anon, authenticated;
revoke execute on function public.accept_pack_invite(text) from public, anon, authenticated;
revoke execute on function public.rate_limit_location_candidate() from public, anon, authenticated;
revoke execute on function public.rate_limit_challenge_request() from public, anon, authenticated;
revoke execute on function public.rate_limit_memory_photos() from public, anon, authenticated;
revoke execute on function public.is_internal_user() from public, anon, authenticated;

grant execute on function public.is_pack_owner(uuid) to authenticated;
grant execute on function public.is_pack_member(uuid) to authenticated;
grant execute on function public.can_view_dog(uuid) to authenticated;
grant execute on function public.can_contribute_to_dog(uuid) to authenticated;
grant execute on function public.is_internal_user() to authenticated;

-- Pack invitation RPCs are called only by authenticated Edge Functions using
-- the service role; they are not directly exposed as public client RPCs.
grant execute on function public.create_pack_invite(text, text) to service_role;
grant execute on function public.accept_pack_invite(text) to service_role;

-- pg_cron owns token issuance/consumption. Keep the table inaccessible through
-- the Data API and enable RLS as defense in depth for the exposed public schema.
alter table public.push_cron_tokens enable row level security;
revoke all on table public.push_cron_tokens from public, anon, authenticated;
