# PawStreak release checklist

Record the candidate SHA, tester, date, device/OS, production URL, and evidence link for each run.

This checklist is the freeze gate for a 10–25 person beta. Do not mark an item complete because code exists; mark it complete only after the behavior is verified against the release candidate or production canary noted above.

Status labels when reporting readiness:

- `PASS` — verified on the release candidate or production canary.
- `FAIL` — verified broken or incomplete.
- `UNVERIFIED` — not checked yet.
- `BLOCKED` — cannot be checked until credentials, environment access, or an external dependency is available.

## Automated blockers

- [ ] `npm audit --omit=dev --audit-level=high`
- [ ] `npm run qa:release`
- [ ] No unexpected bundle-size increase
- [ ] Clean `git status` for the release commit
- [ ] Release candidate SHA recorded before production canary

## Production backend

- [ ] Migrations 001–020 confirmed in production, including `020_push_notifications.sql`
- [ ] Required Edge Functions deployed: `pack-invites`, `pack-invite-accept`, `delete-account`, `push-subscriptions`, and `send-push-reminders`
- [ ] Push cron job `pawstreak-push-reminders` exists in production and calls the production `send-push-reminders` function URL
- [ ] Web Push VAPID env vars configured in Supabase: `WEB_PUSH_VAPID_PUBLIC_KEY`, `WEB_PUSH_VAPID_PRIVATE_KEY`, and `WEB_PUSH_VAPID_SUBJECT`
- [ ] Web Push public key configured in the web app environment as `VITE_WEB_PUSH_PUBLIC_KEY`
- [ ] Production web app has Supabase env vars configured; `/app` must not operate as a local-only product in production
- [ ] Trusted staff has `app_metadata.internal=true`; other accounts cannot read feedback
- [ ] Private photo bucket, MIME/size limits, and quotas verified
- [ ] Supabase backup/restore and rollback owner confirmed
- [ ] Mapbox token restrictions and Resend domain authentication verified

## Two-account critical path

- [ ] Email signup, confirmation, sign-in, sign-out, password reset
- [ ] Google OAuth
- [ ] Onboarding with dog and photo persists after reload
- [ ] Location update persists
- [ ] Start, background/resume, finish adventure; memory/photo/streak persist
- [ ] Saved memory and photo persist after reload, sign-out, and sign-in
- [ ] Second test account cannot read the first account's dog, memories, Pack, push subscriptions, or photos
- [ ] Dog edit and planned-adventure deletion persist
- [ ] Member and Viewer Pack invites behave correctly
- [ ] Invalid, reused, and expired invite tokens fail safely
- [ ] Account deletion removes Auth, database records, storage photos, push subscriptions, and local session

## Notifications and reminders

- [ ] Browser/PWA clearly explains why notifications help without forcing calendar integration
- [ ] Notification permission allow/deny flows are understandable on iOS and Android
- [ ] iOS installed PWA can subscribe successfully
- [ ] Android Chrome can subscribe successfully
- [ ] Morning reminder can be triggered and received
- [ ] Evening reminder can be triggered and received
- [ ] Tapping a notification opens `/app`
- [ ] Disabling reminders updates the production subscription row and prevents future sends
- [ ] Missing/invalid push configuration fails honestly in UI and logs, without trapping the user

## Mobile and PWA

- [ ] Current iPhone Safari and one smaller/older iPhone
- [ ] Current Android Chrome
- [ ] Camera and location allow/deny flows
- [ ] Keyboard, safe areas, large text, back navigation, slow network
- [ ] Install on iOS and Android; icon, splash, standalone launch
- [ ] Offline shell and honest failed-write behavior
- [ ] Service-worker update from the previous production version

## Product loop and emotional payoff

- [ ] First-run experience explains Discover → Go → Remember → Progress without requiring founder explanation
- [ ] Today leads to one obvious next adventure or Quick Walk
- [ ] Explore/adventure detail makes choosing an outing feel exciting and clear
- [ ] Active adventure can be backgrounded/resumed without losing the session
- [ ] Finish flow clearly says the adventure was saved
- [ ] Photo save failures are communicated honestly with a retry or clear recovery path
- [ ] Journey makes the user feel, “I’m giving my dog a really great life”
- [ ] Instagram/share action works via native share sheet or fallback, with copy that does not imply unavailable direct publishing
- [ ] No fake/demo numbers, fake activity, or fabricated social/community content appears in production app mode

## Canary and freeze

- [ ] Deploy the recorded SHA and repeat the critical path on `pawstreakapp.com`
- [ ] Monitoring receives a deliberate test error with release SHA
- [ ] Rollback tested
- [ ] 10–25-user canary runs for at least 24 hours without P0/P1 issues
- [ ] Privacy/Terms text approved by the founder and legal counsel
- [ ] Freeze, tag the exact SHA, and accept only blocker fixes followed by a full rerun
