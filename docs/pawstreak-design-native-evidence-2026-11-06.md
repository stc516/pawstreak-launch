# PawStreak mobile design and native evidence — 2026-11-06

**Evidence boundary:** The connected remote browser returned `Browser access requires the originating browser context` before live navigation. **No fresh authenticated screen inspection, screenshots, or real-device QA occurred in this run.** Historical linked assets below are October 31 real running-app **DEMO** captures committed to the repository; they are evidence of that capture, not proof of the November 6 build. Do not use stock, generated UI, or fabricated customer stories.

## Priority-ordered product audit

| Priority | Surface | Source and historical screenshot evidence | Concrete next action |
| --- | --- | --- | --- |
| P0 — fixed in this draft | Home while an adventure is active | [October 31 Home DEMO](../social-assets/screenshots/01-adventure-launch-home.png); `src/screens/app/HomeScreen.tsx` and `src/App.tsx` on the parent PR #62. The running-state button said **Return to [location]** while invoking a *new* adventure action; `App.tsx` guards that request with a toast instead of focusing the active session. This is a **code-confirmed bug**, not a screenshot-confirmed November behavior. | This stacked PR switches both stage and primary CTA to the existing `focusActiveAdventure` handler, gives active sessions precedence over today's saved memory, and names the **actual** active location. No fake generic place photo is substituted. New Playwright test awaits execution in CI. |
| P0 — open | Two-dog participant truth | [October 31 ready DEMO](../social-assets/screenshots/05-adventure-ready.png) and [completion DEMO](../social-assets/screenshots/06-save-memory-payoff.png); pending [PR #76](https://github.com/stc516/pawstreak-launch/pull/76) | Verify Bailey-only, Omi-only and both-dog flows; reconcile overlapping finish UI with PR #79 before merge. |
| P0 — open | Finish review and memory integrity | [October 31 finish DEMO](../social-assets/screenshots/06-save-memory-payoff.png), [Journey DEMO](../social-assets/screenshots/07-journey-memory.png); [PR #79](https://github.com/stc516/pawstreak-launch/pull/79) | Verify no forced positive mood, no invented photo, and reachable bottom actions on iPhone SE and Android narrow screens. Sticky-footer overlap from earlier capture needs a live reproduction before layout changes. |
| P1 — open | Personalized Home / honest upcoming plans | [October 31 Home DEMO](../social-assets/screenshots/01-adventure-launch-home.png), [Today’s Pick DEMO](../social-assets/screenshots/02-todays-pick-card.png), parent [PR #62](https://github.com/stc516/pawstreak-launch/pull/62) | Verify real saved outings rank ahead of generic ideas and test date labels in local time. Reduce oversized hero only against new screenshots. |
| P1 — follow-up | Plan/map discovery, active destinations | [Explore DEMO](../social-assets/screenshots/03-discover-adventure-mode.png), [detail DEMO](../social-assets/screenshots/04-adventure-detail.png); `PlanScreen.tsx`, `PlanAdventureMap.tsx` | Verify Mapbox tiles, unsupported-region fallback, deep link to the exact place and pinch/scroll ergonomics on an actual device. Do not invent location rules or source photos. |
| P1 — follow-up | Emotional Journey / user photos | [Journey memory DEMO](../social-assets/screenshots/07-journey-memory.png); `JourneyScreen.tsx`, `JourneyStoryNodeCard.tsx` and `adventureDisplayImage.ts` | Keep photo-optional memories truly photo-free; improve typography, photo cropping and empty-state warmth after fresh screenshot inspection. |
| P2 — follow-up | Challenges and Achievements | `MilestonesScreen.tsx`, `AchievementsScreen.tsx`, `ChallengePathExperience.tsx`; **no fresh or historical capture inspected here** | Test first-step clarity, reward-disclosure interaction, real progress, tap targets and completed node art. Avoid grind mechanics. |
| P2 — follow-up | Onboarding, Rewards and two-dog pack | `OnboardingFlow.tsx`, `ProfileScreen.tsx`, `BottomNav.tsx`, `liveProductFeatures.ts`; **no fresh capture** | Verify two dogs appear through onboarding and pack, and Rewards remain discoverable without redesigning navigation. Respect approved product direction. |
| P2 — visual pass | Premium art, typography, contrast and motion | Existing historical DEMO Home/Explore/Journey links above; **fresh evidence required** | Fix blank-looking category placeholders with approved assets only; measure real small-screen spacing, reduce motion when requested, preserve readable contrast and performance. |

## Native readiness gates (source vs device)

- Source confirms Capacitor 8 packages and `com.pawstreak.app` config, iOS/Android directories, native photo/share/deep-link helpers, release QA scripts and native permissions. Presence of source code **does not prove a passing physical-device build**.
- [Android invite deep-link PR #77](https://github.com/stc516/pawstreak-launch/pull/77) documents an API 35 emulator install and successful invite route. Its changes are **unmerged**; retest after integration.
- Still unverified here: production Supabase redirect configuration, native Google OAuth, APNs/FCM push delivery and permissions, iPhone & Android camera/gallery recoverability, location/maps, accessibility on real devices, device performance, signing/archives, TestFlight and Play internal testing.
- Before any beta, run `npm run qa:release`, `npm run native:sync`, native platform builds and the actual core loop in `docs/native-device-qa.md`. These **were not run in this connector-only environment**.

## Proposed change and merge order

1. Review this stacked Home-resume PR against parent #62. It touches `HomeScreen.tsx` and `App.tsx` only for the product fix; no navigation or brand redesign. It adds a nonproduction QA route, `qa:home-resume`, to the release gate.
2. Reconcile #76 + #79 on the same active-adventure completion file; run the full mobile regression and confirm saved results.
3. Verify #77 Android invite fix on an emulator **and** a physical device after integration.
4. Use fresh, authorized live screenshots to address sticky-footer clipping, images, typography and animation rather than guessing from source.

**Safety:** No merge, deployment, production backend mutation, social posting, app-store action or spend authorized/performed. Historical social captures retain visible DEMO labels.
