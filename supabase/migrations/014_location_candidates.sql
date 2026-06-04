-- Custom Adventure GPS Intelligence: internal candidate pipeline

create table if not exists public.location_candidates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  source_adventure_id uuid,
  source_memory_id uuid,
  custom_title text not null,
  normalized_title text,
  custom_location_label text,
  approximate_lat double precision,
  approximate_lng double precision,
  end_lat double precision,
  end_lng double precision,
  photo_count integer not null default 0,
  dog_ids jsonb not null default '[]'::jsonb,
  user_notes text,
  review_status text not null default 'new'
    check (review_status in ('new', 'reviewing', 'approved', 'rejected')),
  candidate_type text not null default 'custom_adventure'
    check (candidate_type in ('custom_adventure')),
  source text not null default 'user_custom_adventure'
    check (source in ('user_custom_adventure')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists location_candidates_user_id_idx
  on public.location_candidates (user_id, created_at desc);

create index if not exists location_candidates_review_status_idx
  on public.location_candidates (review_status, created_at desc);

alter table public.location_candidates enable row level security;

create policy "location_candidates_select_own"
  on public.location_candidates for select to authenticated
  using (auth.uid() = user_id);

create policy "location_candidates_insert_own"
  on public.location_candidates for insert to authenticated
  with check (auth.uid() = user_id);

create trigger location_candidates_set_updated_at
  before update on public.location_candidates
  for each row execute function public.set_updated_at();

comment on table public.location_candidates is
  'Internal review candidates created from GPS-backed custom adventures.';
