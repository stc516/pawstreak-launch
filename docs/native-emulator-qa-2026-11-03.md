# Native Android emulator QA — 2026-11-03

Device: Android API 35 Google Play ARM64 emulator (`Medium_Phone_API_35`)

Build: local Capacitor debug APK for `com.pawstreak.app`

## Verified

- APK installs and launches without a native crash.
- The branded splash transitions into the Capacitor WebView.
- The current build fails closed with `NATIVE SETUP BLOCKED` when Supabase build variables are absent instead of silently entering local-only app data.
- A cold `com.pawstreak.app://auth/invite?token=qa-cold-fixed` launch routes to `/app/invite?token=qa-cold-fixed` after the JavaScript listener is registered.
- Sending the app to the Android home screen and resuming it preserves the invite route and query.
- A warm `com.pawstreak.app://auth/callback?qa=warm-fixed` intent routes the running app exactly once to `/app?qa=warm-fixed`.
- The post-run Android log contains no `FATAL EXCEPTION`.

## Defect found and fixed

Android WebView 124 treats the dotted custom scheme as a non-special URL. For
`com.pawstreak.app://auth/invite`, it reports an empty hostname and the pathname
`//auth/invite`; Safari and Node report hostname `auth` and pathname `/invite`.
The previous parser therefore treated real Android invite links as ordinary auth
callbacks and sent them to `/app`.

`src/lib/nativeDeepLinks.ts` now normalizes both URL shapes before choosing the
internal route. `qa/native-deep-links.test.ts` preserves both parser variants as
a focused regression.

## Still requires real devices

- Camera capture and Android gallery persistence
- Native share-sheet file handoff to installed social apps
- APNs/FCM notification receipt and tap routing
- OAuth completion through the real browser/account chooser
- Screen lock, thermal, memory, battery, and sustained background behavior
