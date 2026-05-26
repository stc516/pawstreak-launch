-- Dog profiles per user

create table if not exists public.dogs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  breed text not null default '',
  age text not null default '',
  initial text not null default '',
  avatar_class text not null default 'da-b',
  profile_emoji text not null default '🐕',
  circle_class text not null default 'dc-b',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists dogs_user_id_idx on public.dogs (user_id);
create index if not exists dogs_user_sort_idx on public.dogs (user_id, sort_order);

alter table public.dogs enable row level security;

create policy "dogs_select_own"
  on public.dogs for select to authenticated
  using (auth.uid() = user_id);

create policy "dogs_insert_own"
  on public.dogs for insert to authenticated
  with check (auth.uid() = user_id);

create policy "dogs_update_own"
  on public.dogs for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "dogs_delete_own"
  on public.dogs for delete to authenticated
  using (auth.uid() = user_id);

create trigger dogs_set_updated_at
  before update on public.dogs
  for each row execute function public.set_updated_at();

alter table public.profiles
  add constraint profiles_active_dog_id_fkey
  foreign key (active_dog_id) references public.dogs (id) on delete set null;

comment on table public.dogs is 'Dogs belonging to a PawStreak user.';
