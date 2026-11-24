# Kinetic release handoff

## Release scope

Source changes are on draft PR #91, branch `design/trail-console-90`, based on main `62e443c`. No deployment or App Store submission has occurred. The first visual pass is recoverable at `55c4895`.

## Automated verification

- `npm run qa:kinetic`: PASS, seven screens at 375 × 667 and 393 × 852, Chromium mobile emulation.
- `npm run qa:trail-console`: PASS, 22 walk/photo/location/persistence checks.
- `npm run qa:release`: PASS against a fresh production build on port 4296, including audit, lint, native readiness, build, seven-screen checks, all walk/core-loop/mobile/share suites and visual integrity. Final copy-only button-label/cleanup changes were followed by lint/build, native sync and another seven-screen check.
- `npx cap sync ios`: PASS for generated asset/plugin synchronization. This does not compile or sign an iOS app.
- Privacy manifest: valid plist, two required-reason API categories, included in Xcode Resources. Reasons follow installed Capacitor Preferences/Filesystem documentation (CA92.1 and C617.1). This is not a substitute for final privacy-label/data-collection review.

## Still required before deployment / App Store submission

1. **Real backend canary:** configure the intended Supabase and optional Mapbox credentials; validate sign-in, memory/photo save and edits after sign-out/reload, two-account isolation and account deletion against the actual backend. Current browser tests use demo fixtures, not authenticated customer data.
2. **iOS login requirement:** Google sign-in exists; no equivalent privacy-preserving login is implemented. Resolve Apple App Review guideline 4.8 (normally Sign in with Apple, including Apple/Supabase provider configuration) before submission. No auth model was changed during this visual pass.
3. **Signed Apple build:** use macOS/Xcode, select the developer team and signing assets, confirm bundle ID `com.pawstreak.app`, choose unused version/build numbers, create an archive and validate it in App Store Connect. No macOS, signing credentials or physical device is available in this workspace.
4. **Real-device acceptance:** iPhone Safari and native WebView, smaller iPhone, safe areas, keyboard/large text, foreground/background timer, location allow/deny, camera/library allow/deny, app-killed camera restoration, real share sheet and OAuth deep links. TestFlight first; no claim that emulation substitutes for these checks.
5. **Store metadata:** real screenshots of this exact signed build, support/privacy URLs, review account, final age rating, privacy labels, permissions and SDK privacy report. Existing `docs/native-app-store-metadata.md` remains a draft and must match enabled functionality.
6. **Native notifications:** APNs/device-token delivery remains a separate existing native launch gap; browser reminders are not evidence of native push readiness. Keep project automations disabled.
7. **Existing release checklist:** complete `docs/release-checklist.md` against the production candidate, including rollback/canary and service-worker upgrade. Do not deploy a no-credential QA build as a configured production release.

Apple sources checked 2026-11-21: https://developer.apple.com/app-store/review/guidelines/ (2.1 app completeness/on-device verification, 2.3 accurate screenshots/metadata, 4.8 login services, 5.1.1 privacy/account deletion).

## Video remains separate

The current picker/validator accepts images, persistence creates JPEG photos, gallery uses `<img>`, and repository storage policies are image-only. iPhone camera-roll video is not supported end to end. Define clip codec/size/duration and storage authorization, then add media-kind persistence and inline playback with device tests as a separate approved change. No recording, backend or schema changes in this branch.
