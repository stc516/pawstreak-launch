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
	   supabase/migrations/012_dogs_photo_path.sql
	   supabase/migrations/013_custom_adventure.sql
	   supabase/migrations/014_location_candidates.sql
	   supabase/migrations/015_location_expansion_requests.sql
	   supabase/migrations/016_pack_access_mvp.sql
	   supabase/migrations/017_neighborhood_walk_place.sql
	   supabase/migrations/018_release_privacy_hardening.sql
	   supabase/migrations/019_release_storage_and_invite_hardening.sql
	   supabase/migrations/020_push_notifications.sql
   supabase/seed/places.sql
   ```

6. Add env vars to `.env.local`:

   ```bash
   VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
   VITE_WEB_PUSH_PUBLIC_KEY=YOUR_VAPID_PUBLIC_KEY
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
	   supabase functions deploy delete-account
	   supabase functions deploy push-subscriptions
	   supabase functions deploy send-push-reminders
   ```

10. Morning and evening Web Push reminders require a VAPID key pair. Generate
    the pair once; the private key must never
    be added to the browser bundle or committed:

   ```bash
   npx web-push generate-vapid-keys
   supabase secrets set WEB_PUSH_VAPID_PUBLIC_KEY="..." WEB_PUSH_VAPID_PRIVATE_KEY="..." WEB_PUSH_VAPID_SUBJECT="mailto:hello@pawstreakapp.com"
   ```

   Put the same public key in Vercel as `VITE_WEB_PUSH_PUBLIC_KEY`. Migration
   `020` creates the 15-minute cron job and uses expiring, single-use database
   tokens to authenticate each sender invocation.

7. Restart dev server.

9. Mark trusted internal users from a service-role environment by setting protected Auth `app_metadata.internal=true`. Internal routes and feedback reads reject all other users.

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
| `push_subscriptions` | Per-device Web Push endpoint and AM/evening schedule |
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
