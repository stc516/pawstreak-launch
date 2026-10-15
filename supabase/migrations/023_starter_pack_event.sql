-- Measure use of the free starter pack without adding personal content to analytics.

alter table public.user_events
  drop constraint if exists user_events_event_name_check;

alter table public.user_events
  add constraint user_events_event_name_check
  check (event_name in (
    'signup',
    'onboarding_complete',
    'adventure_started',
    'adventure_completed',
    'memory_created',
    'early_access_joined',
    'pack_invite_saved',
    'pack_invite_sent',
    'pack_invite_accepted',
    'starter_pack_started'
  ));
