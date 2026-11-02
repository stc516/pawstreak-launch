# PawStreak design evidence & release priorities — November 2, 2026

## Evidence boundary

**No fresh live visual audit was possible in this run.** The connected browser explicitly returned
`Browser access requires the originating browser context`. The local execution container
also cannot reach the public app. Do not confuse the versioned demo captures below with a
new authenticated production/device session. No production runtime, mobile simulator, or
real-device screenshots were obtained or certified.

**Historical visual evidence inspected:** The repository's `social-assets/assets.json`
records a real running `/demo/app` Playwright capture at commit `02dd7f85` on
2026-10-31 06:27 UTC (390×844 viewport; **DEMO** label visible). These are appropriate as
clearly marked product-preview evidence only, *not* real-user activity, device tests, or
confirmation of current production styling.

| Screen/flow | Inspected screenshot | Specific observation |
| --- | --- | --- |
| Home | [Oct 31 Home preview](../social-assets/screenshots/01-adventure-launch-home.png) | Multiple substantial cards compete in the first scroll; the headline and memory stage dominate a small handset. The screenshot is a seeded demo, not proof that a user saved a real memory. |
| Plan / Explore | [Oct 31 Explore preview](../social-assets/screenshots/03-discover-adventure-mode.png) | Clear start CTA and place detail, but the curated photo area is empty. Preserve a truthful empty-art state rather than add stock photos. |
| Place details | [Oct 31 adventure detail](../social-assets/screenshots/04-adventure-detail.png) | Useful decision fields (rules, why go, best window, location) are present; current leash and hour claims still need real-place verification. |
| Adventure completion | [Oct 31 save checkpoint](../social-assets/screenshots/06-save-memory-payoff.png) | Photo action is prominent; bottom action dock and memory-checkpoint headline compete at phone height. Verify at actual device safe areas before adjusting layout. |
| Journey/share payoff | [Oct 31 saved-memory share](../social-assets/screenshots/07-journey-memory.png) | The share card represents an adventure with zero photos using branding instead of a false photo. This can become more emotional only when the user supplies real photos. |
| Maps / Challenges / rewards | [Earlier Journey map](../qa/evidence/background-map-plan-polish/05-journey-map.png) · [Earlier Milestones](../qa/evidence/background-map-plan-polish/08-milestones-readable-achievements.png) | Historical May 22 screenshots illustrate older navigation and seeded counts, **not** current behavior; do not publish or use as current creative. |

## Prioritized design/product findings

1. **P0 — Home must not falsely show yesterday as today.** Code inspection found
   `src/screens/app/HomeScreen.tsx` accepted the *persisted display label*
   `entry.date === 'Today'` before checking `entry.occurredAt`. All genuine saved
   outings are constructed with `date: 'Today'` plus an ISO timestamp, so after midnight
   a stale outing could continue to show **Memory saved today** and replace today's
   discovery hero. This PR selects the newest timestamped outing only when its time is
   within today's local calendar day; deliberately undated seeded demo memories work
   **only** in DEMO mode. Add a targeted seven-case regression to the release gate.
2. **P0 — Truthful adventure context and native device QA.** PRs #51/#57 separately
   correct misleading hero-place metadata and blanket leash claims. Do not duplicate
   or supersede those reviews. The Capacitor projects and native QA commands exist, but
   there is no fresh real-device evidence for camera restore, location permissions,
   OAuth/deep-link cold start, background/resume, push, or Android/iOS release builds.
3. **P1 — Make first-fold adventure decisions clearer.** The captured Home has strong
   expressive typography and a highly prominent hero, but the competing memory,
   badges, actions, and cards need a fresh authenticated mobile review before any
   structural CSS changes. Keep one clear primary action, a small secondary one, and
   authentic pack identity.
4. **P1 — Improve Journey photos and legibility.** The inspected share screenshot
   contains an honest no-photo branded placeholder. A future improvement should
   make a *real saved photo* the strongest emotional element while keeping empty
   memories meaningful and preserving two-dog attribution. No fake user photos.
5. **P2 — Polish Explore illustration and map affordances.** The saved Explore screen
   has prominent empty image space. Premium category illustrations, predictable
   pin/card selection, and accessible contrast need new current screenshots and
   device checks; don't swap in stock imagery to satisfy the illustration request.
6. **P2 — Retention via meaningful challenges, not feeds.** Code reviewed for
   `MilestonesScreen`, `AchievementsScreen`, `OnboardingFlow`,
   `JourneyScreen`, `PlanScreen`, and `ActiveAdventureScreen`.
   No fresh visual sign-off is available for those screens. Continue with genuine
   completed adventures, user photos, and achievements derived from recorded outings.

## Implementation, verification & source guardrails

- **In this PR:** `src/lib/todaysMemory.ts`, Home integration,
  `qa/home-today-memory.mjs` and release-gate invocation.
- **Run:** `npm run qa:today-memory`, `npm run lint`, `npm run build`,
  `npm run qa:native`, then `npm run qa:release` where Playwright/browser access exists.
- **Native:** `capacitor.config.json`, `ios/App`, `android/app`, and
  `docs/native-device-qa.md` inspected. Native project presence is not an
  iOS/Android device build. External certificate/entitlement/provider/permission
  validation still requires the authorized native environment.
- **Social:** Use only the reviewed current `social-assets/screenshots`,
  `stories`, and `videos` from the actual app with a visible DEMO qualifier
  where appropriate. Older captures containing seeded social stats or retired
  UI are not approved social material. `social-assets/approved` remains an
  explicit approval gate; never infer that a file is ready to publish merely
  because it is committed. The seven-day buffer in PR #58 remains pending approval.
- **Publication:** No merges, production deployments, App Store submissions, media
  publication, or spending are authorized by this report.
