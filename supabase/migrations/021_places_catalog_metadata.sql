alter table public.places
  add column if not exists website text,
  add column if not exists source_name text,
  add column if not exists source_url text,
  add column if not exists verification text not null default 'curated',
  add column if not exists updated_at timestamptz not null default now();

create index if not exists places_city_idx on public.places (city);
create index if not exists places_verification_idx on public.places (verification);

comment on column public.places.website is 'Official venue or agency website for the place.';
comment on column public.places.source_name is 'Human-readable verification source.';
comment on column public.places.source_url is 'URL used to verify dog access or place details.';
comment on column public.places.verification is 'Catalog verification level such as official, strong, or curated.';
