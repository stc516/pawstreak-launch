# Remove retired photos and fabricated maps

Scope: `stc516/pawstreak-launch`, based on main `a3b4906`. No old-repository changes. No user data, uploaded photos, or live database records deleted.

## Root causes

- Explore substituted decorative terrain and arbitrary screen-position pins when Mapbox failed. The old core-loop test counted those pins as success.
- The legacy Journey map component used clamped percentage positions and displaced markers. It is no longer mounted by current navigation, but its old screenshot/video exports were still bundled into Content Studio.
- The shared destination image resolver supplied sample images to places without photography. The memory resolver could borrow another outing's photo or use a sample destination image for a memory with no photo.
- Marketing/onboarding previews, challenges, achievements, and training reused the same sample-image library.
- Historical social captures hid their demo label. These assets must not represent the current product or real activity.
- Screenshot inspection found the map canvas growing to 544px inside a 358px mobile card because of the old aspect-ratio rule.

## Changes

- Delete all 18 public sample JPGs and the unused sample-image/legacy challenge-detail modules.
- No generated or stock photo substitutions. A photo-free memory stays photo-free. Preserve its own uploaded photos. Cards without destination photography use a clearly labeled neutral state.
- Use a shared real-coordinate Mapbox renderer. Loading errors and missing tokens become an explicitly labeled list of actual places. Add retry; never render fabricated terrain or decorative geographic pins.
- Remove percentage/clamped marker helpers. Keep known coordinates unchanged; omit unmapped memories from the map without dropping them from the memory list.
- Constrain map canvas width to its mobile card. Keep full selected-place names below the map.
- Derive Journey summary numbers from saved entries, not stale 47/22-style stored counters.
- Exclude all historical social screenshots/videos from the app bundle. Content Studio only loads assets in `social-assets/approved/` with explicit `approved-current` manifest status. Keep historical files as reference archives rather than destroying prior work.
- Keep demo labels visible in future reference captures. Remove retired image references from the seed SQL; historic applied migrations are not rewritten and no database reseed is performed.

## Verification

`npm run qa:release` now includes `qa:visual-integrity`, which checks image/coordinate/count behavior and captures a mobile screen sweep. `node qa/geographic-map.mjs` separately requires a build with a real Mapbox token: it verifies a successful style response, rendered canvas, place selection, mobile canvas containment, aborted-request fallback, and retry recovery. No production account writes are needed.

### Screen coverage

| Surface | Coverage |
| --- | --- |
| Landing, Start, account entry, onboarding entry | Browser screenshots + retired-media DOM scan |
| Today, Explore, selected place/details, map unavailable selection | Browser screenshots + DOM scan; separate real-Mapbox success/failure/retry test |
| Add Adventure, monthly planning choices/frequency/timing/result | Browser screenshots + DOM scan |
| Training selection/schedule/result/session | Browser screenshots + DOM scan |
| Journey populated/empty, memory without photo, saved memory | Browser screenshots + DOM scan |
| Active adventure, completion/share card | Browser screenshots + DOM scan; core-loop test uploads a valid photo and verifies PNG share payload |
| Challenges/detail, Achievements/detail | Browser screenshots + DOM scan; release smoke verifies a user photo remains contained in a completed node |
| Community preview, Pack/invite, Settings | Browser screenshots + DOM scan |
| Privacy, Terms, Support, deletion, Early Access | Browser screenshots + DOM scan |
| Internal Content Studio/feedback | Access gates tested; asset-catalog exclusion verified directly. Authenticated admin UI not exercised. |
| Splash, DemoLauncher, later onboarding steps | Source audit: no sample-photo or geographic-fallback renderers. Full later-step onboarding not rerun in this visual-specific sweep. |
| Legacy JourneyMapView, JourneyLevelDetailView, CuratedPlanFlow, disabled PresetPlanOverlay, demo-only CommunityComposeOverlay | Source audit. Legacy Journey map rebuilt on the shared renderer, without exposing a new route. Conditional/unreachable overlays not claimed as browser-tested. |

Evidence is generated under `artifacts/qa/release-gate/` and `artifacts/qa/geographic-map/` (gitignored). Demo screenshots are QA evidence, not approved marketing assets.

## Delivery boundaries

- A web deployment does not update an already-installed Capacitor binary. Native testing needs the new build synced and installed through the existing native release process.
- Buffer drafts are external copies. Removing old assets from the app cannot remove an attachment already uploaded to Buffer. No Buffer scheduling or publishing is performed by this change.
- Mapbox availability remains dependent on valid deployment configuration/network access. The fallback is intentionally useful and honest, not presented as a working map.
- React review: hooks remain unconditional, derived map bounds are memoized, keyboard-accessible selection/retry buttons expose state, and historical media no longer enters the eager bundle.
