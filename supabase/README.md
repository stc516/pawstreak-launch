# Supabase — PawStreak backend

## Setup

1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Enable **Email** auth and **Google** OAuth in Authentication → Providers.
3. Set **Authentication → URL Configuration**:
   - **Site URL:** `https://pawstreakapp.com` (not localhost — localhost breaks mobile OAuth)
   - **Redirect URLs:**
     - `http://localhost:5173/app`
     - `https://pawstreakapp.com/app`
     - `https://pawstreak-launch.vercel.app/app`
4. **Google Cloud Console** (OAuth client used by Supabase):
   - **Authorized redirect URI:** `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
   - Do not put `localhost` or `/app` in Google — only the Supabase callback URL
5. Run migrations **in order** in SQL Editor (or Supabase CLI):

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
   supabase/migrations/012_places_sd_oc_expansion.sql
   supabase/migrations/013_location_candidates.sql
   supabase/migrations/014_add_adventure_scheduling.sql
   supabase/migrations/015_remove_demo_counts.sql
   supabase/migrations/016_pack_access_mvp.sql
   supabase/seed/places.sql
   ```

6. Add env vars to `.env.local`:

   ```bash
   VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
   # Vercel Production only:
   # VITE_SITE_URL=https://pawstreakapp.com
   ```

8. Pack Access email invites require Supabase Edge Functions:

   ```bash
   supabase secrets set RESEND_API_KEY=YOUR_RESEND_KEY
   supabase secrets set RESEND_FROM_EMAIL="PawStreak <hello@pawstreakapp.com>"
   supabase secrets set SITE_URL="https://pawstreakapp.com"
   supabase functions deploy pack-invites
   supabase functions deploy pack-invite-accept
   ```

7. Restart dev server.

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
| `packs` | Pack Access ownership shell |
| `pack_members` | Owner, member, and viewer access to packs |
| `pack_invites` | Email-only invite tokens |
| `rate_limit_events` | Daily write limit ledger |
| `challenge_requests` | Unsupported-market local challenge requests |
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
