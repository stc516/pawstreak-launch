-- Product feedback (separate from legacy demo_feedback)

create table if not exists public.product_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  submitted_at timestamptz not null default now(),
  what_is_it_for text not null default '',
  would_use_with_dog text not null default '',
  what_confused text not null default '',
  what_liked_most text not null default '',
  premium_value text,
  user_agent text,
  page_path text,
  source text not null default 'app',
  created_at timestamptz not null default now()
);

create index if not exists product_feedback_submitted_at_idx
  on public.product_feedback (submitted_at desc);

alter table public.product_feedback enable row level security;

create policy "product_feedback_insert_anon"
  on public.product_feedback for insert to anon
  with check (true);

create policy "product_feedback_insert_authenticated"
  on public.product_feedback for insert to authenticated
  with check (true);

create policy "product_feedback_select_authenticated"
  on public.product_feedback for select to authenticated
  using (auth.uid() = user_id or user_id is null);

comment on table public.product_feedback is 'In-app product feedback from real users and testers.';
