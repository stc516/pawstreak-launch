-- National geocoding: track user locations outside developed regions
-- so we know which markets to expand next.

create table if not exists public.location_expansion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  dog_id uuid references public.dogs (id) on delete set null,
  raw_location_input text not null default '',
  resolved_city text not null default '',
  resolved_state text not null default '',
  resolved_country text not null default '',
  latitude double precision,
  longitude double precision,
  mapbox_place_id text,
  mapbox_relevance double precision,
  supported_region boolean not null default false,
  requested_region text not null default '',
  source text not null default 'onboarding'
    check (source in ('onboarding', 'profile')),
  status text not null default 'new'
    check (status in ('new', 'reviewing', 'planned', 'closed')),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists location_expansion_requests_user_id_idx
  on public.location_expansion_requests (user_id, created_at desc);

create index if not exists location_expansion_requests_status_idx
  on public.location_expansion_requests (status, created_at desc);

create index if not exists location_expansion_requests_region_idx
  on public.location_expansion_requests (resolved_state, resolved_city);

alter table public.location_expansion_requests enable row level security;

create policy "location_expansion_requests_select_own"
  on public.location_expansion_requests for select to authenticated
  using (auth.uid() = user_id);

create policy "location_expansion_requests_insert_own"
  on public.location_expansion_requests for insert to authenticated
  with check (auth.uid() = user_id);

create trigger location_expansion_requests_set_updated_at
  before update on public.location_expansion_requests
  for each row execute function public.set_updated_at();

comment on table public.location_expansion_requests is
  'User locations outside developed PawStreak regions — market expansion planning.';
