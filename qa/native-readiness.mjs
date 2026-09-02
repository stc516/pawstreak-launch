import { readFile } from 'node:fs/promises'

const results = []

function record(id, pass, detail) {
  results.push({ id, pass, detail })
  console.log(`[${pass ? 'PASS' : 'FAIL'}] ${id}: ${detail}`)
}

function includesAll(source, snippets) {
  return snippets.every((snippet) => source.includes(snippet))
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'))
}

async function main() {
  const pkg = await readJson('package.json')
  const cap = await readJson('capacitor.config.json')
  const routes = await readFile('src/lib/routes.ts', 'utf8')
  const deepLinks = await readFile('src/lib/nativeDeepLinks.ts', 'utf8')
  const runtime = await readFile('src/lib/nativeRuntime.ts', 'utf8')
  const nativePhotos = await readFile('src/lib/nativePhotos.ts', 'utf8')
  const nativePhotoRestore = await readFile('src/lib/nativePhotoRestore.ts', 'utf8')
  const activeAdventure = await readFile('src/screens/app/ActiveAdventureScreen.tsx', 'utf8')
  const iosInfoPlist = await readFile('ios/App/App/Info.plist', 'utf8').catch(() => '')
  const androidManifest = await readFile('android/app/src/main/AndroidManifest.xml', 'utf8').catch(() => '')
  const launchDocs = await readFile('docs/native-capacitor-launch.md', 'utf8')
  const appStoreDocs = await readFile('docs/native-app-store-metadata.md', 'utf8')
  const deviceQaDocs = await readFile('docs/native-device-qa.md', 'utf8')
  const runbookDocs = await readFile('docs/native-execution-runbook.md', 'utf8')

  record(
    'capacitor-packages-installed',
    includesAll(JSON.stringify(pkg.dependencies ?? {}), [
      '@capacitor/core',
      '@capacitor/app',
      '@capacitor/share',
      '@capacitor/filesystem',
      '@capacitor/preferences',
      '@capacitor/push-notifications',
      '@capacitor/camera',
    ]) &&
      includesAll(JSON.stringify(pkg.devDependencies ?? {}), [
        '@capacitor/cli',
        '@capacitor/ios',
        '@capacitor/android',
      ]),
    'Capacitor runtime, native platforms, camera, share, filesystem, preferences, and push packages are installed.',
  )

  record(
    'capacitor-config-foundation',
    cap.appId === 'com.pawstreak.app' && cap.appName === 'PawStreak' && cap.webDir === 'dist',
    'Capacitor config defines PawStreak bundle ID, app name, and built Vite web directory.',
  )

  record(
    'native-scripts-defined',
    includesAll(JSON.stringify(pkg.scripts ?? {}), [
      'native:sync',
      'native:ios',
      'native:android',
      'qa:native',
    ]),
    'Package scripts expose sync, iOS, Android, and native QA commands.',
  )

  record(
    'native-auth-redirects',
    includesAll(routes, [
      'isNativeAppRuntime()',
      'NATIVE_APP_SCHEME',
      '://auth/callback',
      '://auth/invite',
    ]),
    'Auth redirects switch to the native custom URL scheme inside the native app.',
  )

  record(
    'native-deep-link-handler',
    includesAll(deepLinks, [
      "addListener('appUrlOpen'",
      'exchangeCodeForSession',
      '/app/invite',
      "window.dispatchEvent(new PopStateEvent('popstate'))",
    ]) && includesAll(runtime, ['isNativeAppRuntime', 'getNativePlatform', 'NATIVE_APP_SCHEME']),
    'Native app URL opens are routed back into the PawStreak app shell and Supabase code exchange is handled.',
  )

  record(
    'native-photo-capture-gallery-save',
    includesAll(nativePhotos, [
      '@capacitor/camera',
      'Camera.getPhoto',
      'CameraResultType.DataUrl',
      'CameraSource.Camera',
      'saveToGallery: true',
    ]) &&
      includesAll(activeAdventure, [
        'captureNativeAdventurePhoto',
        'Saved to PawStreak and your phone photos.',
        'handleSavePhotoToPhone',
      ]),
    'Native adventure photo capture uses Capacitor Camera with gallery save and keeps the web fallback.',
  )

  record(
    'native-camera-restore-handler',
    includesAll(nativePhotoRestore, [
      "addListener('appRestoredResult'",
      "event.pluginId !== 'Camera'",
      "event.methodName !== 'getPhoto'",
      'subscribeToNativeRestoredPhotos',
    ]) && activeAdventure.includes('Recovered your camera photo and saved it to PawStreak.'),
    'Native camera capture has an appRestoredResult path for OS-killed camera activity recovery.',
  )

  record(
    'native-camera-permissions',
    includesAll(iosInfoPlist, [
      'NSCameraUsageDescription',
      'NSPhotoLibraryAddUsageDescription',
      'NSPhotoLibraryUsageDescription',
      'CFBundleURLSchemes',
      'com.pawstreak.app',
    ]) &&
      includesAll(androidManifest, [
        'android.permission.READ_EXTERNAL_STORAGE',
        'android:maxSdkVersion="32"',
        'android.permission.WRITE_EXTERNAL_STORAGE',
        'android:maxSdkVersion="29"',
        'android.permission.POST_NOTIFICATIONS',
        'android:scheme="com.pawstreak.app"',
      ]),
    'Native projects declare iOS camera/photo/deep-link settings and Android save-to-gallery/deep-link/notification settings.',
  )

  record(
    'native-launch-docs',
    includesAll(launchDocs, [
      'TestFlight',
      'Supabase redirect URLs',
      'APNs',
      '@capacitor/camera',
      'saveToGallery',
      'com.pawstreak.app://auth/callback',
    ]),
    'Native launch docs capture the external setup required before real-device beta.',
  )

  record(
    'native-app-store-prep-docs',
    includesAll(appStoreDocs, [
      'Better dog days near you',
      'com.pawstreak.app',
      'TestFlight beta description',
      'Privacy labels draft',
      'Screenshot set needed',
    ]),
    'App Store metadata draft covers positioning, screenshots, TestFlight copy, and privacy-label review inputs.',
  )

  record(
    'native-device-qa-docs',
    includesAll(deviceQaDocs, [
      'Auth',
      'Core adventure loop',
      'Photos',
      'Push/reminders',
      'Beta stop conditions',
    ]),
    'Native device QA checklist covers real-device launch risks before external TestFlight invites.',
  )

  record(
    'native-execution-runbook',
    includesAll(runbookDocs, [
      'npm install',
      'Java 21',
      'npx cap add ios',
      'npx cap add android',
      'Supabase Auth redirect URLs',
      'Native camera/photo capture',
      'TestFlight smoke',
    ]),
    'Native execution runbook defines the next concrete shell, service-config, and TestFlight steps.',
  )

  if (!results.every((result) => result.pass)) process.exitCode = 1
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
