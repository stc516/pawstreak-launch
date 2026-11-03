# Native push notification handoff

PawStreak now has separate, non-conflicting paths for browser Web Push and
Capacitor native push registration.

## Implemented in the app

- Native permission checks and prompts use `@capacitor/push-notifications`.
- Registration listeners are installed before `register()` is called.
- A successful iOS APNs or Android FCM token is saved to
  `public.native_device_tokens` for the authenticated user.
- Token rotation disables the prior token for that user.
- Morning/evening preferences, timezone, last-seen time, and app version are
  stored with the token.
- Notification taps accept only the known `/app` destination. Unknown or
  external payload paths fall back to `/app`.
- Explicit sign-out removes the user's token record, clears local preference
  state, and unregisters the native token. Account deletion also clears local
  native state; the database row is removed by `ON DELETE CASCADE`.
- Relaunch restores registration only when the user previously enabled
  reminders and OS permission is already granted. It never prompts on launch.

## Database deployment

Apply `supabase/migrations/20261103114617_native_device_tokens.sql` through the
established migration workflow before shipping this client. The table has RLS,
per-operation authenticated ownership policies, explicit grants, a foreign-key
index, and a future sender index.

## Required owner configuration before real delivery

These credentials are intentionally not fabricated or committed:

1. Add the production Android `google-services.json` and configure Firebase
   Cloud Messaging for `com.pawstreak.app`.
2. Enable Push Notifications for the iOS App ID, add the Xcode entitlement,
   and configure the production APNs key/certificate.
3. Add a trusted server-side sender that reads only enabled native tokens and
   sends through FCM/APNs. The existing sender delivers Web Push only.
4. Apply the database migration and deploy the sender through the established
   Supabase workflow.
5. Verify opt-in, token rotation, foreground/background receipt, notification
   tap, disable, sign-out, and account deletion on physical iOS and Android
   devices.

Until all five steps are complete, the native client registration foundation is
implemented but production native delivery is not complete.
