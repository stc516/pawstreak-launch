# Native Execution Runbook

This is the shortest practical path from the current PawStreak PWA to a real native beta.

## Release target

- Base: current `origin/main`
- Goal: iOS TestFlight first, Android internal testing second
- Native compile validation: `.github/workflows/native-builds.yml`

## Step 1 — install and verify native packages

Native builds must use the same production web environment as `pawstreakapp.com`.
Before building for device, confirm the local build has:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SITE_URL`
- `VITE_MAPBOX_TOKEN`

If these are missing, the native app will block with a setup error instead of
falling into local-only onboarding without Google sign-in.

Android builds require Java 21. On this Mac, verify it before running Gradle:

```bash
/usr/libexec/java_home -V
```

If Java 21 is installed through Homebrew, use:

```bash
export JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
export PATH="$JAVA_HOME/bin:$PATH"
```

```bash
npm ci
npm run qa:native
npm run lint
npm run build
```

## Step 2 — sync the native projects

The generated `ios/` and `android/` projects are committed. Do not run
`npx cap add` again for an existing checkout. Sync the current web build and
Capacitor plugins into both projects:

```bash
npm run native:sync
```

Pull requests compile an Android debug APK and unsigned iOS Simulator app in
the native build workflow. Download those artifacts from the workflow run for
installation in an Android emulator/device or iOS Simulator. They do not
replace signed TestFlight/device builds.

## Step 3 — configure iOS

Open Xcode:

```bash
npm run native:ios
```

Set:

- Team/signing
- Bundle ID `com.pawstreak.app`
- Display name `PawStreak`
- App icon
- Launch screen
- Associated URL scheme for `com.pawstreak.app://auth/callback`
- Push notification capability if testing native push
- Camera/Photos/location permission strings

## Step 4 — configure external services

Supabase Auth redirect URLs:

- `com.pawstreak.app://auth/callback`
- `com.pawstreak.app://auth/invite`
- `https://pawstreakapp.com/app`
- `https://pawstreakapp.com/app/invite`

Google OAuth uses the system browser and must be tested through the full callback on device.

Push requires APNs/FCM setup before native notification PASS.

## Step 5 — native plugin implementation pass

Implement only what directly improves beta reliability:

1. Native camera/photo capture with save-to-gallery behavior
2. Native push token registration path
3. App lifecycle/background resume checks for active adventure
4. Deep-link QA for auth and invite acceptance
5. Share-card image handoff to native share sheet

Do not add payments, social feed expansion, route recording, or new game mechanics before beta. The post-beta monetization decision gates are documented in `docs/growth-and-monetization-strategy.md`.

## Step 6 — TestFlight smoke

Use TestFlight for real beta distribution. Local Xcode installs are only for
engineering smoke tests and can trigger Apple developer-profile trust issues
that beta users should never see.

Use `docs/native-device-qa.md`. Do not invite external beta users until the core loop passes on a real iPhone:

Signup → onboarding → dog profile → location → discover → start → photo → finish → save memory → share → Journey → next adventure.

## Step 7 — App Store Connect / TestFlight setup

Production native beta needs the paid Apple Developer Program and an App Store
Connect app record for bundle ID `com.pawstreak.app`.

Required setup:

- Register bundle ID `com.pawstreak.app`
- Enable Sign in with Apple only if added later; current auth focus is Supabase/Google
- Add app record in App Store Connect
- Configure TestFlight internal testing
- Archive from Xcode with production env already synced into `ios/App/App/public`
- Upload archive to App Store Connect
- Run the TestFlight smoke from `docs/native-device-qa.md`

## Step 8 — automated signed releases

The `Native store release` workflow is manual and protected by the GitHub `production` environment. It can build either platform or both, always uploads the signed files as private workflow artifacts, and uploads to the stores only when `upload_to_store` is explicitly selected.

Configure these GitHub environment values without putting them in repository files:

- Variable: `VITE_SITE_URL=https://pawstreakapp.com`
- Shared secrets: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_MAPBOX_TOKEN`
- Android secrets: `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`, and `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`
- Apple secrets: `APPLE_TEAM_ID`, `APP_STORE_CONNECT_API_KEY_ID`, `APP_STORE_CONNECT_ISSUER_ID`, `APP_STORE_CONNECT_API_PRIVATE_KEY_BASE64`, `IOS_DISTRIBUTION_CERTIFICATE_BASE64`, `IOS_DISTRIBUTION_CERTIFICATE_PASSWORD`, and `IOS_PROVISIONING_PROFILE_BASE64`

Base64 values are decoded only into the runner's temporary directory. The release preflight reports presence and structural validity without printing credential values. First run each platform with store upload disabled, install and inspect the resulting artifact, then perform a second explicit upload run.

The `Store screenshot package` workflow produces Apple 1290×2796 and Google 1080×1920 review sets. These are generated from demo state and must be reviewed against the final release candidate before store upload.
