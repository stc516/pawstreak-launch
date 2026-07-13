# PawStreak

PawStreak is a mobile-first React/Vite PWA for planning dog-friendly adventures, saving memories, and building a dog's journey. Production is hosted at [pawstreakapp.com](https://pawstreakapp.com) with Supabase authentication and persistence.

## Local development

```bash
npm ci
npm run dev
```

Copy the required values into `.env.local`:

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
VITE_SITE_URL=https://pawstreakapp.com
VITE_MAPBOX_TOKEN=pk.YOUR_TOKEN
```

See `supabase/README.md` for database, OAuth, Storage, and Edge Function setup.

## Release gate

```bash
npm audit --omit=dev --audit-level=high
npm run qa:release
```

`qa:release` runs lint, a deterministic production build using the supported no-map fallback, the seven-screen mobile shell guard, and the mobile release smoke suite. Evidence is written to `qa/evidence/release-readiness/` and `qa/evidence/mobile-shell-guard/`. Validate the real Mapbox credential separately in the production canary.

A release candidate is not ready until the automated gate passes and the production checklist in `docs/release-checklist.md` is complete with two real accounts and real iPhone/Android devices.

## Important routes

- `/` — marketing
- `/app` — authenticated product
- `/demo/app` — seeded demo
- `/privacy`, `/terms`, `/support`, `/delete-account` — public trust pages
- `/internal/*` — authenticated internal users only

## Deployment notes

- Deploy from a clean commit based on `origin/main`.
- Record the release SHA before deploying.
- Apply Supabase migrations in filename order and deploy all configured Edge Functions.
- Verify service-worker updates and the rollback path during canary.
