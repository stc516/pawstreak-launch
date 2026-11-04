# PawStreak product design and native evidence — November 4, 2026

> **Evidence boundary:** Live browser access was requested first but returned `Browser access requires the originating browser context`. This is a **repository-and-archived-capture review**, not a fresh authenticated visual audit. No new screenshots, videos, native builds, or production measurements were taken. Do not present earlier captures as today's production state.

## Grounded capture set

The tracked `social-assets/assets.json` records seven 390×844 in-app DEMO screenshots and one actual app-demo video generated **October 31, 2026** from source commit `02dd7f85a145a83c6979a0ee70f2f2e2dc07a228`. The visible DEMO labels must stay on all public previews. Capture provenance: [assets.json](../social-assets/assets.json) and [capture instructions](../social-assets/README.md).

| Product surface | Historical screenshot / source | What is and is not established |
| --- | --- | --- |
| Today/Home | [Real app-demo Home PNG](../social-assets/screenshots/01-adventure-launch-home.png) | Historical first fold. Current layout, personalized plans and signed-in state need fresh capture. |
| Explore/Plan | [Real app-demo Explore PNG](../social-assets/screenshots/03-discover-adventure-mode.png) | Historical discovery view; live Mapbox availability, GPS permissions and map markers **not** proved. |
| Destination detail | [Real app-demo detail PNG](../social-assets/screenshots/04-adventure-detail.png) | Historical selected place; no current hours/leash/amenities claim. |
| Adventure ready | [Real app-demo ready PNG](../social-assets/screenshots/05-adventure-ready.png) | Historical pre-start confirmation; selected-dog correctness must be exercised with one dog and two dogs. |
| Adventure completion | [Real app-demo memory payoff PNG](../social-assets/screenshots/06-save-memory-payoff.png) | Historical payoff; previous review flagged a possible sticky-footer/recap overlap. Reproduce at 320/375/390px before a CSS change. |
| Journey/share | [Real app-demo saved memory PNG](../social-assets/screenshots/07-journey-memory.png) | Historical demo memory; does not prove persisted user photos, sharing to Instagram or cross-device continuity. |
| Full product loop | [Actual app-demo video](../social-assets/videos/pawstreak-demo-flow.webm) | Historical preview flow, not a customer recording. |
| Challenges, Achievements/Rewards, onboarding, maps | **No matching screenshot in this authenticated-demo capture manifest.** | Code inspected, but visual and real-device claims require captures. |

No stock imagery or synthetic interfaces were used for this audit.

## Ranked design and reliability priorities

| Rank | Severity / surface | Evidence | Action and acceptance |
| --- | --- | --- | --- |
| 1 | **P0 — selected-dog truth through active adventure** | Current `ActiveAdventureScreen.tsx` displayed *all* profile dog avatars and `getDisplayDogsAreOutLabel(state)` even when the adventure carried one `selectedDogIds`; both active hero and memory checkpoint were affected. | **Implemented in this draft PR:** select avatars/status/ready/payoff from the actual outing IDs, preserve legacy `dogId` and unspecific historical outings, handle retired dog IDs without inventing participation. New 6-case unit suite awaits execution. |
| 2 | **P0 — finish/payoff touch and scroll safety** | [Oct 31 completion PNG](../social-assets/screenshots/06-save-memory-payoff.png) and prior design review report potential bottom sticky-action obstruction; CSS uses `.adv-action-footer { position: sticky; bottom: 0; }`. | Fresh iPhone-size screenshot at recap and photo end; test keyboard/open picker, scroll to first/last chip, and 44px touch targets. Do **not** remove sticky CTA blindly. |
| 3 | **P1 — Home gets the next meaningful action** | [Oct 31 Home PNG](../social-assets/screenshots/01-adventure-launch-home.png), Home source, and open [PR #62](https://github.com/stc516/pawstreak-launch/pull/62). | First fold should show one personalized outing or one clear Quick Walk/Explore action, without fabricated weekend plans. Resolve PR #59/#57/#62 interactions before merging. |
| 4 | **P1 — frictionless, truthful place discovery** | [Oct 31 Explore PNG](../social-assets/screenshots/03-discover-adventure-mode.png), `PlanScreen.tsx`, `GeographicMap.tsx`. | Clear distance/rules provenance, map fallback list on tile failure, no unsupported off-leash assertions, and readable mobile cards. Distinct map/device test required. |
| 5 | **P1 — memory emotional payoff** | [Oct 31 Journey PNG](../social-assets/screenshots/07-journey-memory.png), `JourneyScreen.tsx`. | Real dog photos optional; saved place, dates, recap and selected dogs are truthful. Ensure photo-free adventure still produces an authentic keepsake. |
| 6 | **P1 — native launch blockers** | `capacitor.config.json`, `package.json`, `vite.config.ts`, [PR #60](https://github.com/stc516/pawstreak-launch/pull/60), [PR #61](https://github.com/stc516/pawstreak-launch/pull/61). | Capacitor 8/PWA code present; physical iOS/Android camera/gallery, OAuth callbacks, background resume, APNs/FCM receipt, persistent photos, map performance and signing remain unverified in this run. PR #60 **reports** an Android API 35 emulator test; do not substitute that for physical-device signoff. |
| 7 | **P2 — challenges/achievements, onboarding and accessibility** | `MilestonesScreen.tsx`, `AchievementsScreen.tsx`, `OnboardingFlow.tsx`, `liveProductFeatures.ts`; **no screenshots for these in current capture set**. | Get fresh, annotated viewport captures of these surfaces; verify one/two-dog onboarding, unlocked states, reduced motion, contrast and 320px layout before redesign. |
| 8 | **P2 — visual system** | Heritage/terracotta tokens and approved category art in `src/styles.css` and existing assets. | Unify typography, distinctive category art, contrast and measured motion within established direction; no made-up destination imagery or new navigation architecture. |

### Current navigation gate — requires design reconciliation, not an impulsive change

`src/lib/liveProductFeatures.ts` currently exposes only **Today, Explore, Journey and Pack** in the bottom navigation; Challenges, Achievements and Rewards have screen code and may be reachable through secondary paths. This differs from earlier five-tab approved direction described in the project brief. Preserve the existing running implementation until fresh screenshots and the definitive approved navigation are reconciled. This PR makes **no navigation changes**.

### Native and release boundary

- The native source includes Capacitor iOS/Android project folders, app ID `com.pawstreak.app`, camera, filesystem, app/deep-link and push plugins, and a Vite PWA configuration.
- Store signing/TestFlight, Apple developer entitlements, Supabase native redirect allowlist, APNs/FCM credentials and production migration for PR #61 are **not** verified in this run.
- No branch was merged; no production deployment, app-store submission, reminder send, public social post or expenditure was authorized.
- Fresh browser/device capture is blocked specifically by the missing **originating connected browser context**. GitHub source and historical captures remain accessible.

## Next measurable verification

1. Re-run the core loop with only Bailey selected while Omi is also registered: the hero, review portraits, ready label, and save-memory copy must mention/show only Bailey. Repeat for Omi-only and both dogs.
2. Run `npx tsx --test qa/active-adventure-participants.test.ts` plus `npm run lint && npm run build` on this PR; run `npm run qa:release` from an environment with Playwright browsers.
3. In an authorized connected browser, capture Home, Plan/map, Journey, Challenges, Rewards, onboarding, active review and completion at 390×844 and 320px width. Record source commit/time and distinguish demo from production.
4. Use actual Android and iOS devices before claiming beta readiness, especially native photos, auth, push, map fallback and app backgrounding.

## Social guardrails

[Rolling approved-demo queue](../social-assets/weekly/2026-10-31/approval-packet.md) extends through November 10 on [PR #58](https://github.com/stc516/pawstreak-launch/pull/58), covering **November 4–10** with seven pending unpublished concepts and four hashtags maximum. Use only actual app screenshots, verified footage, approved Bailey/Meiomi photos and real fact-checked places. No stock, fake UI, invented activity data or unverified features.
