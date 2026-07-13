-- Restrict feedback reads to explicitly marked internal accounts.
-- Set app_metadata.internal=true for trusted staff from a service-role environment.

create or replace function public.is_internal_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'internal')::boolean, false);
$$;

revoke execute on function public.is_internal_user() from public;
grant execute on function public.is_internal_user() to authenticated;

drop policy if exists "demo_feedback_select_anon" on public.demo_feedback;
drop policy if exists "demo_feedback_select_internal" on public.demo_feedback;
create policy "demo_feedback_select_internal"
  on public.demo_feedback for select to authenticated
  using (public.is_internal_user());

drop policy if exists "product_feedback_select_authenticated" on public.product_feedback;
drop policy if exists "product_feedback_select_internal" on public.product_feedback;
create policy "product_feedback_select_internal"
  on public.product_feedback for select to authenticated
  using (public.is_internal_user());

comment on function public.is_internal_user is
  'True only for authenticated users whose protected app_metadata includes internal=true.';
