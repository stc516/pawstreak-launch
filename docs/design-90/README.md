# Issue 90 mobile design review

Draft implementation for https://github.com/stc516/pawstreak-launch/issues/90. Nothing merged, deployed, or submitted to a store. No scheduling changes or spend. Review the screens before approving the visual direction.

## Actual running-app screens

These are Chromium mobile-emulation captures of the real local DEMO app at **375 × 667 CSS pixels**, not mockups, production accounts, physical iPhone Safari, or native-wrapper screenshots. Baselines were captured from `origin/main` before editing. Both dog identities remain visible. No user photos or customer data were used. Multiple-photo QA deliberately uploads the existing PawStreak logo three times through the actual image picker; these are test images, not invented outing photos.

| Screen | Before | After |
| --- | --- | --- |
| Home | [Before](screens/before-home.png) | [After](screens/after-home.png) |
| Active walk | [Before](screens/before-active.png) | [After](screens/after-active.png) |
| No-photo recap | [Before](screens/before-recap.png) | [After](screens/after-recap.png) |

Additional states: [unsupported ZIP](screens/after-home-unsupported.png), [active with photos](screens/after-active-photos.png), [active gallery scrolled](screens/after-active-gallery.png), [recap with photos](screens/after-recap-photos.png), [recap gallery scrolled](screens/after-recap-gallery.png).

## Implementation

- Home: light canvas, explicit area/ZIP link into the existing Explore location selector, both dogs, one Start/Resume action and Explore. One real nearby pick; no curated pick when the existing nearby query returns none. Neighborhood Walk reuses the existing start behavior. Active sessions outrank previous memories.
- Trail Console: flat pine, one tabular elapsed timer, dog row, Finish/Pause in normal document flow, quiet Browse/Cancel. No proof prompt, floating count, checkpoint, photo warning, or sticky footer. Photos and existing recap tags stay optional.
- Field Notes: saved place/date, available duration/type once, dog row, quiet check animation honoring reduced motion, View in Journey, gallery count aligned with heading. Share remains available by choice instead of automatically opening over the saved recap.
- Optional post-save note/photo uses existing `user_notes`, `photo_paths`, JPEG bucket and ownership policies through the frontend client. No schema, policy, bucket configuration, server function, or native-project changes. JPEG resize/validation and the existing three-photo limit are preserved. Save failures retain the draft; optimistic concurrency avoids overwriting a concurrent edit. Original photos are never overwritten.
- Pause was previously screen-local and lost on Browse; it also counted paused time after resuming. Pause now lives with the app session and survives tab navigation/reload in the same browser tab. Resuming adjusts the existing start timestamp; finishing while paused excludes paused time. No persisted adventure schema changes. Cross-device pause synchronization and closing/reopening the browser tab are not covered.

## Reconciliation with #84

Reviewed current draft #84 and its source diff. Applied its relevant principles: active session wins, Resume focuses the same session, unsupported areas start Neighborhood Walk without unrelated curated-place metadata. This branch starts from main; no unrelated date/streak, badge, or workflow commits were merged or cherry-picked. #84 remains independently open; merging either later will require resolving Home overlap deliberately.

## Checks

- `npm run lint`: passed.
- `npm run build`: passed; existing large-bundle warning remains.
- `npm audit --omit=dev --audit-level=high`: 0 vulnerabilities during release-gate attempt.
- `npm run qa:native`: static checks passed; this is not a device build/test.
- `QA_BROWSER_PATH=/usr/bin/chromium npm run qa:trail-console`: **22 checks passed**, including pause/resume and reload, active ID across navigation, no-photo save, optional photo/note persistence after reload, supported/unsupported ZIP via the repository's explicit geocode mock, Cancel, invalid-image recovery, three images, gallery visibility, no horizontal overflow or runtime errors. See [machine-readable results](checks.json).
- Mobile shell guard: all four current navigation screens passed using installed Chromium.
- Existing release suites retain assertions tied to the previous Home/active/share UI. Full release gate is **not green**. Initial run was blocked by the Playwright browser download; using installed Chromium reached the legacy shell suite. Do not interpret the focused pass as complete release approval.

## Remaining verification

Physical iPhone Safari and Capacitor camera roll, native camera, actual browser chrome/safe-area interaction, live geocoding/GPS, authenticated server save/detail editing, RLS ownership rejection, offline recovery, and cross-device hydration need device/account verification. Local QA uses DEMO persistence and geocoder fixtures, not live services. Existing broader UI suites need deliberate reconciliation with the newly approved UX before release.

## Video feasibility — separate follow-up

Short iPhone camera-roll video does **not** work end to end in the current implementation:

1. `ActiveAdventureScreen.tsx` accepts `image/*` and uses capture hint; `nativePhotos.ts` calls Capacitor `Camera.getPhoto` with `CameraSource.Camera`. Neither selects native camera-roll video.
2. `imageUtils.ts` rejects non-image MIME types, decodes with `Image`, resizes to 640px, and encodes JPEG. Video is rejected before persistence.
3. `db/memories.ts` uploads `*.jpg` with `image/jpeg`. Existing migration `019_release_storage_and_invite_hardening.sql` limits the memory bucket to 5 MiB and JPEG/PNG/WebP. This was a repository inspection, not a live-bucket configuration claim.
4. Galleries use `<img>`, with no video player, media-kind metadata, duration/size validation, video upload progress, or clip-specific retry/playback handling.

Smallest separate follow-up: first define a short camera-roll clip size/duration/codec contract and validate on physical iPhone Safari and native wrapper. Then add deliberate media-kind handling, an authorized storage MIME/limit decision, progress/retry and inline `playsInline` controls with a poster. Verify HEVC/MOV compatibility, app backgrounding, failed upload, reload and signed-URL playback before exposing a control. Recording, transcoding, schema/storage/backend changes and video controls were not added in this design pass.
