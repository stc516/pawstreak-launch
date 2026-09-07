-- Bridge public PawStreak Places slugs to the app's stable catalog IDs.
-- This lets the website use cleaner/shared slugs without breaking deep links
-- into existing adventures, memories, or the bundled app catalog.

alter table public.places
  add column if not exists app_place_id text;

update public.places
set app_place_id = id
where app_place_id is null;

create index if not exists places_app_place_id_idx
  on public.places(app_place_id);
