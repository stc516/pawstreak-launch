create table public.native_device_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text not null check (platform in ('ios', 'android')),
  token text not null check (char_length(token) between 1 and 4096),
  timezone text not null default 'UTC' check (char_length(timezone) between 1 and 100),
  app_version text check (app_version is null or char_length(app_version) <= 50),
  enabled boolean not null default true,
  morning_enabled boolean not null default true,
  morning_time time not null default '08:00',
  evening_enabled boolean not null default true,
  evening_time time not null default '19:00',
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (platform, token)
);

alter table public.native_device_tokens enable row level security;

create policy "Users can read their native device tokens"
  on public.native_device_tokens for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert their native device tokens"
  on public.native_device_tokens for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their native device tokens"
  on public.native_device_tokens for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their native device tokens"
  on public.native_device_tokens for delete
  to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.native_device_tokens from anon, authenticated;
grant select, insert, update, delete on public.native_device_tokens to authenticated;

create index native_device_tokens_user_id_idx
  on public.native_device_tokens (user_id);

create index native_device_tokens_due_idx
  on public.native_device_tokens (enabled, morning_enabled, evening_enabled, updated_at);
