# Phase 2 plan — Custom / Add Adventure

**Baseline:** `82885cd` (Phase 1 global active adventure banner + resume flow)  
**Status:** Planning only — no implementation in this document.

## Constraints (non-negotiable)

- Do not modify Phase 1 unless regression.
- Do not remove or simplify existing workflows (Quick Walk, Quick Adventure, Build My Month, Plan Go, challenge starts, training flows).
- Keep 6-tab nav; Profile not in nav; Settings via gear.
- Training stays on Home + Profile only — not Challenges.
- Achievements tab separate from Challenges.
- Community stays Coming Soon — no fake feed.
- No Google Calendar.

---

## 1. Architecture inspection (committed `82885cd`)

### Adventure lifecycle today

| Step | Mechanism | Files |
|------|-----------|--------|
| Start catalog outing | `startAdventure(placeId)` → `ActiveAdventure` (`started: false`) → focused ready overlay | `App.tsx`, `createActiveAdventure` in `demo.ts` |
| Quick Walk | `startNeighborhoodWalk()` → `placeId: neighborhood-walk`, `started: true` → banner | `App.tsx`, `places.ts` |
| Active session UI | Phase 1: `activeAdventureView` `minimized` (banner) / `focused` (`ActiveAdventureScreen`) | `activeAdventureSession.ts`, `ActiveAdventureBanner.tsx`, `App.tsx` |
| Finish | `finishAdventure(payload)` → `createJourneyEntryFromPlace` or `createJourneyEntryFromNeighborhoodWalk` → `applyRealUserContent` | `App.tsx`, `places.ts`, `productionState.ts` |
| Production finish | Requires `getPlaceById(activeAdventure.placeId)` + Supabase `createAdventure` / `createMemory` | `appDataSync.ts`, `db/adventures.ts`, `db/memories.ts` |

### Journey model

```ts
// src/data/demo.ts — JourneyEntry (simplified)
{
  id, placeId?, place, date, occurredAt?,
  tags[], photoUrls?, durationLabel?, recapLabels?,
  emotionalLine?, favoriteMoment?, memoryMood?, dogTags?
}
```

Memories are **derived from finished adventures**, not a separate user-authored entity. Custom adventures must produce a valid `JourneyEntry` that existing Journey UI can render (`JourneyStoryPath`, `JourneyMemoryView`, map pins from `lat/lng` only when present on catalog places).

### Challenges integration (read-only engines)

- `challengeEngine.ts` scores **joined** challenges from `journeyEntries` (demo includes seeded IDs; app filters `DEMO_SEEDED_JOURNEY_ENTRY_IDS`).
- Metrics: `beach_adventures`, `total_adventures`, `neighborhood_walks`, `distinct_places`, `holiday_adventures`.
- **Custom entries should count toward:** `total_adventures`, `distinct_places` (key = `placeId ?? place` → user title), `memories_with_photo` / `total_memories` (achievements).
- **Should not auto-count toward:** `beach_adventures`, `neighborhood_walks`, `holiday_adventures` unless explicitly tagged (product decision: default **no**).

### Achievements integration

- `achievementEngine.ts` uses same `journeyEntries` list + category heuristics (`isBeachEntry`, `isTrailEntry`, etc.) from `placeId` / `tags`.
- Custom memories with `placeId: custom-adventure` and tags `['Custom', ...]` count for **`total_adventures`**, **`total_memories`**, **`memories_with_photo`**; not beach/trail unless mis-tagged.

### Persistence today

| Mode | Storage key | Adventure | Journey |
|------|-------------|-----------|---------|
| Demo | `pawstreak:demo` | `activeAdventure`, `activeAdventureView`, `adventurePhotos` in `AppState` | `journeyEntries[]` |
| App | `pawstreak:app` + Supabase | `adventures` row (`place_id` FK → `places`) | `memories` row (`place_id` FK → `places`) |

**Blocker for custom in production:** both `adventures.place_id` and `memories.place_id` are `NOT NULL` and reference `public.places(id)`. `finishAdventure` production path bails if `getPlaceById(placeId)` is missing.

**Existing sentinel pattern:** `neighborhood-walk` in `places.ts` + catalog — same approach recommended for `custom-adventure`.

### Save for later

**Not implemented.** No `scheduledAdventures` in `AppState`, no `status: scheduled` on adventures (only `active | completed | cancelled`).

---

## 2. Product definition — Custom / Add Adventure

User-created outing with:

| Field | Required | Notes |
|-------|----------|--------|
| **Title** | Yes | Primary label everywhere (banner, Journey card, memory detail). Trim, min 2 chars, max ~80. |
| **Dog(s)** | Yes (implicit) | Default: active dog or full pack via `selectedDogIds` (match existing adventure dog UX). |
| **Location** | No | Free-text label only in v2 (no map pin / geocode required). |
| **Notes** | No | Pre-adventure or merged into memory copy on finish. |
| **Photo** | No | Optional at create **or** during active adventure (reuse `adventurePhotos` slots). |
| **Start now** | One of two CTAs | Uses Phase 1 banner + finish flow. |
| **Save for later** | One of two CTAs | No timer; appears in Journey as “planned” until started or deleted. |

---

## 3. Recommended data model

### 3.1 Sentinel catalog place (production FK compatibility)

Add canonical place id **`custom-adventure`** (mirror `neighborhood-walk`):

- `src/data/places.ts` — `CUSTOM_ADVENTURE_PLACE` / `CUSTOM_ADVENTURE_PLACE_ID`
- `supabase/seed/places.sql` — one row, category `Custom`, no lat/lng required for map
- Journey `placeId` = `custom-adventure`, display `place` = **user title**

User-facing location stored separately (not in `places.name`).

### 3.2 Client types

**`CustomAdventureDraft`** (form state, not persisted as-is):

```ts
interface CustomAdventureDraft {
  title: string                    // required
  locationLabel?: string           // optional
  notes?: string                   // optional
  photoDataUrl?: string            // optional (or defer to adventurePhotos)
  selectedDogIds: string[]         // required, length >= 1
  mode: 'start_now' | 'save_later'
}
```

**Extend `ActiveAdventure`** (minimal):

```ts
type AdventureSource = 'catalog' | 'neighborhood' | 'custom'

interface ActiveAdventure {
  // existing fields…
  source: AdventureSource
  customTitle?: string             // required when source === 'custom'
  customLocationLabel?: string
  userNotes?: string
}
```

**`ScheduledAdventure`** (save for later — new):

```ts
interface ScheduledAdventure {
  id: string
  title: string
  locationLabel?: string
  notes?: string
  photoDataUrl?: string
  selectedDogIds: string[]
  createdAt: string
  scheduledFor?: string            // optional ISO; v2 can default null = “anytime”
}
```

**`AppState` additions:**

```ts
scheduledAdventures: ScheduledAdventure[]
showAddAdventureFlow: boolean      // or step-based flow like buildMyMonthFlowStep
addAdventureDraft: CustomAdventureDraft
```

### 3.3 Journey entry factory

**New:** `createJourneyEntryFromCustom(dogs, input)` in `places.ts` or `lib/customAdventure.ts`:

- `placeId: 'custom-adventure'`
- `place: input.title`
- `magicLine`: notes snippet or generic (“Your adventure”)
- `tags: ['Custom', ...(locationLabel ? ['Location'] : [])]`
- `dogTags` from selected dogs (not always full pack if user subset — see dog selection)
- Optional `photoUrls`, `recapLabels` on finish (same as catalog finish)

**Extend `finishAdventure` branch:**

```text
if (activeAdventure.source === 'custom' || placeId === CUSTOM_ADVENTURE_PLACE_ID)
  → createJourneyEntryFromCustom(...)
else if (neighborhood) …
else if (place) …
```

Production: `finishAdventureOnServer` must accept custom place + set `memories.place_name = title`, `adventures.notes` = user notes.

---

## 4. UX flow

### 4.1 Entry points (v2)

| Entry | Rationale |
|-------|-----------|
| **Journey** — primary CTA | “Add your own adventure” in hero or empty state; aligns with memory timeline. |
| **Home** — secondary text button | Below Quick Walk / Build My Month — does not compete with hero. |
| **Not** Plan map, Challenges, Community, Training | Avoid scope creep and fake discovery. |

### 4.2 Form flow (`AddAdventureFlow` overlay)

Single full-screen flow (pattern: `BuildMyMonthFlow` / `TrainingProgramFlow`), **not** a new tab.

```
[Back]
Add your adventure

Title *          [________________]
Dogs             [Bailey + Omi ▼]   (multi-select or pack toggle)
Location (opt.)  [________________]
Notes (opt.)     [________________]
Photo (opt.)     [Add photo]

[Start now]      [Save for later]
```

Validation: block submit without title; block without at least one dog.

### 4.3 Start now (integrates Phase 1)

1. Validate draft → build `ActiveAdventure`:
   - `placeId: custom-adventure`
   - `location: title` (banner title line)
   - `source: 'custom'`
   - `started: true`, `startedAt: now` (same as Quick Walk — immediate banner)
   - `activeAdventureView: 'minimized'`
   - `selectedDogIds` from draft
   - `userNotes` / `customLocationLabel` preserved for finish copy
2. Optional photo → `adventurePhotos` via existing `addAdventurePhoto`.
3. User browses app with banner; Resume → focused screen (recap chips + finish).
4. Finish → Journey memory via `createJourneyEntryFromCustom`; clear adventure; toast unchanged.

**Guard:** if `activeAdventure` already active → toast “Finish or cancel current adventure first” (do not stack).

### 4.4 Save for later

1. Append to `scheduledAdventures` with generated id + `createdAt`.
2. Close flow; stay on current tab.
3. **Journey UI** — new section “Planned adventures” above or within story path:
   - Card: title, location snippet, dogs, **Start** + **Delete**
   - **Start** → same as Start now (moves to `activeAdventure`, remove from scheduled list)
4. No `activeAdventure` until Start.

### 4.5 Memory detail / map

- **Memory detail:** show user title as primary; location as subtitle if provided; notes in body if not already in `magicLine`.
- **Journey map:** custom memories without lat/lng — omit pin or use region centroid (v2: **omit pin** unless location geocoded later).

---

## 5. Journey integration

| Concern | Plan |
|---------|------|
| Timeline card | Reuse `JourneyStoryPath` node styling; `place` = title |
| Filters | Existing filters by tag — add `Custom` tag for filter chip (optional v2.1) |
| Map overlay | Pins only for entries with resolvable coordinates; custom without coords excluded |
| Go again | Optional v2.1: “Go again” on custom memory → prefill Add Adventure with title/notes |
| Monthly plan | **No tie** — `advanceMonthlyPlanAfterAdventure` matches catalog `place.id`; custom does not advance plan weeks |

---

## 6. Challenges / Achievements integration

### Challenges (no schema change)

| Metric | Custom finished memory |
|--------|-------------------------|
| `total_adventures` | Yes |
| `distinct_places` | Yes — distinct key `custom-adventure` + title fallback `entry.place` |
| `neighborhood_walks` | No |
| `beach_adventures` | No |
| `holiday_adventures` | No (unless date heuristic added later) |

Challenge path nodes that call `onStartAdventure(placeId)` remain catalog-only — **unchanged**.

### Achievements (no new badges in v2)

| Metric kinds | Custom impact |
|--------------|----------------|
| `total_adventures`, `total_memories`, `memories_with_photo` | Yes |
| Beach / trail / snow / coffee / neighborhood | No |
| Demo cap | `DEMO_EARNED_ACHIEVEMENT_IDS` unchanged; custom memories still respect allowlist |

**Product decision log:** document in QA that custom adventures are honest activity, not auto-beach.

---

## 7. Persistence

### 7.1 Demo (`/demo/app`)

| Data | Storage |
|------|---------|
| `scheduledAdventures` | `AppState` → `pawstreak:demo` via existing `saveAppState` |
| Active custom adventure | `activeAdventure` + `source` + custom fields + `activeAdventureView` |
| Finished memory | `journeyEntries` prepend (same as today) |
| Reload | Scheduled list + active adventure restore (same rules as Phase 1) |

Normalize in `storage.ts`: default `scheduledAdventures: []`, migrate missing `activeAdventure.source` to `'catalog' | 'neighborhood'` from `placeId`.

### 7.2 Production (`/app`)

| Data | Storage |
|------|---------|
| Active adventure | `adventures` row with `place_id = 'custom-adventure'`, `notes` = user notes + optional location prefix |
| Memory | `memories` with `place_id = 'custom-adventure'`, **`place_name` = user title** (already a column) |
| Photos | Existing `memory-photos` bucket paths |
| Scheduled | **New table** (recommended) — see migrations |

**Hydration:** extend `hydrateProductionState` to fetch `scheduled_adventures` + map to `ScheduledAdventure[]`.

**Local cache:** `pawstreak:app` continues to mirror hydrated state; custom scheduled rows must round-trip after reload.

---

## 8. Supabase migration needs

### Required (v2)

**Migration `013_custom_adventure.sql` (proposed):**

1. **Seed place**

```sql
insert into public.places (id, name, city, region, category, tags, …)
values ('custom-adventure', 'Custom adventure', '', 'Your adventures', 'Custom', array['Custom'], …)
on conflict (id) do nothing;
```

2. **`adventures` extensions**

```sql
alter table public.adventures
  add column if not exists source text not null default 'catalog'
    check (source in ('catalog', 'neighborhood', 'custom')),
  add column if not exists custom_title text,
  add column if not exists custom_location_label text;
-- Relax nothing on place_id; keep FK to custom-adventure sentinel
```

3. **`memories` extensions (optional but useful)**

```sql
alter table public.memories
  add column if not exists custom_location_label text,
  add column if not exists user_notes text;
-- place_name already stores display title
```

4. **New table `scheduled_adventures`**

```sql
create table public.scheduled_adventures (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  dog_ids uuid[] not null default '{}',
  title text not null,
  location_label text not null default '',
  notes text not null default '',
  photo_path text,
  scheduled_for timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- RLS: same pattern as adventures (select/insert/update/delete own)
```

### Not required for v2

- Nullable `place_id` on memories/adventures (sentinel avoids breaking FKs and `finishAdventureOnServer`).
- Geocoding / Mapbox for custom location.
- Community posts from custom adventures.

### App / DB code touch list (implementation phase)

| Layer | Files |
|-------|--------|
| Types | `src/data/demo.ts`, `src/lib/db/types.ts` |
| Places sentinel | `src/data/places.ts`, `supabase/seed/places.sql` |
| Journey factory | `src/lib/customAdventure.ts` (new), `src/data/places.ts` |
| Finish routing | `src/App.tsx`, `src/lib/appDataSync.ts` |
| DB | `src/lib/db/adventures.ts`, `src/lib/db/memories.ts`, new `scheduledAdventures.ts` |
| UI | `src/screens/overlays/AddAdventureFlow.tsx` (new), `JourneyScreen.tsx`, `HomeScreen.tsx` (secondary CTA) |
| Storage | `src/lib/storage.ts` |
| Engines | `src/lib/challengeEngine.ts` (verify only), `src/lib/achievementEngine.ts` (verify only) |

---

## 9. Implementation phases (suggested order)

| Phase | Scope | Exit criteria |
|-------|--------|----------------|
| **2a** | Sentinel place + `createJourneyEntryFromCustom` + Start now (demo only) | Custom finish appears in Journey; challenges `total_adventures` increments |
| **2b** | `AddAdventureFlow` UI + Home/Journey entry + active-adventure guards | Form validation; banner/finish parity with Quick Walk |
| **2c** | Save for later + Journey planned section (demo persistence) | Reload keeps scheduled; Start promotes to active |
| **2d** | Supabase migrations + `/app` CRUD + hydration | Signed-in user can create/finish/schedule custom adventures |
| **2e** | QA scripts + regression | `qa/custom-adventure.mjs`; extend `active-adventure-global.mjs` guard |

---

## 10. QA plan (for implementation)

| ID | Scenario |
|----|----------|
| CA-1 | Title required — empty blocked |
| CA-2 | Start now → banner + all 6 tabs |
| CA-3 | Finish → Journey card with user title; adventure cleared |
| CA-4 | Custom counts for joined challenge `total_adventures` |
| CA-5 | Custom does not increment beach-only challenge |
| CA-6 | Save for later → Journey planned; no banner until Start |
| CA-7 | Delete planned adventure |
| CA-8 | Reload demo — planned + active custom persist |
| CA-9 | `/app` signed-in — Supabase rows created |
| CA-10 | Phase 1 regression — Quick Walk, monthly plan Go unchanged |
| CA-11 | Community Coming Soon only |
| CA-12 | Cannot start custom while adventure active |

---

## 11. Explicit non-goals (v2)

- Custom adventure on Plan map as a pin.
- Linking custom outings to monthly plan week places.
- Training program integration.
- Community posts / pack feed.
- Multi-place custom routes.
- Editing custom memory title after save (v2.1).

---

## 12. Open product decisions (founder sign-off)

1. **Dog selection:** pack-only (current default) vs per-dog multi-select on form?
2. **Save for later placement:** Journey-only section vs also Home reminder card?
3. **Distinct places challenge:** does every custom title count as distinct place, or all share `custom-adventure` id only (one distinct)?
4. **Production without sign-in:** block Add Adventure on `/app` until auth (same as other persistence)?

---

**Next step:** Founder approves §12 decisions → implement 2a→2e without changing Phase 1 behavior.
