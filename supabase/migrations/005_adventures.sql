-- Active and completed adventures

create table if not exists public.adventures (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  dog_id uuid not null references public.dogs (id) on delete cascade,
  place_id text not null references public.places (id),
  status text not null default 'active'
    check (status in ('active', 'completed', 'cancelled')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  duration_label text not null default 'Open end',
  notes text not null default '',
  recap_labels text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists adventures_user_id_idx on public.adventures (user_id, started_at desc);
create index if not exists adventures_dog_id_idx on public.adventures (dog_id, started_at desc);
create index if not exists adventures_status_idx on public.adventures (user_id, status);

alter table public.adventures enable row level security;

create policy "adventures_select_own"
  on public.adventures for select to authenticated
  using (auth.uid() = user_id);

create policy "adventures_insert_own"
  on public.adventures for insert to authenticated
  with check (auth.uid() = user_id);

create policy "adventures_update_own"
  on public.adventures for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "adventures_delete_own"
  on public.adventures for delete to authenticated
  using (auth.uid() = user_id);

create trigger adventures_set_updated_at
  before update on public.adventures
  for each row execute function public.set_updated_at();

comment on table public.adventures is 'User adventures tied to a dog and place.';
