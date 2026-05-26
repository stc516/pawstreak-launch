-- PawStreak demo feedback collection
-- Run in Supabase SQL editor or via Supabase CLI migration.

create table if not exists public.demo_feedback (
  id uuid primary key,
  submitted_at timestamptz not null,
  what_is_it_for text not null default '',
  would_use_with_dog text not null default '',
  what_confused text not null default '',
  what_liked_most text not null default '',
  premium_value text,
  user_agent text,
  page_path text,
  source text not null default 'demo',
  created_at timestamptz not null default now()
);

create index if not exists demo_feedback_submitted_at_idx
  on public.demo_feedback (submitted_at desc);

alter table public.demo_feedback enable row level security;

-- Allow anonymous demo submissions from the public app.
create policy "demo_feedback_insert_anon"
  on public.demo_feedback
  for insert
  to anon
  with check (true);

-- Allow anonymous reads for the internal feedback dashboard (anon key in Vite build).
-- Tighten later with auth or a server-side read path if needed.
create policy "demo_feedback_select_anon"
  on public.demo_feedback
  for select
  to anon
  using (true);

comment on table public.demo_feedback is
  'Centralized demo tester feedback from PawStreak /demo routes.';
