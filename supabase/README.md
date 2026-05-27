# Supabase — PawStreak backend

## Setup

1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Enable **Email** auth and **Google** OAuth in Authentication → Providers.
3. Set Site URL + redirect URLs to your app origin (e.g. `http://localhost:5173`, production domain).
4. Run migrations **in order** in SQL Editor (or Supabase CLI):

   ```
   supabase/migrations/001_demo_feedback.sql
   supabase/migrations/002_profiles.sql
   supabase/migrations/003_dogs.sql
   supabase/migrations/004_places.sql
   supabase/migrations/005_adventures.sql
   supabase/migrations/006_memories.sql
   supabase/migrations/007_early_access_signups.sql
   supabase/migrations/008_product_feedback.sql
   supabase/migrations/009_user_events.sql
   supabase/migrations/010_storage_memory_photos.sql
   supabase/migrations/011_waitlist_signups.sql
   supabase/seed/places.sql
   ```

5. Add env vars to `.env.local`:

   ```bash
   VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
   ```

6. Restart dev server.

Regenerate places seed after catalog changes:

```bash
npx tsx scripts/generate-places-seed.mjs
```

## Tables

| Table | Purpose |
|---|---|
| `profiles` | User profile + onboarding prefs + active dog |
| `dogs` | Dogs per user |
| `places` | Read-only place catalog (seeded) |
| `adventures` | Active/completed adventures |
| `memories` | Journey memories + storage photo paths |
| `early_access_signups` | Waitlist from `/early-access` + onboarding |
| `waitlist_signups` | Marketing landing page waitlist at `/` |
| `product_feedback` | In-app product feedback |
| `user_events` | Lightweight analytics events |
| `demo_feedback` | Legacy demo tester feedback (unchanged) |

## Storage

Bucket: `memory-photos`  
Path pattern: `{user_id}/{memory_id}/{n}.jpg`

## Routes

| Route | Purpose |
|---|---|
| `/` | Marketing landing page + waitlist |
| `/app` | Production app (auth + real data) |
| `/early-access` | Standalone waitlist form |
| `/demo` | Interactive demo app (Bailey + Omi) |
| `/demo/launch` | Demo launcher (onboarding vs full demo) |
| `/internal/*` | Internal tools (noindex) |

## Product loop

Sign up → onboarding → dog profile → start adventure → finish → memory in Journey.

Without Supabase env vars, production app falls back to local-only state (dev only).
