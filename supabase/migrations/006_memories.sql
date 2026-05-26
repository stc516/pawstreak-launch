-- Saved journey memories

create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  dog_id uuid not null references public.dogs (id) on delete cascade,
  adventure_id uuid references public.adventures (id) on delete set null,
  place_id text not null references public.places (id),
  place_name text not null,
  occurred_at timestamptz not null default now(),
  magic_line text not null default '',
  emotional_line text not null default '',
  favorite_moment text not null default '',
  memory_mood text not null default '',
  tags text[] not null default '{}',
  recap_labels text[] not null default '{}',
  duration_label text not null default '',
  photo_paths text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists memories_user_id_idx on public.memories (user_id, occurred_at desc);
create index if not exists memories_dog_id_idx on public.memories (dog_id, occurred_at desc);

alter table public.memories enable row level security;

create policy "memories_select_own"
  on public.memories for select to authenticated
  using (auth.uid() = user_id);

create policy "memories_insert_own"
  on public.memories for insert to authenticated
  with check (auth.uid() = user_id);

create policy "memories_update_own"
  on public.memories for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "memories_delete_own"
  on public.memories for delete to authenticated
  using (auth.uid() = user_id);

create trigger memories_set_updated_at
  before update on public.memories
  for each row execute function public.set_updated_at();

comment on table public.memories is 'Saved adventure memories shown in Journey.';
