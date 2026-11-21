# Requested launch additions — implementation status

**Update 2026-11-21:** See [native/backend handoff](native-release-handoff.md) for the current implementation and release gates. The earlier snapshot below describes the prior commit; its foreground-only native GPS, proposed-only migrations and unimplemented Apple/APNs notes are superseded. No hosted changes were applied.

Requested: camera-roll video, notifications, calendar export, phone GPS routes, and uploaded/chosen dog avatars. Excluded: social feed/comments/likes/messages, readiness/calorie scores and fictional data. Collar integration is explicitly deferred at Stephen’s request. No collar or health-tracking integration is included.

## Implemented on the draft branch

- **Dog avatars:** Pack → edit a dog → upload a photo or choose a built-in dog/paw avatar. Individual multi-dog choice, visible save/error states, account-backed photo path and emoji persistence. Original onboarding photo remains available. Privacy text and iOS permission descriptions include the new optional media and route features. Choosing an avatar clears the displayed photo; it does not assign a stock dog identity.
- **Daily native notifications:** Capacitor Local Notifications schedules morning/evening reminders on the device after permission and explicit opt-in. Users choose times, disable either reminder, or disable reminders. Signing out/deleting the account cancels these notifications. These are local device notifications, not APNs remote push. No server cron is needed for this native path. Permissions, Focus settings, OS battery policy and device time settings affect delivery; actual iPhone delivery remains unverified.
- **Calendar export:** Existing dated outings/training/month/challenge export now uses native file sharing on phones and .ics download on web, with error handling and honest import instructions. UTC event dates, text escaping and UTF-8 line folding. A share/download result does not prove the event was imported. Suggested monthly/challenge dates must be reviewed. The old placeholder preset-reminder overlay stays disabled.
- **Camera-roll video:** Saved recap → choose one clip up to 30 seconds/25 MB; inline controls, removal and reload persistence. MP4/MOV/WebM accepted only when device metadata can be decoded; no transcoding or recording. Demo blobs use IndexedDB, not localStorage. Production uses a separate private owner-only bucket and memory attachment; configured limit is ten stored clips per owner (not a billing guarantee). Private videos are not automatically shared with Pack members.
- **Phone GPS:** explicit opt-in during a walk, accurate samples only, pause/resume, stop, capped route data, and saved GPS trace. This implementation is foreground-only: recording stops when PawStreak is hidden/phone locked. Gaps are not drawn as continuous tracked travel. It is not continuous background tracking or a navigation map. Background recording still requires native work and physical-device validation before it can be promised.

## Deployment order / remaining blockers

1. Resolve the already-documented backend permissions issue and test owner/isolation behavior on staging.
2. Generate a migration with `supabase migration new walk_routes_and_memory_video`, then use [proposed SQL](sql/walk-routes-and-video.proposed.sql). The CLI in this workspace failed because it attempts to write to a read-only home configuration directory; no migration filename was fabricated and no remote DDL was executed. The proposed SQL has NOT been validated on a staging database.
3. Test schema constraints, private upload/read/delete, unauthorized owner and Pack-member access, size/type rejection, and retry behavior. Clip duration is checked by the client; the storage bucket enforces size/type. Add server-side media probing if adversarial duration enforcement is needed.
4. Deploy the updated `delete-account` function together with the video bucket and test deletion of both image and video storage on disposable accounts. No deployment performed here.
5. Set `VITE_MEMORY_VIDEO_ENABLED=true` and `VITE_WALK_ROUTE_ENABLED=true` only after those checks. Defaults remain off in production so the current backend continues to work. Demo exposes the implementations for review.
6. Native: rebuild configured app, `npx cap sync ios`, sign/install on iPhone. Check notification allow/deny, both reminder times, edit/disable/sign-out, timezone changes and taps. Check real MOV/HEVC camera-roll playback/upload, limited photo access and native .ics handoff/import. Ordinary browser tests do not prove native delivery or playback.
7. Decide whether foreground-only GPS meets launch scope. If not, finish native background-location permissions/lifecycle/battery behavior and route-gap recovery first; update privacy disclosures for stored precise routes.
8. Remote APNs push remains separate from local daily reminders. Web push still needs its configured keys and authorized backend scheduler activation/delivery test. The existing backend cron remains paused; no ChatGPT automation was created.
9. Complete Apple login, signed build, live two-account acceptance and store metadata from [launch to-do](launch-todo.md). No merge/deploy/upload/submission performed.

## Verification

- `qa:launch-features-unit`: passed calendar UTC/text escaping/UTF-8 folding; GPS accuracy and sample throttling; native reminder permission-denied and opt-out behavior with a mocked native driver.
- `qa:launch-features` against the running dev app: passed uploaded/chosen avatar persistence and replacement, GPS opt-in/pause/saved points, video selection/playback/reload/removal/demo-reset cleanup, invalid type and over-30-second rejection, and real .ics download.
- `qa:kinetic`: passed all seven screens at 375 × 667 and 393 × 852.
- Lint/build and iOS asset/plugin sync passed. No signed native compilation or physical device is available here.
- Full `qa:release`: PASS on the fixed production build (port 4300), including audit, lint, native checks, feature unit tests, seven-screen/mobile/walk/save/share suites and visual integrity. Final privacy-copy/demo-reset changes were followed by lint, feature browser tests, build and native sync.

Review captures: [avatar editing](feature-screens/avatar-photo.png), [video recap](feature-screens/recap-video.png), [route control](feature-screens/active-route-control.png). These are actual browser captures using synthetic test photo/video and demo data, not personal-account or physical-iPhone captures. Do not use them as App Store screenshots.

To reproduce new feature tests, run the Vite dev server and set `QA_BASE_URL` to its actual port, then `npm run qa:launch-features`. This test requires Chromium and ffmpeg and generates its own short/over-limit video fixtures. It tests demo IndexedDB persistence, not production storage authorization.
