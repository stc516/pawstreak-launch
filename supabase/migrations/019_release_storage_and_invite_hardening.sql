-- Enforce server-side photo constraints and bind email invites to the invited account.

update storage.buckets
set file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
where id = 'memory-photos';

revoke execute on function public.ensure_user_pack(uuid) from public;

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
  on conflict (pack_id, user_id) do update set role = excluded.role;

  update public.pack_invites
  set accepted_at = now()
  where id = invite_row.id;

  return query select invite_row.pack_id, invite_row.role;
end;
$$;

revoke execute on function public.accept_pack_invite(text) from public;
grant execute on function public.accept_pack_invite(text) to authenticated;
