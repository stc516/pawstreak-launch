# PawStreak verified product state

Last reconciled: 2026-10-31

## Shipped baseline

- Production: `https://pawstreakapp.com`, deployed from `main`.
- Current main: `6819272` (`Record verified PawStreak release state (#50)`).
- Stack: React/Vite/TypeScript, Supabase, Mapbox, PWA, and Capacitor 8 with iOS and Android projects under bundle ID `com.pawstreak.app`.
- PR #39 removed the duplicate Home recommendation. Production `/demo/app` was browser-checked with one launch hero, no duplicate Today’s Pick card, and no “Best pick right now” copy.
- PR #47 shipped direct Book 1 purchase actions and current Bailey & Omi signup copy. Production series and book routes return 200 with the new content.
- PR #48 preserves the real seven-day product-preview package under `social-assets/weekly/2026-10-31/`. It remains explicitly pending approval and unpublished.
- PR #49 declares foreground location access on iOS and coarse/fine location access on Android, with native-readiness regression coverage.

## Native evidence

- `npm run lint`, `npm run build`, `npm run qa:native`, and `npx cap sync` passed on the Home release candidate.
- An iOS Simulator build compiled the Capacitor packages and produced `App.app`.
- Android Studio’s bundled JDK 21 and the configured Android SDK produced a signed debug APK from current `main` after a fresh `npx cap sync android`: `android/app/build/outputs/apk/debug/app-debug.apk` (16 MB, SHA-256 `9ac564470e223374b3fab78cb846005dd4064b47c251b28424e36ea39cf634af`). Gradle completed 278 tasks successfully; `apksigner` verified the APK’s v2 signature, and `aapt` confirmed package `com.pawstreak.app`, min SDK 24, target SDK 36, and coarse/fine location permissions.
- No Android device or emulator was attached during the build, so installation, launch, permission prompts, push notifications, and the end-to-end adventure loop still require device verification.
- Store submission, signing, TestFlight, Play Console release, and real-device permission flows remain unverified and must not be represented as complete.

## Next executable step

Install the verified debug APK on an Android device or emulator and test launch, foreground location permission, notifications, camera/photos, deep links, and the full adventure-completion loop. Use an authorized authenticated session to verify Home, Plan, Journey, Challenges, Achievements, and saved-memory payoff on mobile, then replace demo-labeled marketing captures with truthful authenticated captures where possible.

## Guardrails

- Preserve adventure-first positioning, current navigation, and Bailey/Meiomi multi-dog behavior.
- Do not fabricate user progress, place details, launch claims, or store readiness.
- Do not publish social posts or submit store builds without the required platform authorization.
