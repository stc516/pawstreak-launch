# Founder feedback — Phase 0 & 1 implementation plan

**Commit:** `8740678`

## Confirmed bug

`App.tsx` (~L1218) returns only `<ActiveAdventureScreen />` when `state.activeAdventure` is set. That replaces the entire app tree, so six-tab `AppShell` never mounts. `ActiveAdventureScreen` calls `onTabChange` → `setActiveTab`, but tabs cannot render.

## Architecture (before)

| Area | Behavior |
|------|----------|
| **Routing** | Full-app gate on `activeAdventure` |
| **Quick Walk** | `startNeighborhoodWalk()` → `started: true` immediately |
| **Place Go** | `startAdventure()` → `started: false` → ready interstitial |
| **Persistence** | `activeAdventure` in `AppState` → `saveAppState` → `pawstreak:demo` / `pawstreak:app` |
| **Settings** | Demo: local ZIP only; App: Supabase hydrate + `updateProfileLocation` |

## Phase 1 approach

1. Add `activeAdventureView: 'minimized' \| 'focused' \| null` to `AppState`.
2. Remove full-app gate; render shell + tab screens always (when not in other full-screen flows).
3. **Minimized:** global `ActiveAdventureBanner` in `AppShell` footer (started adventures only).
4. **Focused:** fixed overlay with `ActiveAdventureScreen` (ready + active timer UI).
5. Quick Walk / session start → `minimized`; catalog start → `focused` until user taps Start → `minimized`.
6. Finish/Cancel from banner; cancel confirms if photos or >30s elapsed.
7. Reload: infer view from `started` if field missing.

## Out of scope

- Custom/Add Adventure
- Settings UI overhaul
- Visual polish beyond banner layout
