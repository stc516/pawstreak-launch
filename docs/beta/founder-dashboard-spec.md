# Founder Dashboard Spec

Purpose: measure whether PawStreak helps dog parents complete the Discover → Go → Remember → Progress loop.

This is a beta measurement spec, not a new feature mandate. Start with the simplest possible internal view or query export.

## North star for beta

Repeated better dog days.

Proxy metric: users who complete a second adventure or Quick Walk within 7 days of signup.

## Core funnel

Track by user and by date:

1. Signup
2. Onboarding completed
3. Dog profile created
4. Location set
5. First adventure viewed
6. First adventure started
7. First adventure completed
8. Memory saved
9. Photo attached
10. Share action tapped
11. Second adventure started
12. Second memory saved
13. 7-day retained user

## Existing event names to use first

Known current events include:

- `signup`
- `onboarding_complete`
- `adventure_started`
- `adventure_completed`
- `memory_created`
- `early_access_joined`
- `pack_invite_saved`
- `pack_invite_sent`
- `pack_invite_accepted`

Potential missing events to add later only if needed:

- `adventure_viewed`
- `share_started`
- `share_completed`
- `push_enabled`
- `push_received`
- `push_opened`
- `second_adventure_started`

## Dashboard cards

### 1. Beta health

- Total beta users
- New users today
- Onboarding completion rate
- Adventure start rate
- Memory save rate
- Second adventure rate

### 2. Core loop funnel

Show counts and conversion:

Signup → onboarding → adventure started → adventure completed → memory saved → second adventure

### 3. First-session friction

- Users signed up but did not complete onboarding
- Users onboarded but did not start adventure
- Users started but did not complete
- Users completed but no memory/photo

### 4. Retention

- D1 return
- D3 return
- D7 return
- Second adventure within 7 days

### 5. Sharing

- Share taps
- Share card opens
- Instagram share attempts
- Share failures if logged

### 6. Push/reminders

- Push enabled users
- Morning enabled
- Evening enabled
- Push subscription count
- Push open count once available

### 7. Qualitative flags

Manual fields for each tester:

- Tester name
- Device
- Dog name
- City
- Status: invited / signed up / onboarded / completed / retained / churned
- Biggest issue
- Best quote
- Screenshot link

## Minimal SQL checks

These are example queries for Supabase SQL editor.

### Event counts by day

```sql
select
  date_trunc('day', created_at) as day,
  event_name,
  count(*) as events
from public.user_events
group by 1, 2
order by 1 desc, 2;
```

### Users who saved a memory

```sql
select
  user_id,
  count(*) as memories_saved,
  min(occurred_at) as first_memory_at,
  max(occurred_at) as latest_memory_at
from public.memories
group by user_id
order by latest_memory_at desc;
```

### Second adventure / memory signal

```sql
select
  user_id,
  count(*) as memory_count
from public.memories
group by user_id
having count(*) >= 2
order by memory_count desc;
```

### Push subscriptions

```sql
select
  count(*) as total,
  count(*) filter (where morning_enabled) as morning_enabled,
  count(*) filter (where evening_enabled) as evening_enabled,
  max(updated_at) as newest_update
from public.push_subscriptions;
```

## Beta decision thresholds

Proceed to wider beta if:

- 70%+ invited users can create account + dog.
- 50%+ onboarded users start an adventure or Quick Walk.
- 30%+ onboarded users save a memory.
- At least 20% complete a second adventure within 7 days.
- No unresolved P0.
- No more than one unresolved P1 affecting the core loop.

Pause invites if:

- Any persistence bug appears.
- Multiple users cannot finish an adventure.
- Photos disappear after reload.
- Users do not understand what PawStreak is for.
