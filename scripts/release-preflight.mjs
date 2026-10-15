import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const args = new Set(process.argv.slice(2))
const targetArg = process.argv.find((arg) => arg.startsWith('--target='))
const outputArg = process.argv.find((arg) => arg.startsWith('--output='))
const target = targetArg?.split('=')[1] ?? 'all'
const requireEnvironment = args.has('--require-env')
const requireSigning = args.has('--require-signing')
const outputPath = outputArg?.split('=')[1] ?? 'artifacts/release/preflight.json'
const checks = []

function record(id, pass, detail, required = true) {
  checks.push({ id, pass, required, detail })
  console.log(`[${pass ? 'PASS' : required ? 'FAIL' : 'INFO'}] ${id}: ${detail}`)
}

async function fileContains(file, snippets, id, detail) {
  try {
    const source = await readFile(file, 'utf8')
    record(id, snippets.every((snippet) => source.includes(snippet)), detail)
  } catch {
    record(id, false, `${detail} (${file} could not be read)`)
  }
}

function environmentPresent(name, validator = () => true) {
  const value = process.env[name]?.trim() ?? ''
  const pass = Boolean(value) && validator(value)
  record(
    `environment-${name.toLowerCase()}`,
    pass,
    pass ? `${name} is present and structurally valid; value not printed.` : `${name} is missing or structurally invalid.`,
    requireEnvironment,
  )
}

function signingPresent(name) {
  const pass = Boolean(process.env[name]?.trim())
  record(
    `signing-${name.toLowerCase()}`,
    pass,
    pass ? `${name} is present; value not printed.` : `${name} is missing.`,
    requireSigning,
  )
}

async function main() {
  if (!['all', 'android', 'ios'].includes(target)) {
    throw new Error(`Unknown target: ${target}`)
  }

  const pkg = JSON.parse(await readFile('package.json', 'utf8'))
  const cap = JSON.parse(await readFile('capacitor.config.json', 'utf8'))
  record('package-lock', await access('package-lock.json').then(() => true, () => false), 'Frozen npm lockfile exists.')
  record('capacitor-identity', cap.appId === 'com.pawstreak.app' && cap.appName === 'PawStreak', 'Capacitor app identity is PawStreak / com.pawstreak.app.')
  record('release-scripts', Boolean(pkg.scripts?.build && pkg.scripts?.['qa:release']), 'Build and release QA scripts are defined.')

  environmentPresent('VITE_SUPABASE_URL', (value) => /^https:\/\//.test(value) && !/YOUR_|example/i.test(value))
  environmentPresent('VITE_SUPABASE_ANON_KEY', (value) => value.length >= 20 && !/YOUR_|example/i.test(value))
  environmentPresent('VITE_SITE_URL', (value) => /^https:\/\/pawstreakapp\.com\/?$/.test(value))
  environmentPresent('VITE_MAPBOX_TOKEN', (value) => /^pk\./.test(value) && !/YOUR_|example/i.test(value))
  const versionName = process.env.PAWSTREAK_VERSION_NAME?.trim() ?? ''
  const versionCode = process.env.PAWSTREAK_VERSION_CODE?.trim() ?? ''
  record('release-version-name', /^\d+\.\d+\.\d+$/.test(versionName), 'PAWSTREAK_VERSION_NAME uses semantic x.y.z format.', requireEnvironment)
  record('release-build-number', /^[1-9]\d*$/.test(versionCode), 'PAWSTREAK_VERSION_CODE is a positive integer.', requireEnvironment)

  await fileContains(
    'ios/App/App/Info.plist',
    ['com.pawstreak.app', 'NSCameraUsageDescription', 'NSPhotoLibraryUsageDescription', 'NSLocationWhenInUseUsageDescription'],
    'ios-permissions',
    'iOS declares the app scheme and camera, photo, and foreground-location usage descriptions.',
  )
  await fileContains(
    'android/app/src/main/AndroidManifest.xml',
    ['android:scheme="com.pawstreak.app"', 'android.permission.ACCESS_COARSE_LOCATION', 'android.permission.ACCESS_FINE_LOCATION'],
    'android-permissions',
    'Android declares the app scheme and location permissions.',
  )

  if (target === 'all' || target === 'android') {
    await fileContains(
      'android/app/build.gradle',
      ['PAWSTREAK_KEYSTORE_PATH', 'PAWSTREAK_VERSION_CODE', 'signingConfigs'],
      'android-release-config',
      'Android release build accepts CI signing and version inputs.',
    )
    for (const name of ['PAWSTREAK_KEYSTORE_PATH', 'PAWSTREAK_KEYSTORE_PASSWORD', 'PAWSTREAK_KEY_ALIAS', 'PAWSTREAK_KEY_PASSWORD']) {
      signingPresent(name)
    }
  }

  if (target === 'all' || target === 'ios') {
    for (const name of [
      'APPLE_TEAM_ID',
      'APP_STORE_CONNECT_API_KEY_ID',
      'APP_STORE_CONNECT_ISSUER_ID',
      'APP_STORE_CONNECT_API_PRIVATE_KEY_BASE64',
      'IOS_DISTRIBUTION_CERTIFICATE_BASE64',
      'IOS_DISTRIBUTION_CERTIFICATE_PASSWORD',
      'IOS_PROVISIONING_PROFILE_BASE64',
    ]) {
      signingPresent(name)
    }
  }

  const report = {
    checkedAt: new Date().toISOString(),
    target,
    requireEnvironment,
    requireSigning,
    pass: checks.every((check) => check.pass || !check.required),
    checks,
  }
  await mkdir(path.dirname(outputPath), { recursive: true })
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`)
  console.log(`Release preflight evidence: ${outputPath}`)
  if (!report.pass) process.exitCode = 1
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
