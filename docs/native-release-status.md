# Native release status

Use this page as the short release handoff. Detailed behavioral testing remains in `docs/native-device-qa.md` and `docs/release-checklist.md`.

## Complete in the repository

- Capacitor iOS and Android projects with app ID `com.pawstreak.app`
- Native camera, Photos/gallery, share, filesystem, preferences, and app lifecycle plugins
- Native GPS plugin and iOS/Android foreground-location permission declarations
- Google OAuth in the system browser with a custom-scheme callback
- Native Supabase session persistence using Capacitor Preferences
- APNs registration callbacks bridged to Capacitor
- CI compilation of an Android debug APK and unsigned iOS Simulator app
- App icon, launch assets, metadata draft, device QA plan, and native readiness tests

## Required outside the repository

These steps require the owner's accounts or physical devices and cannot be completed by source code alone:

1. Add the production Supabase, Mapbox, and site variables to the release build environment.
2. Allow the four PawStreak auth callback URLs listed in `docs/native-capacitor-launch.md` in Supabase.
3. Join the Apple Developer Program, register `com.pawstreak.app`, select the team in Xcode, and create the App Store Connect record.
4. Create a Google Play Console account, enable Play App Signing, and protect the Android upload key.
5. Produce a signed TestFlight archive and signed Android App Bundle (`.aab`).
6. Run `docs/native-device-qa.md` on a real iPhone and Android phone.
7. Capture final screenshots and complete Apple privacy / Google Data safety answers from verified production behavior.

## Launch scope decision

Native push notifications are deferred from the first beta unless APNs, FCM, native device-token storage, and end-to-end delivery are all configured and tested. Browser push remains a separate PWA feature. The app must not promise native reminders until that path passes on real devices.

Billing is also deferred from the first public version. The free launch should validate activation and repeat adventures; see `docs/growth-and-monetization-strategy.md` for the decision gates before adding paid packs.

