# Native Execution Runbook

This is the shortest practical path from the current PawStreak PWA to a real native beta.

## Current branch

- Branch: `native/capacitor-shell`
- Base: current `origin/main`
- Goal: iOS TestFlight first, Android internal testing second

## Step 1 — install and verify native packages

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
npm install
npm run qa:native
npm run lint
npm run build
```

## Step 2 — generate native projects

```bash
npx cap add ios
npx cap add android
npm run native:sync
```

Commit generated `ios/` and `android/` directories only after they build locally.

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
- Camera/Photos permission strings

## Step 4 — configure external services

Supabase Auth redirect URLs:

- `com.pawstreak.app://auth/callback`
- `com.pawstreak.app://auth/invite`
- `https://pawstreakapp.com/app`
- `https://pawstreakapp.com/app/invite`

Google OAuth must be tested on device.

Push requires APNs/FCM setup before native notification PASS.

## Step 5 — native plugin implementation pass

Implement only what directly improves beta reliability:

1. Native camera/photo capture with save-to-gallery behavior
2. Native push token registration path
3. App lifecycle/background resume checks for active adventure
4. Deep-link QA for auth and invite acceptance
5. Share-card image handoff to native share sheet

Do not add payments, social feed expansion, route recording, or new game mechanics before beta.

## Step 6 — TestFlight smoke

Use `docs/native-device-qa.md`. Do not invite external beta users until the core loop passes on a real iPhone:

Signup → onboarding → dog profile → location → discover → start → photo → finish → save memory → share → Journey → next adventure.
