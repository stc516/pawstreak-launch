create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth_key text not null,
  expiration_time bigint,
  timezone text not null default 'UTC',
  morning_enabled boolean not null default true,
  morning_time time not null default '08:00',
  evening_enabled boolean not null default true,
  evening_time time not null default '19:00',
  last_morning_sent_on date,
  last_evening_sent_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;

drop policy if exists "Users can read their push subscriptions" on public.push_subscriptions;
create policy "Users can read their push subscriptions"
  on public.push_subscriptions for select
  to authenticated
  using (auth.uid() = user_id);

-- Writes go through the authenticated push-subscriptions Edge Function so a
-- browser endpoint can safely be reassigned after a user signs out and back in.
revoke insert, update, delete on public.push_subscriptions from anon, authenticated;
grant select on public.push_subscriptions to authenticated;

create index if not exists push_subscriptions_due_idx
  on public.push_subscriptions (morning_enabled, evening_enabled, updated_at);

-- One-time tokens let pg_cron invoke the sender without exposing a permanent
-- service key or webhook secret. The sender consumes each token on use.
create table if not exists public.push_cron_tokens (
  token uuid primary key default gen_random_uuid(),
  expires_at timestamptz not null default now() + interval '5 minutes'
);
revoke all on public.push_cron_tokens from anon, authenticated;

select cron.unschedule(jobid)
from cron.job
where jobname = 'pawstreak-push-reminders';

select cron.schedule(
  'pawstreak-push-reminders',
  '*/15 * * * *',
  $schedule$
    with expired as (
      delete from public.push_cron_tokens where expires_at <= now()
    ), new_token as (
      insert into public.push_cron_tokens default values returning token
    )
    select net.http_post(
      url := 'https://jifspotggsllxmreoqui.supabase.co/functions/v1/send-push-reminders',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-cron-token', token::text
      ),
      body := jsonb_build_object('scheduled_at', now()),
      timeout_milliseconds := 10000
    )
    from new_token;
  $schedule$
);
