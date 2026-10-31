# PawStreak verified product state

Last reconciled: 2026-10-31

## Shipped baseline

- Production: `https://pawstreakapp.com`, deployed from `main`.
- Current main: `f135291` (`Declare native location permissions (#49)`).
- Stack: React/Vite/TypeScript, Supabase, Mapbox, PWA, and Capacitor 8 with iOS and Android projects under bundle ID `com.pawstreak.app`.
- PR #39 removed the duplicate Home recommendation. Production `/demo/app` was browser-checked with one launch hero, no duplicate Today’s Pick card, and no “Best pick right now” copy.
- PR #47 shipped direct Book 1 purchase actions and current Bailey & Omi signup copy. Production series and book routes return 200 with the new content.
- PR #48 preserves the real seven-day product-preview package under `social-assets/weekly/2026-10-31/`. It remains explicitly pending approval and unpublished.
- PR #49 declares foreground location access on iOS and coarse/fine location access on Android, with native-readiness regression coverage.

## Native evidence

- `npm run lint`, `npm run build`, `npm run qa:native`, and `npx cap sync` passed on the Home release candidate.
- An iOS Simulator build compiled the Capacitor packages and produced `App.app`.
- Android Studio’s bundled JDK 21 and the configured Android SDK resolve the earlier Java/toolchain blocker; the debug assembly remains unverified until the long-running Gradle process exits successfully.
- Store submission, signing, TestFlight, Play Console release, and real-device permission flows remain unverified and must not be represented as complete.

## Next executable step

Use an authorized authenticated session to verify Home, Plan, Journey, Challenges, Achievements, and the full adventure-completion loop on mobile, then replace demo-labeled marketing captures with truthful authenticated captures where possible. In parallel, finish one clean Android debug build from current `main` and record the artifact path and device result.

## Guardrails

- Preserve adventure-first positioning, current navigation, and Bailey/Meiomi multi-dog behavior.
- Do not fabricate user progress, place details, launch claims, or store readiness.
- Do not publish social posts or submit store builds without the required platform authorization.
