-- Landing page waitlist signups

create table if not exists public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  email text not null,
  dog_name text not null default '',
  zip_code text not null default '',
  source text not null default 'landing_page',
  created_at timestamptz not null default now()
);

create unique index if not exists waitlist_signups_email_idx
  on public.waitlist_signups (lower(email));

create index if not exists waitlist_signups_created_at_idx
  on public.waitlist_signups (created_at desc);

alter table public.waitlist_signups enable row level security;

create policy "waitlist_insert_anon"
  on public.waitlist_signups for insert to anon
  with check (true);

create policy "waitlist_insert_authenticated"
  on public.waitlist_signups for insert to authenticated
  with check (true);

comment on table public.waitlist_signups is 'Marketing landing page waitlist signups.';
