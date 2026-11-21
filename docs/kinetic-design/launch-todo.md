# PawStreak launch to-do — reviewed November 21, 2026

Status: **not ready to deploy or submit yet**. The seven-screen redesign is implemented on draft PR #91. This list separates verified source work from live-service and physical-device acceptance. No merge, deployment, submission, spending or schedule activation is authorized by this checklist.

New additions requested after this review: see [feature implementation status and remaining activation steps](launch-feature-status.md). That document supersedes the earlier video/calendar/notification scope below.

## Completed

- [x] Implement selected seven-screen Kinetic theme and capture the actual demo app at 375 × 667 and 393 × 852. See [screens](README.md).
- [x] Previous full production-build release gate passed at the design candidate; save, photos, navigation, pause/resume and unsupported-area checks passed. These remain demo/fixture checks.
- [x] Bundle fonts/icons and add iOS required-reason API manifest.
- [x] Add `release:preflight` and `build:release`: reject missing configuration, private/service-role client credentials, non-HTTPS backend and wrong production site origin without printing credentials. Unit tests exercise pass/fail cases. Structural validation does not authenticate a key.
- [x] Correct stale native runbook: sync existing projects instead of adding them again.
- [x] Revise store copy: remove unverified native-reminder promise, shorten keywords below 100 characters, clarify optional photos/location and reviewer instructions.
- [x] Read connected PawStreak backend: project healthy; migrations 001–020 and later catalog changes recorded; five required Edge Functions active. This verifies presence, not correctness or source parity.
- [x] Verify `memory-photos` is private, allows JPEG/PNG/WebP, and caps files at 5 MiB. Still needs cross-account access tests.
- [x] Found `pawstreak-push-reminders` active every 15 minutes. Paused it under the existing schedules-off instruction; follow-up query verified `active=false`. Do not reactivate it during release preparation.

## Ordered work list

| Priority / status | Task | Owner / directions | Completion evidence |
| --- | --- | --- | --- |
| P0 — needs hardening review | Database function permissions | Engineering: inspect actual function definitions and ACLs in staging. Live catalog confirms 13 SECURITY DEFINER functions executable by anon and authenticated, including `ensure_user_pack(uuid)`. Repo migration 019 revokes PUBLIC but effective grants remain. Restrict internal-only functions explicitly for PUBLIC/anon/authenticated; retain only intended RPC and policy-helper permissions. Check trigger dependencies before changes. No production permission changes made in this review. | Anonymous requests cannot invoke internal mutators; signup, Pack invites, RLS helpers and two-account flows pass; advisors rerun and intentional warnings documented. |
| P0 — blocked on provider setup | iOS login | Engineering + Apple/Supabase owner: implement and configure Sign in with Apple alongside Google, including Apple identifiers/key and provider callback, or resolve an applicable guideline 4.8 exception. Do not ship a decorative/unconfigured Apple button. Never paste private keys in chat or git. | New and returning Apple accounts, private relay email, cancellation, account linking and native cold/warm callback tested on iPhone. |
| P0 — local configuration missing | Configured candidate build | Owner supplies configuration through the build environment/secret manager. Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (publishable key is accepted under this existing variable name), `VITE_SITE_URL=https://pawstreakapp.com`, and a restricted public `VITE_MAPBOX_TOKEN` for maps. Run commands below. No service-role/secret key may use a VITE_ name. | `release:preflight` passes; candidate is built with the intended project; intended map/list behavior verified. Current workspace intentionally fails this check because release values are absent. |
| P0 — not yet tested | Live backend acceptance | Engineering + two dedicated test accounts: run signup/confirmation/reset, Google and Apple sign-in, onboarding, two dogs, optional photos/notes, finish once, reload and sign out/in. Verify second account cannot read/change the first account's photos/memories/profile; exercise Member/Viewer, expired/reused invites and deletion on disposable accounts. | Record candidate SHA, account aliases (no passwords), results and screenshots in `docs/release-checklist.md`. Confirm all data and storage cleanup on deletion. |
| P0 — requires Mac/device | Signed iOS build | Apple owner: use enrolled team, Xcode-supported tooling, `com.pawstreak.app`, unused version/build number; sync configured bundle, open Xcode and archive. Validate signing, icons, launch screen and privacy report. Do not upload until explicitly authorized. | Successful signed archive and local install; record Xcode/iOS versions. This Linux workspace cannot produce a signed Apple archive. |
| P0 — unverified | iPhone acceptance | Tester: use `docs/native-device-qa.md`. Test Safari and native: foreground/background timer, app relaunch, pause/resume, navigation, Cancel, save once, no/multiple photos, camera restore, permission deny/limited access, sharing, keyboard/large text, small screen, offline/save recovery and supported/unsupported ZIP. | Device model/OS, build number, pass/fail and actual screenshots. Browser emulation is not device verification. |
| P1 — needs owner decision/configuration | Password protection | Owner: check Supabase Auth password settings and enable compromised-password protection if available under current plan. Do not purchase an upgrade automatically. Review impact on signup/reset. | Advisor resolved, or availability limitation and accepted alternative recorded. |
| P0 — verify externally | Support/privacy and metadata | Owner: check `https://pawstreakapp.com/privacy` and `/support` on a normal external browser. This environment received HTTP 403; it does not prove a public outage. Confirm contact inbox is monitored. Complete privacy labels/age rating/review contact and reviewer credentials in App Store Connect. Use updated metadata draft. | Public pages load without login; disclosures match actual data/SDK behavior; working reviewer account and build-specific screenshots ready. |
| P1 — separate scope | Native notifications | Engineering: APNs/device-token/backend path is not implemented end-to-end. Do not promise native reminder delivery. Keep all project schedules off. Decide explicitly whether native reminders are deferred for this release or implemented/tested later. | No misleading enabled controls/promises in native build; any later delivery work tested only after authorization. |
| P1 — release integration | Combine reviewed changes | Engineering: review draft #84/successors for date/streak changes and reconcile conflicts without merging unrelated draft work. Rerun complete gate on exact final candidate. | Reviewed diff, passing final SHA and rollback instructions. No merge executed by this task. |
| Last — explicit authorization required | Release | After all P0 items pass, obtain approval to merge/deploy; run configured production canary and rollback checks. Separately obtain TestFlight/App Store upload/submission approval. | Exact deployed/uploaded SHA/build and canary evidence. No current authorization to publish. |

## Commands for the release engineer

On the reviewed branch with dependencies installed using `npm ci`, populate the environment securely. These commands do not deploy:

```bash
npm run qa:release-preflight
npm run release:preflight
npm run qa:release
npm run build:release
npx cap sync ios
# macOS only, after successful configured build/sync:
npx cap open ios
```

`qa:release` may intentionally exercise demo fixtures. `build:release` is the explicit configuration gate for the bundle subsequently synced/archived. Do not use the no-credential QA bundle as a release build. No native project regeneration is needed. If a preview port is busy, set `QA_PREVIEW_PORT` to a free port.

## Review verification

- Preflight unit tests: PASS.
- Actual workspace preflight: correctly BLOCKED by missing release values; no credentials printed.
- Lint, native-readiness checks and ordinary build: PASS.
- Full `qa:release` rerun: PASS on port 4298 after adding preflight unit coverage; audit, lint, native, build, seven screens, walk/photo/core-loop/navigation/share and visual-integrity suites all passed. No app runtime changes in this follow-up.

## Backend review details and limits

Connected project: PawStreak (`jifspotggsllxmreoqui`). Observed functions: `pack-invites`, `pack-invite-accept`, `delete-account`, `push-subscriptions`, `send-push-reminders`. Did not invoke them or inspect customer records. Migration history includes duplicate-named catalog migrations; do not blindly reapply migrations based on names alone.

Supabase security advisor found mutable search_path on `public.set_updated_at`, 13 anon-callable privileged functions (also callable by authenticated), and disabled leaked-password protection. Catalog query independently confirmed effective EXECUTE privileges. The live `ensure_user_pack(uuid)` body was inspected: it inserts/updates Pack ownership and membership for its supplied user ID without an auth.uid ownership check. Do not exercise this mutator on customer data; treat its exposed grant as a release blocker. Warnings alone are not proof that every function is exploitable; authenticated policy helpers may be intentional. Review each function and preserve RLS/trigger dependencies.

Directions: [function search path](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable), [anonymous privileged functions](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable), [authenticated privileged functions](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable), [password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection), [safe client keys](https://supabase.com/docs/guides/getting-started/api-keys), [Apple review guidelines](https://developer.apple.com/app-store/review/guidelines/).

Video remains a separate feature: image-only selection, JPEG persistence and image gallery do not support iPhone camera-roll clips end-to-end. Do not include video claims in launch metadata.
