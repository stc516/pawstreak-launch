# PawStreak Native App Launch Plan

PawStreak's native path is Capacitor first, not a React Native rewrite. The goal is to keep the current React/Vite/Supabase/Mapbox product and ship it through a native iOS/Android shell as soon as the beta loop is stable.

## Native target

- App name: PawStreak
- Bundle ID / app ID: `com.pawstreak.app`
- Web bundle: `dist`
- Primary beta target: iOS TestFlight first
- Secondary target: Android internal testing

## Why this path

Capacitor lets the existing web app run inside native iOS and Android projects while adding native device plugins. That is the fastest route to app-store distribution without rebuilding PawStreak's core adventure loop.

## Native packages

Installed packages:

- `@capacitor/core`
- `@capacitor/cli`
- `@capacitor/ios`
- `@capacitor/android`
- `@capacitor/app`
- `@capacitor/share`
- `@capacitor/filesystem`
- `@capacitor/preferences`
- `@capacitor/push-notifications`
- `@capacitor/camera`

## Native blockers before TestFlight

### 1. Apple Developer setup

Required before iOS device/TestFlight distribution:

- Apple Developer account access
- Bundle ID: `com.pawstreak.app`
- Signing team selected in Xcode
- App icon and launch screen verified
- Privacy Policy URL: `https://pawstreakapp.com/privacy`
- Support URL: `https://pawstreakapp.com/support`

### 2. Supabase redirect URLs

Add these redirect URLs in Supabase Auth settings before native OAuth/email auth testing:

- `com.pawstreak.app://auth/callback`
- `com.pawstreak.app://auth/invite`
- `https://pawstreakapp.com/app`
- `https://pawstreakapp.com/app/invite`

The repo now includes native runtime detection and deep-link handling so these app-scheme redirects can route back into `/app` and `/app/invite`.

### 3. Google OAuth native review

Google sign-in must be tested on device because native app redirects differ from browser redirects. If Google rejects the custom scheme flow, use the Capacitor Browser/App plugin flow and update the Supabase OAuth redirect allowlist accordingly.

### 4. Push notifications

The PWA push work is not enough for App Store native push. Native push requires:

- Apple Push Notification service capability in Xcode
- APNs key/certificate in Apple Developer
- Firebase Cloud Messaging for Android if Android push is enabled
- Supabase Edge Function path updated or extended to target APNs/FCM tokens, not only browser push subscriptions

Keep browser reminders live for web/PWA users. Add native push as a separate device-token path.

### 5. Photos and camera

Native capture uses `@capacitor/camera` with `saveToGallery` so photos taken inside PawStreak can save to the device gallery and still attach to the PawStreak memory.

The web/PWA fallback can open an image-only share sheet, but it cannot silently write to iPhone Photos.

### 6. Mapbox and location

Verify on real devices:

- Mapbox tiles load inside the native WebView
- location permission prompts appear at the right moment
- route/current-position fallbacks do not block adventure completion
- no horizontal overflow on iPhone sizes

## Native QA commands

```bash
npm run qa:native
npm run lint
npm run build
npm run qa:beta-critical
npm run native:sync
npm run native:ios
npm run native:android
```

## First TestFlight acceptance checklist

- App launches from icon
- Signup works with email
- Google OAuth returns to PawStreak
- onboarding creates dog profile
- location prompt is understandable and skippable
- Explore map renders curated places
- Quick Walk starts
- background/resume keeps active adventure usable
- adventure can finish and save
- memory photo persists to PawStreak
- native photo capture saves to Photos/gallery when permission is granted
- share card can open Instagram/share sheet with image attached
- Journey shows saved memory
- daily reminder permission can be requested without trapping the user
- account deletion is accessible

## Product constraint

Do not use native as an excuse to add feature bloat. Native launch should make the existing PawStreak loop feel real, reliable, and sticky:

Discover → choose → go → remember → progress → discover again.
