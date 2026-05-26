-- Early access waitlist

create table if not exists public.early_access_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text not null default '',
  dog_name text not null default '',
  zip_or_city text not null default '',
  instagram_handle text,
  source text not null default 'website',
  user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create unique index if not exists early_access_signups_email_idx
  on public.early_access_signups (lower(email));

create index if not exists early_access_signups_created_at_idx
  on public.early_access_signups (created_at desc);

alter table public.early_access_signups enable row level security;

create policy "early_access_insert_anon"
  on public.early_access_signups for insert to anon
  with check (true);

create policy "early_access_insert_authenticated"
  on public.early_access_signups for insert to authenticated
  with check (true);

comment on table public.early_access_signups is 'Early access signups from landing and onboarding.';
