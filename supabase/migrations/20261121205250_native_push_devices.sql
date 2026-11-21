create table public.native_push_devices (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 token text not null unique check(token ~ '^[a-f0-9]{64,200}$'),
 environment text not null check(environment in ('production','sandbox')),
 timezone text not null default 'UTC',
 morning_enabled boolean not null default false,
 morning_time time not null default '08:00',
 evening_enabled boolean not null default false,
 evening_time time not null default '19:00',
 last_morning_sent_on date,
 last_evening_sent_on date,
 updated_at timestamptz not null default now()
);
alter table public.native_push_devices enable row level security;
revoke all on public.native_push_devices from public,anon,authenticated;
grant select on public.native_push_devices to authenticated;
grant all on public.native_push_devices to service_role;
create policy native_push_read_own on public.native_push_devices for select to authenticated using(user_id=(select auth.uid()));
create index native_push_devices_user_idx on public.native_push_devices(user_id);
