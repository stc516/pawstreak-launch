# Native and backend release handoff — 2026-11-21

All work is on draft PR #91. No deployment, migration on a hosted project, store upload, submission, merge, or schedule activation was performed. This document supersedes earlier foreground-only GPS / proposed-SQL / Apple-not-implemented notes.

## Implemented source

- Seven-screen Kinetic design, existing core walk/save/Journey behavior and unsupported-area fallback.
- Uploaded or chosen dog avatars, optional saved-recap video, calendar .ics native handoff, device-local daily reminders, and saved GPS traces (previous commit).
- Native background GPS plugin, explicit location opt-in and iOS background permission descriptions; web remains foreground-only. Pause/finish/cancel stops the watcher, including startup races. Failed stop retries once and surfaces instructions. Android requests notification permission for the foreground service. Force-quitting the app can interrupt tracking; no continuous force-quit guarantee.
- Apple sign-in UI and native identity-token exchange with cryptographic nonce, plus web OAuth. Gated OFF by default. Native entitlement wired. **Apple account token revocation on deletion still needs implementation/provider verification before enabling this flag.** Current account deletion remains for existing providers.
- Optional remote iOS APNs path: device registration callbacks, owner-authenticated token/preferences endpoint, private token table, opt-out/sign-out cleanup, timezone-aware delivery and expired-token removal. Client and sender flags default OFF. Remote mode replaces local reminders to avoid duplicate scheduling. Android continues device-local reminders; no FCM implementation.
- APNs sender claims each daily reminder before sending (at-most-once attempt). Network failure can skip that reminder. It does not guarantee delivery, ignores Focus settings only as allowed by iOS, and does not send critical alerts. Automatic token-rotation re-registration on app launch remains a follow-up; enabling/updating settings registers the current token.
- CLI-generated migrations harden internal RPC permissions, preserve authenticated invite/RLS helper access, fix existing PL/pgSQL Pack variable ambiguity, add route/video constraints/private storage and native push token isolation. Private quota helper avoids recursive storage RLS.

## Ordered release checklist

1. Review/apply the three `20261121*` migrations on an isolated Supabase staging project. Local PostgreSQL fixtures verified SQL/RLS, not the complete hosted Auth/Storage service. Exercise real two-account signup/invite/access, media HTTP upload/download/delete, signed URL expiration, upload limits and delete-account cleanup.
2. Deploy reviewed `delete-account`, `native-push-tokens`, and `send-push-reminders` source to staging only when deployment is authorized. Existing production reminder cron remains paused.
3. Configure Apple Developer identifiers and provisioning: bundle `com.pawstreak.app`, Sign in with Apple, Push Notifications, background location. Debug APNs entitlement is development; Release production. Confirm entitlement matches signed provisioning.
4. Configure Supabase Apple provider, redirect allowlist and Apple credentials. Implement/test Apple grant revocation in account deletion before `VITE_APPLE_AUTH_ENABLED=true`. Never put Apple private keys or service-role keys in Vite variables.
5. Configure server-only `APNS_KEY_ID`, `APPLE_TEAM_ID`, `APNS_PRIVATE_KEY`, `APNS_ENVIRONMENT` (sandbox for development; production for TestFlight/App Store), and `NATIVE_PUSH_ENABLED=true`. Set client `VITE_NATIVE_REMOTE_PUSH_ENABLED=true` only for the matching tested environment. Use separate environments to avoid routing sandbox tokens to production. Test foreground/background/locked-device delivery, denial, timezones, changing times, opt-outs, logout, reinstall/token rotation and account deletion. Scheduler activation is a separate authorized release step; none activated here. Keep local reminder mode if remote delivery is not accepted.
6. Enable `VITE_MEMORY_VIDEO_ENABLED` and `VITE_WALK_ROUTE_ENABLED` after backend acceptance. Test short real iPhone MOV/HEVC selection, metadata decoding, upload, playback, reload, removal and limits. Unsupported codecs fail visibly; no transcoding. Test GPS locked-screen walking, pause/resume, cancellation, app resume, OS interruption, permission downgrade and battery use. Verify routes stop after finish/logout.
7. Use a Mac/Xcode signed build and physical iPhone. This Linux environment cannot certify native compilation, entitlement acceptance, App Store signing, APNs delivery or native camera-roll/share-sheet behavior.
8. Complete App Store privacy answers for precise route/photo/video data, support/privacy URLs, age/content declarations, real production screenshots without demo identities, review login/instructions, and account deletion acceptance. Run `npm run build:release` with actual public configuration, then native sync and signed archive. Submit only when authorized.

## Verification commands and limits

- `npm run qa:database`: isolated PostgreSQL 17, network disabled, disposable fixture users; permissions/signup/invites/viewer and stranger isolation, route/path constraints, private video metadata ownership, push token access. Docker container destroyed afterward. Does not test hosted HTTP or actual video bytes.
- `npm run qa:launch-features-unit`: calendar formatting/injection, reminder permissions and opt-outs, GPS sampling, asynchronous native watcher cleanup and failed-stop reporting, Apple nonce hash/randomness.
- `npm run qa:release`: production web build and established mobile/core-loop suites. Native readiness is a static check, not an Xcode build.
- `npm run qa:launch-features`: browser fixtures for avatars, video lifecycle, GPS and calendar download. Mocked browser geolocation and synthetic video do not prove iPhone APIs.
- Edge functions checked with Deno; actual APNs transport remains unverified until credentials/device are available.

No collar integration, social posting, health metrics, readiness scores, or fictional activity is included.

## Results recorded for this change

PASS: full `qa:release` on production web build (port 4301); feature browser suite; feature/native-driver unit suite; isolated PostgreSQL migration/RLS suite; Deno type checks for both push Edge Functions; lint/build and Capacitor sync. Final native sign-out cleanup was followed by another lint/build/sync. No real notifications were sent. No hosted staging or physical-iPhone test was performed.
