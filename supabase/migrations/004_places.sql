-- Read-only place catalog (seeded from app catalog)

create table if not exists public.places (
  id text primary key,
  name text not null,
  city text not null,
  region text not null,
  category text not null,
  tags text[] not null default '{}',
  distance_label text not null default '',
  leash_info text not null default '',
  dog_friendly_notes text not null default '',
  why_dogs_love_it text not null default '',
  best_time text not null default '',
  energy_level text not null default 'Moderate',
  address_label text,
  lat double precision,
  lng double precision,
  featured boolean not null default false,
  popular_now boolean not null default false,
  image_url text,
  image_alt text,
  image_tone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists places_region_idx on public.places (region);
create index if not exists places_category_idx on public.places (category);
create index if not exists places_featured_idx on public.places (featured, popular_now);

alter table public.places enable row level security;

create policy "places_select_authenticated"
  on public.places for select to authenticated
  using (is_active = true);

create policy "places_select_anon"
  on public.places for select to anon
  using (is_active = true);

comment on table public.places is 'Dog-friendly place catalog for planning and memories.';
