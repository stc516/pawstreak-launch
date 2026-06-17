#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const ROOT = process.cwd()

const checks = []

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8')
}

function record(id, pass, detail) {
  checks.push({ id, pass, detail })
}

function assertNoBanned(file, banned) {
  const source = read(file)
  for (const phrase of banned) {
    record(
      `${file}:no-${phrase.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      !source.includes(phrase),
      `${file} ${source.includes(phrase) ? 'still contains' : 'does not contain'} "${phrase}"`,
    )
  }
}

assertNoBanned('src/components/LandingPhonePreview.tsx', [
  'Dog Beach morning',
  'Sunny morning run',
  '2.4 mi · Off-leash · San Diego',
])

assertNoBanned('src/components/OnboardingEntryPreview.tsx', [
  'Dog Beach morning',
  'Sunny morning run',
])

assertNoBanned('src/screens/onboarding/OnboardingFlow.tsx', [
  'SoCal Beach Challenge',
  '6 beaches. 1 month. Starts now.',
])

const onboarding = read('src/screens/onboarding/OnboardingFlow.tsx')
record(
  'onboarding-location-starts-blank',
  onboarding.includes("useState('')") &&
    !onboarding.includes("const [locationQuery, setLocationQuery] = useState('92123')"),
  'Onboarding location input starts blank instead of defaulting to San Diego ZIP 92123',
)

const onboardingProfile = read('src/lib/onboardingProfile.ts')
record(
  'supported-copy-region-specific',
  onboardingProfile.includes("'Suggested Spots in San Diego'") &&
    !onboardingProfile.includes("'Suggested Spots in San Diego & OC'"),
  'Supported onboarding copy is region-specific, not San Diego & OC by default',
)

const appDataSync = read('src/lib/appDataSync.ts')
record(
  'production-initial-location-unsupported',
  appDataSync.includes("locationLabel: 'Your area'") &&
    appDataSync.includes('locationSupported: false'),
  'Production initial state does not claim a supported San Diego location before onboarding',
)

const randomPlan = read('src/lib/randomPlan.ts')
record(
  'surprise-me-unsupported-generic',
  randomPlan.includes('GENERIC_ADVENTURE_TYPES') &&
    randomPlan.includes('locationSupported') &&
    randomPlan.includes('recommendedSpots: supported'),
  'Surprise Me uses generic adventure ideas when the user is outside supported markets',
)

const app = read('src/App.tsx')
record(
  'unsupported-start-adventure-guard',
  app.includes('!state.locationSupported') &&
    app.includes('startNeighborhoodWalk()') &&
    app.includes('CUSTOM_ADVENTURE_PLACE_ID'),
  'Unsupported users cannot accidentally start catalog SoCal places from stale/detail actions',
)

const plan = read('src/screens/app/PlanScreen.tsx')
record(
  'surprise-me-visible-result',
  plan.includes('data-testid="plan-random-result"') &&
    plan.includes('state.randomPlanResult.recommendedSpots'),
  'Surprise Me renders a visible result panel on Plan',
)

const failed = checks.filter((check) => !check.pass)
for (const check of checks) {
  console.log(`${check.pass ? 'PASS' : 'FAIL'} ${check.id} — ${check.detail}`)
}

if (failed.length > 0) {
  console.error(`\nlaunch-trust guard failed: ${failed.length}/${checks.length}`)
  process.exit(1)
}

console.log(`\nlaunch-trust guard passed: ${checks.length}/${checks.length}`)
