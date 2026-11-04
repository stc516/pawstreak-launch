# PawStreak native push configuration checklist

This checklist separates the current browser/PWA reminder system from the native APNs and FCM path required for iOS and Android. Do not mark native push `PASS` until a real device receives a provider-backed notification and its tap opens PawStreak.

## Current repository state — 2026-11-03

- [x] `@capacitor/push-notifications` is installed and synced into both native projects.
- [x] Foreground presentation options are defined in `capacitor.config.json`.
- [x] Android declares `POST_NOTIFICATIONS` and conditionally applies the Google Services plugin.
- [x] The existing web path stores Web Push endpoints/keys and sends reminders with VAPID.
- [ ] Native permission request, registration listeners, token upload, token rotation, and notification-tap routing are not implemented in the React app.
- [ ] The database and Edge Functions only model Web Push subscriptions; they do not store or send APNs/FCM device tokens.
- [ ] No iOS entitlements file or committed Push Notifications capability is present.
- [ ] No `GoogleService-Info.plist` or `android/app/google-services.json` is present. These account-specific files must not be fabricated.
- [ ] No native push has been received on a real device.

## Owner/account setup

### Apple / APNs

- [ ] Confirm access to the Apple Developer team that owns `com.pawstreak.app`.
- [ ] Register or confirm the explicit App ID `com.pawstreak.app`.
- [ ] Enable the Push Notifications capability for that App ID.
- [ ] Create an APNs authentication key, record its Key ID and Team ID, and store the `.p8` key only in the chosen server/provider secret store.
- [ ] Add Push Notifications in Xcode Signing & Capabilities and commit the generated entitlement changes after they are reviewed.
- [ ] Add the Capacitor-required remote-notification registration forwarding methods to `ios/App/App/AppDelegate.swift`.
- [ ] Produce a signed development/TestFlight build; the simulator does not prove APNs delivery.

### Firebase / FCM

- [ ] Confirm the Firebase project intended for PawStreak production.
- [ ] Register Android app ID `com.pawstreak.app` in that project.
- [ ] Download the real `google-services.json` and place it at `android/app/google-services.json` for the native build process. Decide whether it is committed or injected by CI before adding it to source control.
- [ ] Create a white-on-transparent Android notification icon and configure its manifest metadata.
- [ ] Define a stable default notification channel ID and create the matching channel in app code.
- [ ] Confirm the server has an authorized FCM sending credential or provider integration; never ship server credentials in the app.

## App implementation

- [ ] Add a native-runtime notification module using `PushNotifications.checkPermissions()`, `requestPermissions()`, and `register()`.
- [ ] Subscribe before registering to `registration`, `registrationError`, `pushNotificationReceived`, and `pushNotificationActionPerformed`.
- [ ] Upload the token only for an authenticated user and include platform, timezone, app version, device token, enabled state, and last-seen timestamp.
- [ ] Upsert token rotations idempotently; do not create duplicate active rows for one token.
- [ ] Disable or delete the native token on sign-out, account deletion, and reminder opt-out.
- [ ] Route notification taps to the supported in-app destination, defaulting safely to `/app`.
- [ ] Keep the existing Web Push flow for browsers/PWAs; native and web subscriptions must remain separate transports.
- [ ] Report permission denial, provider configuration errors, and token-registration failures honestly in Settings.

## Backend implementation

- [ ] Add a native device-token schema rather than forcing APNs/FCM tokens into the current Web Push `endpoint/p256dh/auth_key` shape.
- [ ] Restrict reads/writes to the owning user and use a server path for provider sends.
- [ ] Extend reminder selection so one reminder preference can target enabled web and/or native transports without duplicate delivery.
- [ ] Add APNs and FCM send adapters with credentials stored only as server secrets.
- [ ] Handle invalid/unregistered tokens by disabling or removing them.
- [ ] Record transport, provider response, and failure category without logging raw tokens.
- [ ] Add retry/idempotency protection so the 15-minute reminder job cannot double-send the same period/day.

## Verification matrix

| Check | iOS | Android | Status |
| --- | --- | --- | --- |
| Permission allow | Real iPhone | API 33+ device | UNVERIFIED |
| Permission deny and recovery copy | Real iPhone | API 33+ device | UNVERIFIED |
| Token registered and persisted | APNs token | FCM token | UNVERIFIED |
| Foreground notification | Banner/list behavior | Channel behavior | UNVERIFIED |
| Background notification | Receive and tap | Receive and tap | UNVERIFIED |
| Terminated-app notification | Receive and cold-open | Receive and cold-open | UNVERIFIED |
| Tap destination | `/app` or supported route | `/app` or supported route | UNVERIFIED |
| Preference change | No future send | No future send | UNVERIFIED |
| Sign-out/account deletion | Token disabled/removed | Token disabled/removed | UNVERIFIED |

## Stop conditions

Do not invite native beta testers for reminder testing if permission prompts repeat, tokens cross accounts, opt-out still sends, a tap opens a blank route, provider secrets are bundled in the client, or delivery has not been proven on a physical device.
