-- Lightweight product analytics events

create table if not exists public.user_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  event_name text not null
    check (event_name in (
      'signup',
      'onboarding_complete',
      'adventure_started',
      'adventure_completed',
      'memory_created',
      'early_access_joined'
    )),
  metadata jsonb not null default '{}'::jsonb,
  page_path text,
  created_at timestamptz not null default now()
);

create index if not exists user_events_user_id_idx
  on public.user_events (user_id, created_at desc);

create index if not exists user_events_event_name_idx
  on public.user_events (event_name, created_at desc);

alter table public.user_events enable row level security;

create policy "user_events_insert_anon"
  on public.user_events for insert to anon
  with check (true);

create policy "user_events_insert_authenticated"
  on public.user_events for insert to authenticated
  with check (auth.uid() = user_id or user_id is null);

create policy "user_events_select_own"
  on public.user_events for select to authenticated
  using (auth.uid() = user_id);

comment on table public.user_events is 'Lightweight PawStreak product event log.';
