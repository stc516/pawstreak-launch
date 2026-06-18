# Pack Access MVP

Pack Access lets family members, partners, dog walkers, roommates, and trusted friends participate in a dog's PawStreak journey without sharing a password.

## Roles

Owner:
- Full control.
- Can invite and remove members.
- Can edit dog profiles.
- Can manage permissions.

Member:
- Can view pack dogs.
- Can add memories and photos.
- Can participate in adventures and challenges.

Viewer:
- Read-only access to the shared pack.

## Database

Migration: `supabase/migrations/016_pack_access_mvp.sql`

Tables:
- `packs`
- `pack_members`
- `pack_invites`
- `rate_limit_events`
- `challenge_requests`

RPCs:
- `create_pack_invite(invite_email text, invite_role text)`
- `accept_pack_invite(invite_token text)`

RLS:
- Pack members can read pack-owned dogs, adventures, and memories.
- Owners and members can contribute to adventures and memories.
- Viewers are read-only.
- Only owners can create invites through the invite RPC.

## Email

Supabase Edge Functions:
- `pack-invites`
- `pack-invite-accept`

Required function secrets:
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`, default `PawStreak <hello@pawstreakapp.com>`
- `SITE_URL`, production should be `https://pawstreakapp.com`

Email templates included:
- Pack invite email.
- Pack welcome email.

Future email architecture is prepared for adventure reminders and weekly recaps, but those are not implemented in this MVP.

## Invite Flow

1. Owner enters an email address.
2. `pack-invites` creates a `pack_invites` record through `create_pack_invite`.
3. Resend sends an email with `/app/invite?token=...`.
4. Invitee clicks the link.
5. If unauthenticated, they sign in, sign up, use Google, or request a magic link.
6. Auth redirects preserve the invite token.
7. `pack-invite-accept` calls `accept_pack_invite`.
8. The invitee is added to `pack_members`.
9. App refreshes shared pack data and redirects to `/app`.

## Rate Limits

Conservative daily limits are enforced through `rate_limit_events`:

| Action | Limit |
| --- | ---: |
| Pack invites | 10/day/user |
| Community posts | 10/day/user |
| Spot suggestions | 5/day/user |
| Challenge requests | 3/day/user |
| Photo uploads | 50/day/user |

Implemented in this slice:
- Pack invite RPC rate limit.
- Spot suggestion trigger on `location_candidates`.
- Challenge request trigger on `challenge_requests`.
- Memory photo update trigger on `memories.photo_paths`.

Community post persistence is still local/demo-oriented, so the production DB enforcement point should be added when community posts move to Supabase.

## Auth Gates

Production writes require Supabase auth:
- Invites.
- Invite acceptance.
- Memories.
- Photo uploads.
- Spot suggestions.
- Challenge requests.

Supported auth:
- Google OAuth.
- Email/password.
- Email magic link.

## Deployment Checklist

1. Apply `supabase/migrations/016_pack_access_mvp.sql`.
2. Set Supabase function secrets:
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL`
   - `SITE_URL`
3. Deploy Edge Functions:
   - `pack-invites`
   - `pack-invite-accept`
4. Deploy Vercel frontend from the Pack Access branch.
5. Test:
   - Owner sends Member invite.
   - Owner sends Viewer invite.
   - Invitee accepts while signed out.
   - Invitee sees shared dog and memories.
   - Unsupported-market challenge request saves.
