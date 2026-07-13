# PawStreak release checklist

Record the candidate SHA, tester, date, device/OS, and evidence link for each run.

## Automated blockers

- [ ] `npm audit --omit=dev --audit-level=high`
- [ ] `npm run qa:release`
- [ ] No unexpected bundle-size increase
- [ ] Clean `git status` for the release commit

## Production backend

- [ ] Migrations 001–019 confirmed in production
- [ ] `pack-invites`, `pack-invite-accept`, and `delete-account` deployed
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
- [ ] Dog edit and planned-adventure deletion persist
- [ ] Member and Viewer Pack invites behave correctly
- [ ] Invalid, reused, and expired invite tokens fail safely
- [ ] Account deletion removes Auth, database records, storage photos, and local session

## Mobile and PWA

- [ ] Current iPhone Safari and one smaller/older iPhone
- [ ] Current Android Chrome
- [ ] Camera and location allow/deny flows
- [ ] Keyboard, safe areas, large text, back navigation, slow network
- [ ] Install on iOS and Android; icon, splash, standalone launch
- [ ] Offline shell and honest failed-write behavior
- [ ] Service-worker update from the previous production version

## Canary and freeze

- [ ] Deploy the recorded SHA and repeat the critical path
- [ ] Monitoring receives a deliberate test error with release SHA
- [ ] Rollback tested
- [ ] 10–25-user canary runs for at least 24 hours without P0/P1 issues
- [ ] Privacy/Terms text approved by the founder and legal counsel
- [ ] Freeze, tag the exact SHA, and accept only blocker fixes followed by a full rerun
