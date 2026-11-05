# PawStreak — design and native evidence ledger (2026-11-05)

## Verification boundary

- **Connected browser**: unavailable; the browser service returned `Browser access requires the originating browser context`. No fresh production screenshots, interactive tests or visually inspected current-device UI are claimed.
- **Historical authentic app-demo assets**: the tracked `social-assets/assets.json` identifies October 31, 2026 captures made at app commit `02dd7f85a145a83c6979a0ee70f2f2e2dc07a228`, 390 × 844, with visible DEMO label. Links below reference **existing captured files**, not recreated UI, photographs or current-state proof.
- **Code review**: checked default-branch components and native/PWA configuration, then proposed a targeted core-loop fix in draft PR #79. Any user-visible design observation from the older screenshots must be reverified in a running build before changing layout.

## Prioritized product work

| Priority | Surface | Grounded finding / why it matters | Evidence | Follow-through |
| --- | --- | --- | --- | --- |
| P0 | Adventure completion → Journey | Active Adventure preselected `Loved every second` and forced it back if every recap was cleared. Saved local memories also added `Loved it` and inferred a mood without consent. | Code: `src/screens/app/ActiveAdventureScreen.tsx`, `src/data/places.ts`, `src/lib/customAdventure.ts`. Historical capture: `social-assets/screenshots/06-save-memory-payoff.png`. | Draft PR #79 makes recaps optional, exposes `aria-pressed`, removes invented sentiment and adds device-sized browser regression. **Not yet visually verified or merged.** |
| P0 | Multi-dog active adventure | Main branch's active banner/review still uses all profile dogs for some visuals even for a selected-dog outing. | Code: `ActiveAdventureScreen.tsx`, `ActiveAdventureBanner.tsx`. No fresh one-dog screenshot. | Draft PR #76 addresses the participation truth issue; reconcile overlap with #79 and rerun Bailey-only, Omi-only, both-dog flows. |
| P0 | Native invite deep link | Android WebView may parse dotted custom schemes unusually, routing an invite incorrectly. | Existing PR #77 includes Android emulator warm-intent details, build and APK checksum **reported by that PR**, not rerun here. | Bring the fix through review, then verify cold/warm links plus OAuth on physical devices. |
| P1 | Home personalization | Current Home has adventure choices; code in main does not yet prioritize actual saved upcoming outings. | `HomeScreen.tsx`; historical captures `social-assets/screenshots/01-adventure-launch-home.png`, `02-todays-pick-card.png`. | Draft PR #62 prioritizes real scheduled outings. Check conflicts with other open Home PRs and verify first-fold layout on 390px, smaller iPhone and Android. |
| P1 | Journey / memory | Real memories should have inviting layouts even when no photo was taken; a decorative scene must never resemble a user's photo. | `JourneyScreen.tsx`, `JourneyMemoryView.tsx`; historical `07-journey-memory.png`. | Draft PR #78 has metadata-driven fallback scene work and reported visual checks; inspect actual before/after images and test accessibility before merge. |
| P1 | Plan + Map | Discovery, directions and supported-region boundaries are essential to getting outside. | Code: `PlanScreen.tsx`, `PlanAdventureMap.tsx`, `GeographicMap.tsx`; historical `03-discover-adventure-mode.png`, `04-adventure-detail.png`. | Real-device map render, tap-target, attribution, permission-denied and unsupported-region checks remain outstanding. Never invent opening hours or rules. |
| P1 | Mobile completion ergonomics | Prior historic demo review flagged a possible footer/checkpoint overlap; the current responsive geometry has not been reproduced here. | Historical `06-save-memory-payoff.png`; CSS and `ActiveAdventureScreen.tsx`. | Reproduce on iPhone SE-class and 390px viewports, test landscape and safe areas before moving sticky controls. |
| P2 | Onboarding | Multi-dog onboarding fields and photo input exist, but step heights, validation errors and permissions remain visually unverified. | Code: `src/screens/onboarding/OnboardingFlow.tsx`. No approved fresh screenshot for this flow. | Capture real device states for one dog, two dogs, skip permissions and error handling. |
| P2 | Challenges / Achievements / Rewards | Real progress, completed challenges and achievements should reward variety, not metric grinding. Current code has these screens/sections. | `MilestonesScreen.tsx`, `AchievementsScreen.tsx`, `challengeEngine.ts`. No current visual screenshots. | Audit first-run and returning-user state on device; preserve earned-vs-locked semantics. |
| P2 | Navigation, typography, illustration and motion | Default-branch `liveProductFeatures.ts` currently lists Home/Plan/Journey/Profile nav, while Challenges, Achievements and Rewards are reached in other flows. This is a source observation, not approval to redesign nav. | `BottomNav.tsx`, `liveProductFeatures.ts`, `src/styles.css`. | Confirm actual approved navigational behavior in fresh running-app captures before layout or branding changes. Audit WCAG contrast, font scaling, reduced motion, 44px+ targets and category-art quality there. |

## Native and PWA readiness — source review only

- **Present in repository**: Capacitor 8 packages; `android/`, `ios/`, `capacitor.config.json` with `com.pawstreak.app`; camera/photos, share, push and native deep-link code; PWA plugin with offline caching; native QA and release-gate scripts.
- **Relevant open work**: Android invite routing PR #77; push foundation PR #61 (APNs/FCM credentials, backend configuration and physical delivery **not** complete); security migration PR #75 (not applied); Android native run notes PR #60.
- **Unverified here**: `npm run lint`, `npm run build`, `npm run qa:release`, `npx cap sync`, Xcode archive/TestFlight signing, Android Play bundle signing, physical cold start, camera kill/recovery, photo persistence, OAuth return, foreground/background timer, GPS/map, push receipt, share-sheet and privacy/account deletion.
- **Release rule**: an existing Android emulator APK or a passing source/configuration check is **not** the same as verified iOS/Android store readiness. Hold native submission until the physical-device QA matrix in `docs/native-device-qa.md` passes.

## Authentic social media boundary

The rolling November 5–11 approval queue is on existing PR #58, not this gameplay PR. Feed/Story assets must resolve to paths listed in `social-assets/assets.json`; preserve the visible DEMO labels, avoid stock/fake UI, invented dog experiences, unverified location facts and direct-publishing promises. All entries remain pending and unpublished.

## Review sequence

1. Review PR #79 and #76 together to resolve the active-adventure component overlap; run the updated finish-review smoke test, lint, build and core-loop P0.
2. Verify live phone-sized screenshots (Home, Plan, Journey, Challenges, Achievements, onboarding, Maps, one-/two-dog adventure and completion), then fix only reproducible layout and accessibility defects.
3. Review PR #77 Android routing, push PR #61 and the real-device QA checklist; complete native device acceptance and signing blockers before store submission.

No published app, social post, native build, production database or merged branch was changed by this ledger.
