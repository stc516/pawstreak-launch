-- Pack Access MVP: packs, members, email invites, and conservative rate limits.

create table if not exists public.packs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

create unique index if not exists packs_owner_id_key on public.packs (owner_id);

create table if not exists public.pack_members (
  id uuid primary key default gen_random_uuid(),
  pack_id uuid not null references public.packs (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null check (role in ('owner', 'member', 'viewer')),
  created_at timestamptz not null default now(),
  unique (pack_id, user_id)
);

create index if not exists pack_members_user_id_idx
  on public.pack_members (user_id, created_at desc);

create table if not exists public.pack_invites (
  id uuid primary key default gen_random_uuid(),
  pack_id uuid not null references public.packs (id) on delete cascade,
  email text not null,
  role text not null check (role in ('member', 'viewer')),
  token text not null unique default encode(gen_random_bytes(32), 'hex'),
  accepted_at timestamptz,
  expires_at timestamptz not null default (now() + interval '14 days'),
  created_at timestamptz not null default now()
);

create index if not exists pack_invites_pack_id_idx
  on public.pack_invites (pack_id, created_at desc);

create index if not exists pack_invites_email_idx
  on public.pack_invites (lower(email), created_at desc);

create table if not exists public.rate_limit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  action text not null check (action in (
    'pack_invite',
    'community_post',
    'spot_suggestion',
    'challenge_request',
    'photo_upload'
  )),
  amount integer not null default 1 check (amount > 0),
  created_at timestamptz not null default now()
);

create index if not exists rate_limit_events_user_action_idx
  on public.rate_limit_events (user_id, action, created_at desc);

create table if not exists public.challenge_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  city_or_zip text not null,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists challenge_requests_user_id_idx
  on public.challenge_requests (user_id, created_at desc);

alter table public.packs enable row level security;
alter table public.pack_members enable row level security;
alter table public.pack_invites enable row level security;
alter table public.rate_limit_events enable row level security;
alter table public.challenge_requests enable row level security;

create or replace function public.is_pack_owner(target_pack_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.packs p
    where p.id = target_pack_id
      and p.owner_id = auth.uid()
  );
$$;

create or replace function public.is_pack_member(target_pack_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.pack_members pm
    where pm.pack_id = target_pack_id
      and pm.user_id = auth.uid()
  );
$$;

create or replace function public.can_view_dog(target_dog_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.dogs d
    join public.packs p on p.owner_id = d.user_id
    join public.pack_members pm on pm.pack_id = p.id
    where d.id = target_dog_id
      and pm.user_id = auth.uid()
  );
$$;

create or replace function public.can_contribute_to_dog(target_dog_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.dogs d
    join public.packs p on p.owner_id = d.user_id
    join public.pack_members pm on pm.pack_id = p.id
    where d.id = target_dog_id
      and pm.user_id = auth.uid()
      and pm.role in ('owner', 'member')
  );
$$;

create or replace function public.ensure_user_pack(target_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  pack_id uuid;
begin
  insert into public.packs (owner_id)
  values (target_user_id)
  on conflict (owner_id) do update set owner_id = excluded.owner_id
  returning id into pack_id;

  insert into public.pack_members (pack_id, user_id, role)
  values (pack_id, target_user_id, 'owner')
  on conflict (pack_id, user_id) do update set role = 'owner';

  return pack_id;
end;
$$;

insert into public.packs (owner_id)
select id from public.profiles
on conflict (owner_id) do nothing;

insert into public.pack_members (pack_id, user_id, role)
select p.id, p.owner_id, 'owner'
from public.packs p
on conflict (pack_id, user_id) do update set role = 'owner';

create or replace function public.create_pack_for_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.ensure_user_pack(new.id);
  return new;
end;
$$;

drop trigger if exists profiles_create_pack on public.profiles;
create trigger profiles_create_pack
  after insert on public.profiles
  for each row execute function public.create_pack_for_profile();

create or replace function public.assert_rate_limit(
  action_name text,
  max_per_day integer,
  amount_to_add integer default 1
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_total integer;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select coalesce(sum(amount), 0)::integer
  into current_total
  from public.rate_limit_events
  where user_id = auth.uid()
    and action = action_name
    and created_at > now() - interval '1 day';

  if current_total + amount_to_add > max_per_day then
    raise exception 'Rate limit exceeded for %', action_name;
  end if;

  insert into public.rate_limit_events (user_id, action, amount)
  values (auth.uid(), action_name, amount_to_add);
end;
$$;

create or replace function public.create_pack_invite(invite_email text, invite_role text)
returns public.pack_invites
language plpgsql
security definer
set search_path = public
as $$
declare
  pack_id uuid;
  created_invite public.pack_invites;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if invite_role not in ('member', 'viewer') then
    raise exception 'Invalid invite role';
  end if;

  pack_id := public.ensure_user_pack(auth.uid());

  if not public.is_pack_owner(pack_id) then
    raise exception 'Only pack owners can create invites';
  end if;

  perform public.assert_rate_limit('pack_invite', 10, 1);

  insert into public.pack_invites (pack_id, email, role)
  values (pack_id, lower(trim(invite_email)), invite_role)
  returning * into created_invite;

  return created_invite;
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
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

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

  insert into public.pack_members (pack_id, user_id, role)
  values (invite_row.pack_id, auth.uid(), invite_row.role)
  on conflict (pack_id, user_id) do update set role = excluded.role;

  update public.pack_invites
  set accepted_at = now()
  where id = invite_row.id;

  return query select invite_row.pack_id, invite_row.role;
end;
$$;

create or replace function public.rate_limit_location_candidate()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_rate_limit('spot_suggestion', 5, 1);
  return new;
end;
$$;

drop trigger if exists location_candidates_rate_limit on public.location_candidates;
create trigger location_candidates_rate_limit
  before insert on public.location_candidates
  for each row
  when (new.user_id is not null)
  execute function public.rate_limit_location_candidate();

create or replace function public.rate_limit_challenge_request()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_rate_limit('challenge_request', 3, 1);
  return new;
end;
$$;

drop trigger if exists challenge_requests_rate_limit on public.challenge_requests;
create trigger challenge_requests_rate_limit
  before insert on public.challenge_requests
  for each row execute function public.rate_limit_challenge_request();

create or replace function public.rate_limit_memory_photos()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  old_count integer;
  new_count integer;
  added integer;
begin
  old_count := coalesce(array_length(old.photo_paths, 1), 0);
  new_count := coalesce(array_length(new.photo_paths, 1), 0);
  added := greatest(new_count - old_count, 0);
  if added > 0 then
    perform public.assert_rate_limit('photo_upload', 50, added);
  end if;
  return new;
end;
$$;

drop trigger if exists memories_photo_rate_limit on public.memories;
create trigger memories_photo_rate_limit
  before update of photo_paths on public.memories
  for each row execute function public.rate_limit_memory_photos();

create policy "packs_select_member"
  on public.packs for select to authenticated
  using (owner_id = auth.uid() or public.is_pack_member(id));

create policy "packs_insert_owner"
  on public.packs for insert to authenticated
  with check (owner_id = auth.uid());

create policy "packs_update_owner"
  on public.packs for update to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "pack_members_select_pack"
  on public.pack_members for select to authenticated
  using (public.is_pack_member(pack_id));

create policy "pack_members_delete_owner"
  on public.pack_members for delete to authenticated
  using (public.is_pack_owner(pack_id) and role <> 'owner');

create policy "pack_invites_select_owner"
  on public.pack_invites for select to authenticated
  using (public.is_pack_owner(pack_id));

create policy "rate_limit_events_select_own"
  on public.rate_limit_events for select to authenticated
  using (user_id = auth.uid());

create policy "challenge_requests_insert_own"
  on public.challenge_requests for insert to authenticated
  with check (user_id = auth.uid());

create policy "challenge_requests_select_own"
  on public.challenge_requests for select to authenticated
  using (user_id = auth.uid());

create policy "dogs_select_pack"
  on public.dogs for select to authenticated
  using (public.can_view_dog(id));

create policy "dogs_update_pack_owner"
  on public.dogs for update to authenticated
  using (public.can_contribute_to_dog(id) and user_id = auth.uid())
  with check (public.can_contribute_to_dog(id) and user_id = auth.uid());

create policy "adventures_select_pack"
  on public.adventures for select to authenticated
  using (public.can_view_dog(dog_id));

create policy "adventures_insert_pack_member"
  on public.adventures for insert to authenticated
  with check (user_id = auth.uid() and public.can_contribute_to_dog(dog_id));

create policy "adventures_update_pack_member"
  on public.adventures for update to authenticated
  using (user_id = auth.uid() and public.can_contribute_to_dog(dog_id))
  with check (user_id = auth.uid() and public.can_contribute_to_dog(dog_id));

create policy "memories_select_pack"
  on public.memories for select to authenticated
  using (public.can_view_dog(dog_id));

create policy "memories_insert_pack_member"
  on public.memories for insert to authenticated
  with check (user_id = auth.uid() and public.can_contribute_to_dog(dog_id));

create policy "memories_update_pack_member"
  on public.memories for update to authenticated
  using (user_id = auth.uid() and public.can_contribute_to_dog(dog_id))
  with check (user_id = auth.uid() and public.can_contribute_to_dog(dog_id));

alter table public.user_events
  drop constraint if exists user_events_event_name_check;

alter table public.user_events
  add constraint user_events_event_name_check
  check (event_name in (
    'signup',
    'onboarding_complete',
    'adventure_started',
    'adventure_completed',
    'memory_created',
    'early_access_joined',
    'pack_invite_saved',
    'pack_invite_sent',
    'pack_invite_accepted'
  ));

comment on table public.packs is 'A shared PawStreak pack owned by one account.';
comment on table public.pack_members is 'Users with access to a pack as owner, member, or viewer.';
comment on table public.pack_invites is 'Email-only Pack Access invitations.';
comment on table public.rate_limit_events is 'Per-user daily rate limit accounting.';
comment on table public.challenge_requests is 'Requests for local challenge packs in new cities.';
