# Phase 0 — Architecture inspection (commit `8740678`)

## Active adventure (before Phase 1 fix)

| Component | Role |
|-----------|------|
| `App.tsx` L1218 | **Bug:** `if (state.activeAdventure) return <ActiveAdventureScreen />` — blocks `AppShell` and all tabs |
| `ActiveAdventureScreen` | Full-screen ready + timer UI; bottom nav called `setActiveTab` but shell never mounted |
| `startNeighborhoodWalk` | `started: true` immediately (Quick Walk) |
| `startAdventure` | `started: false` → Adventure ready interstitial |
| `finishAdventure` | Creates `JourneyEntry` via `createJourneyEntryFromPlace` / neighborhood; clears adventure |
| `storage.ts` | `activeAdventure` normalized and saved in `pawstreak:demo` / `pawstreak:app` |

## App shell & nav

| Component | Role |
|-----------|------|
| `AppShell` | Six-tab footer via `BottomNav`; demo pill; no adventure banner (pre-Phase 1) |
| `setActiveTab` | Updates `activeTab` only; does not clear `activeAdventure` |

## Settings / Profile sources

| Field | Demo (`/demo/app`) | App (`/app`) |
|-------|-------------------|--------------|
| Storage key | `pawstreak:demo` | `pawstreak:app` |
| Onboarding | Seeded / `demoEntry` | `profiles.onboarding_complete` + auth gate |
| ZIP | `AppState` local | `profiles` + `updateProfileLocation` on Apply |
| Dogs | Seeded Bailey+Omi | `dogs` table via `hydrateProductionState` |
| Settings copy | Demo disclaimer, sign-out disabled | Email + Supabase when configured |

## Why founder may see “wrong” settings

1. Visiting `/demo/app` vs `/app` (different keys and seed data).
2. Stale `localStorage` merged on load.
3. Supabase hydration overwriting local ZIP after sign-in.
4. Demo UI copy interpreted as account state.
5. `demoBaseState` reset when `demoEntry === 'onboarding'` && `onboardingComplete`.

Run `node qa/settings-profile-audit.mjs` for a live snapshot.
