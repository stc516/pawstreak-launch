# Kinetic Stitch implementation — issue #90

This replaces the first visual pass with Stephen's selected seven-screen Kinetic Sun-Drenched design direction. The earlier implementation remains recoverable at `55c4895` and in `docs/design-90`.

## Implemented

- Outfit typography, coral actions, warm white canvas, white rounded cards, amber details, restrained lime status, and charcoal walk console.
- Compact Today composition: current area/ZIP, headline panel, both dogs, one Start/Resume action, Explore, one existing nearby pick, earned progress below. Unsupported areas use the existing Neighborhood Walk behavior.
- Active walk: one labeled timer in a dark inset panel, pack cards, reachable Finish/Pause, quiet Browse/Cancel, optional photos/details and a gallery count beside its heading. Background/navigation/pause behavior is preserved.
- Saved recap: white editorial card, a real uploaded photo when available or a deliberate no-photo composition, stats once, optional notes/photos, explicit share and Journey actions. No invented emotional recap is inserted when the user skips details.
- Explore, existing Training flow, Journey feed, Pack/settings, and the minimized walk banner share the selected palette and compact hierarchy. Home has an explicit Training entry into the existing working flow.
- Typography and icon assets are bundled locally for native/offline rendering. Marketing's existing fonts are also bundled to preserve its typography without Google Fonts/CDN dependence.
- iOS required-reason API manifest added for Preferences and Filesystem, with Xcode Resources membership. Native shell/PWA colors aligned. No backend/schema/storage changes.

## What is deliberately adapted from the export

The export is a visual reference, not production data. No stock photos are assigned to Bailey/Meiomi or destinations; user-provided photos continue to render. No fictional readiness, calories, GPS map, health/collar, live weather, off-leash legality, XP or community counts were shipped. Existing four-tab navigation remains; Training is accessed from Home and Explore. The real training program flow replaces the export's unimplemented audio/whistle hub. No new recordings, video controls or media infrastructure.

Existing Home draft #84 was rechecked. This branch preserves active-session priority and supported/unsupported-location handling without merging its unrelated date/streak work. Reconcile those separate changes before combining the drafts.

## Actual app captures

These are local Chromium mobile-emulation screenshots of the running **DEMO app**, not generated mockups, physical iPhone screenshots, or App Store marketing assets. No production account data was used. Empty photo areas represent the real no-photo state.

| Screen | 375 × 667 | 393 × 852 |
| --- | --- | --- |
| Today | [Small](screens/375-home.png) | [Standard](screens/393-home.png) |
| Explore | [Small](screens/375-explore.png) | [Standard](screens/393-explore.png) |
| Training | [Small](screens/375-training.png) | [Standard](screens/393-training.png) |
| Journey | [Small](screens/375-journey.png) | [Standard](screens/393-journey.png) |
| Pack | [Small](screens/375-pack.png) | [Standard](screens/393-pack.png) |
| Active walk | [Small](screens/375-active.png) | [Standard](screens/393-active.png) |
| No-photo recap | [Small](screens/375-recap-no-photo.png) | [Standard](screens/393-recap-no-photo.png) |

`qa:kinetic` asserts containment, local Outfit font, coral action color, readable Training title, single timer and complete no-photo recap across both viewports. `qa:trail-console` covers no/multiple photos, save-once, pause/resume across navigation/reload, Cancel, invalid-image recovery, optional photo/note persistence, and supported/unsupported ZIPs using deterministic location fixtures.

Release tests were updated to use the approved UI's controls, explicit share action and photo-optional recap. Save integrity, share file payloads, mobile touch targets, authentic imagery, account gating and navigation checks remain. The release runner now accepts `QA_PREVIEW_PORT` and requires that port, avoiding Vite's silent port fallback.

See [release handoff](release-handoff.md) for native and production blockers. Nothing merged, deployed, submitted, scheduled, or purchased.

Updated launch review: [ordered to-do list with owners and directions](launch-todo.md).
