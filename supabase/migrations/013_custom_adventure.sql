-- Custom / Add Adventure v2: sentinel place, adventure/memory fields, scheduled adventures

insert into public.places (
  id,
  name,
  city,
  region,
  category,
  tags,
  distance_label,
  leash_info,
  dog_friendly_notes,
  why_dogs_love_it,
  best_time,
  energy_level,
  featured,
  popular_now,
  is_active
) values (
  'custom-adventure',
  'Custom adventure',
  'Your adventures',
  'San Diego',
  'Custom',
  array['custom', 'user-created'],
  '—',
  'Your outing',
  'Adventures you add yourself.',
  'Whatever you and your pack are up to.',
  'Anytime',
  'Moderate',
  false,
  false,
  true
)
on conflict (id) do nothing;

alter table public.adventures
  add column if not exists source text not null default 'catalog'
    check (source in ('catalog', 'neighborhood', 'custom')),
  add column if not exists custom_title text,
  add column if not exists custom_location_label text;

alter table public.memories
  add column if not exists custom_location_label text,
  add column if not exists user_notes text;

create table if not exists public.scheduled_adventures (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  dog_ids uuid[] not null default '{}',
  title text not null,
  location_label text not null default '',
  notes text not null default '',
  photo_path text,
  scheduled_for timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists scheduled_adventures_user_id_idx
  on public.scheduled_adventures (user_id, created_at desc);

alter table public.scheduled_adventures enable row level security;

create policy "scheduled_adventures_select_own"
  on public.scheduled_adventures for select to authenticated
  using (auth.uid() = user_id);

create policy "scheduled_adventures_insert_own"
  on public.scheduled_adventures for insert to authenticated
  with check (auth.uid() = user_id);

create policy "scheduled_adventures_update_own"
  on public.scheduled_adventures for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "scheduled_adventures_delete_own"
  on public.scheduled_adventures for delete to authenticated
  using (auth.uid() = user_id);

create trigger scheduled_adventures_set_updated_at
  before update on public.scheduled_adventures
  for each row execute function public.set_updated_at();

comment on table public.scheduled_adventures is 'User-planned custom adventures (save for later).';
