# PawStreak controlled-beta readiness — 2026-09-24

This is the dated evidence record for `docs/release-checklist.md`. It does not replace the reusable checklist.

## Candidate

- Candidate and deployed production SHA: `1b4dec7d96cc215b6040dc0ddd6d70da1965687c`
- Production URL: `https://pawstreakapp.com`
- Tester: Codex automated audit on macOS; no authenticated beta accounts or physical mobile devices were available
- Production deployment recorded by GitHub/Vercel at 2026-09-23 17:59 UTC
- Audit-tool repair: draft PR #35

Status meanings are the same as the release checklist. A repository file or code path is not production proof.

## Automated blockers

| Status | Item | Evidence |
|---|---|---|
| PASS | `npm audit --omit=dev --audit-level=high` | 0 production vulnerabilities on 2026-09-24. |
| PASS | `npm run qa:release` | Clean rerun at the candidate SHA: audit, lint, native static checks, build, PWA generation, shell guard, release smoke, beta-critical smoke, and core-loop P0 all passed. |
| UNVERIFIED | No unexpected bundle-size increase | Build completed, but the repository has no checked baseline. Vite warned that the main and Mapbox chunks exceed 500 kB. |
| PASS | Clean `git status` for the release commit | `main` was clean at `1b4dec7` before audit-tool work began. |
| PASS | Release candidate SHA recorded before production canary | Candidate and deployed SHA are recorded above. |

## Production backend

| Status | Item | Evidence / blocker |
|---|---|---|
| BLOCKED | Migrations 001–020 confirmed in production | Files 001–022 exist locally. Supabase CLI is not authenticated, so production migration history cannot be queried. |
| BLOCKED | Required Edge Functions deployed | All five function sources exist locally. Deployment state is not accessible without Supabase authentication. |
| BLOCKED | Push cron job exists and targets production | Migration 020 defines `pawstreak-push-reminders` and the production project URL; production cron state is not accessible. |
| BLOCKED | Private VAPID env vars configured | The public key is present in the deployed web bundle; private Edge Function secrets require Supabase access. |
| PASS | `VITE_WEB_PUSH_PUBLIC_KEY` configured | The deployed bundle contains VAPID-shaped public-key data. No key value was printed or stored in this report. |
| PASS | Production web app has Supabase env vars | The deployed bundle targets Supabase project `jifspotggsllxmreoqui`; `/app` renders the production account entry rather than local-only onboarding. |
| BLOCKED | Trusted staff metadata and feedback isolation | UI gate and `app_metadata.internal` policy exist in code, but production account claims and cross-account reads were not tested. |
| BLOCKED | Private photo bucket, limits, and quotas | Migrations define a private `memory-photos` bucket, 5 MB limit, image MIME allowlist, owner-path policies, and app-level rate accounting. Production bucket state and bypass resistance were not tested. |
| BLOCKED | Backup/restore and rollback owner | Requires project owner confirmation and a recovery exercise. |
| BLOCKED | Mapbox restrictions and Resend authentication | A Mapbox token is present in production. Token restrictions and Resend domain status require their provider consoles. |

## Two-account critical path

All items below are `BLOCKED`: no authorized pair of production test accounts was available, and creating accounts would require owner confirmation at the final account-creation step.

| Status | Item |
|---|---|
| BLOCKED | Email signup, confirmation, sign-in, sign-out, and password reset |
| BLOCKED | Google OAuth |
| BLOCKED | Onboarding with dog and photo persists after reload |
| BLOCKED | Location update persists |
| BLOCKED | Start, background/resume, finish adventure; memory/photo/streak persist |
| BLOCKED | Saved memory and photo persist after reload, sign-out, and sign-in |
| BLOCKED | Second account cannot read the first account's dog, memories, Pack, push subscriptions, or photos |
| BLOCKED | Dog edit and planned-adventure deletion persist |
| BLOCKED | Member and Viewer Pack invites behave correctly |
| BLOCKED | Invalid, reused, and expired invite tokens fail safely |
| BLOCKED | Account deletion removes Auth, database, storage, push, and local-session data |

## Notifications and reminders

| Status | Item | Evidence / blocker |
|---|---|---|
| PASS | PWA explains notification value without calendar integration | Candidate and production UI expose daily morning/evening reminders without requiring calendar access. |
| BLOCKED | Permission allow/deny flows on iOS and Android | Requires physical devices and authenticated accounts. |
| BLOCKED | iOS installed PWA subscribes | Requires physical iPhone installation and production account. |
| BLOCKED | Android Chrome subscribes | Requires physical Android installation and production account. |
| BLOCKED | Morning reminder received | Requires production function/cron access and a real subscription. |
| BLOCKED | Evening reminder received | Requires production function/cron access and a real subscription. |
| UNVERIFIED | Notification tap opens `/app` | Service worker click routing passed static QA; no real notification was tapped. |
| BLOCKED | Disabling reminders updates the row and stops sends | Requires production account and backend access. |
| PASS | Missing/invalid push configuration fails honestly | Static beta-critical QA verifies the explicit missing-key UI and error path. |

## Mobile and PWA

| Status | Item | Evidence / blocker |
|---|---|---|
| UNVERIFIED | Current iPhone Safari and smaller/older iPhone | Chromium emulation was green on iPhone SE (3rd gen), iPhone 15 Pro, and iPhone 15 Pro Max; this is not physical Safari proof. |
| UNVERIFIED | Current Android Chrome | Pixel 7 Chromium emulation was green; this is not a physical-device install. |
| BLOCKED | Camera and location allow/deny flows | Physical-device permission checks are required. |
| UNVERIFIED | Keyboard, safe areas, large text, back navigation, slow network | Layout emulation passed, but the complete matrix was not exercised. |
| BLOCKED | Install on iOS/Android; icon, splash, standalone launch | Requires physical devices and signing/install paths. |
| UNVERIFIED | Offline shell and honest failed-write behavior | The service worker and offline shell build successfully; offline writes were not exercised. |
| UNVERIFIED | Service-worker update from previous production version | Requires an installed previous version and upgrade test. |

## Product loop and emotional payoff

| Status | Item | Evidence / blocker |
|---|---|---|
| FAIL | First-run explains the product loop | The production entry explains personalized spots, outings, and challenges, but does not explain the Remember or Progress payoff. This needs explicit first-screen copy and verification. |
| PASS | Today offers an obvious adventure or Quick Walk | Verified in candidate core-loop QA and the live demo surface. |
| UNVERIFIED | Explore/detail feels exciting and clear | Layout passed; qualitative founder review is still needed. |
| UNVERIFIED | Active adventure survives background/resume | Persistence code exists, but OS background/resume was not executed. |
| PASS | Finish flow says the adventure was saved | Core-loop P0 created a Journey memory and verified the saved payoff. |
| PASS | Photo failures are honest and recoverable | Beta-critical QA verifies rollback/error copy for incomplete photo saves. |
| UNVERIFIED | Journey produces the intended emotional payoff | Functional layout passed; qualitative founder/beta-user review remains. |
| PASS | Share uses native share/fallback without promising direct Instagram publishing | Beta-critical QA verifies image-first sharing, Photos fallback, and honest copy. |
| PASS | No fake/demo content appears in production app mode | Production `/app` entry and beta-critical checks found no demo badge, dog, place, or social fixtures. |

## Canary and freeze

| Status | Item | Evidence / blocker |
|---|---|---|
| BLOCKED | Repeat authenticated critical path on deployed SHA | Production is on the recorded SHA, but authenticated test accounts are unavailable. |
| BLOCKED | Monitoring receives a deliberate test error | Monitoring destination/access is not connected. |
| BLOCKED | Rollback tested | Requires owner-approved deployment rollback exercise. |
| BLOCKED | 10–25-user canary completes 24 hours without P0/P1 | Canary has not begun. |
| BLOCKED | Privacy/Terms approved by founder and counsel | Public pages render; approval must come from the named reviewers. |
| BLOCKED | Freeze and tag exact SHA | Remaining backend, account, device, and approval gates are open. |

## Required connections to continue

1. Authenticate Supabase CLI/MCP for project `jifspotggsllxmreoqui` with read access to migrations, functions, secrets names, cron, storage policies, and advisors.
2. Provide or authorize two disposable production beta accounts with distinct email addresses.
3. Provide one installable iPhone and one Android device for PWA permission, camera, location, push, offline, and update tests.
4. Identify the monitoring service and the backup/rollback owner.

## Delay log

- AI usage interruptions: none observed during this audit.
- Testing delay: one initial release-gate run was invalid because a separate local server occupied port 4173; the process was stopped and the full gate passed on a clean rerun.
- Access delays: Supabase management authentication, two test accounts, provider consoles, physical devices, monitoring, and legal/founder approvals.
