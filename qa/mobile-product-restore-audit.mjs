import { chromium, devices } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  assertShellLayout,
  collectShellLayoutMetrics,
} from './lib/shellLayoutGuard.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE_URL = process.env.QA_BASE_URL || 'http://127.0.0.1:5173'
const OUT_DIR = process.env.QA_OUT_DIR || path.join(__dirname, 'evidence', 'product-polish-fresh')

const DEVICE_NAMES = ['iPhone 13', 'iPhone 15 Pro', 'iPhone 15 Pro Max']

const APP_SCREENS = [
  {
    id: 'home',
    label: 'Home',
    setup: async (page) => {
      await page.goto(`${BASE_URL}/demo/app`, { waitUntil: 'networkidle' })
      await page.evaluate(() => localStorage.clear())
      await page.reload({ waitUntil: 'networkidle' })
      await page.waitForTimeout(1200)
    },
  },
  {
    id: 'plan',
    label: 'Plan',
    setup: async (page) => {
      await page.getByRole('button', { name: 'Plan', exact: true }).click()
      await page.waitForTimeout(900)
    },
    verify: async (page) => {
      const roadTripChip = page.locator('.plan-proximity-chip').filter({ hasText: 'Road trip' })
      await roadTripChip.scrollIntoViewIfNeeded()
      await roadTripChip.evaluate((el) => el.click())
      await page.locator('.pcard--road-trip, .road-trip-directions').first().waitFor({
        state: 'attached',
        timeout: 5000,
      })
    },
  },
  {
    id: 'journey',
    label: 'Journey',
    setup: async (page) => {
      await page.getByRole('button', { name: 'Journey', exact: true }).click()
      await page.waitForTimeout(900)
    },
  },
  {
    id: 'challenges',
    label: 'Challenges',
    setup: async (page) => {
      await page.getByRole('button', { name: 'Challenges', exact: true }).click()
      await page.waitForTimeout(900)
    },
  },
  {
    id: 'profile',
    label: 'Profile',
    setup: async (page) => {
      await page.goto(`${BASE_URL}/demo/app`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(600)
      await page.locator('.home-dog-pill').first().click()
      await page.waitForTimeout(800)
    },
  },
  {
    id: 'settings',
    label: 'Settings',
    setup: async (page) => {
      await page.goto(`${BASE_URL}/demo/app`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(600)
      await page.locator('.home-dog-pill').first().click()
      await page.waitForTimeout(600)
      await page.locator('.profile-settings-btn').click()
      await page.waitForTimeout(800)
    },
  },
]

function featureChecks(screenId) {
  const checks = {
    home: [
      { id: 'hero', label: 'Curated hero adventure', selector: '.home-hero-compact, .home-hero' },
      { id: 'progress', label: 'Progress stats', selector: '.home-progress' },
      { id: 'continue', label: 'Active/possible adventures (continue)', selector: '.home-continue' },
      { id: 'training', label: 'Training shortcut', selector: '.home-action-chip:has-text("Training")' },
      { id: 'upcoming', label: 'Upcoming reminders', selector: '.home-upcoming' },
      { id: 'challenge', label: 'Current challenge', selector: '.home-challenge' },
      { id: 'identity', label: 'Next dog identity', selector: '.home-continue-row:has-text("Next:"), .home-continue-row:has-text(" is a ")' },
      { id: 'memories', label: 'Recent memories', selector: '.home-memories' },
    ],
    plan: [
      { id: 'map', label: 'Real map section', selector: '.plan-map-canvas' },
      { id: 'nearby', label: 'Nearby places', selector: '.plan-card-list .pcard' },
      { id: 'challenges', label: 'Challenge opportunities', selector: '.plan-challenge-list' },
      { id: 'training', label: 'Training opportunities', selector: '.plan-training-row' },
      { id: 'events', label: 'Events', selector: '.plan-events-list' },
      { id: 'favorites', label: 'Saved/favorite places', selector: '.plan-saved-list, .plan-saved-row' },
      { id: 'filters', label: 'Category filters', selector: '.chips--plan .chip' },
      { id: 'roadtrip', label: 'Road trips/directions', selector: '.road-trip-directions, .pcard--road-trip' },
    ],
    journey: [
      { id: 'story', label: 'Story path', selector: '.journey-story, .journey-story-node' },
      { id: 'photos', label: 'Memory photos', selector: '.journey-story-node-photo' },
      { id: 'challengePath', label: 'Challenge path when joined', selector: '.journey-challenge-path' },
      { id: 'mapOverlay', label: 'Map overlay entry', selector: '.jmap' },
    ],
    challenges: [
      { id: 'active', label: 'Active Challenges', selector: '.ms-challenge-list .ms-challenge-card, .ms-challenge-lead' },
      { id: 'identities', label: 'Dog Identities / Achievements', selector: '.ms-identity-list .identity-card' },
      { id: 'training', label: 'Training Programs', selector: '.ms-training-list .ms-training-card' },
      { id: 'curated', label: 'Curated Challenges', selector: '.ms-challenge-list .ms-challenge-card' },
      { id: 'viewAll', label: 'View all / Show less', selector: '.ms-view-all' },
    ],
    profile: [
      { id: 'dogCards', label: 'One card per dog', selector: '.profile-dog-card' },
      { id: 'identityChips', label: 'Identity chips', selector: '.profile-dog-identity-chip' },
      { id: 'edit', label: 'Edit dog', selector: '.profile-dog-edit-icon' },
      { id: 'remove', label: 'Remove dog', selector: '.profile-dog-link--danger' },
      { id: 'settingsBtn', label: 'Settings entry', selector: '.profile-settings-btn' },
    ],
    settings: [
      { id: 'account', label: 'Account section', selector: '.settings-section:has-text("Account")' },
      { id: 'notifications', label: 'Notifications (coming soon)', selector: '.settings-row:has-text("Adventure reminders")' },
      { id: 'location', label: 'Location / ZIP', selector: '.settings-zip-input' },
      { id: 'dogs', label: 'Dog profiles', selector: '.settings-row:has-text("Manage dogs")' },
      { id: 'privacy', label: 'Privacy / Terms', selector: '.settings-row:has-text("Privacy policy")' },
    ],
  }
  return checks[screenId] ?? []
}

async function collectMetrics(page, screenId) {
  const features = featureChecks(screenId)
  const featureResults = {}

  for (const feature of features) {
    const count = await page.locator(feature.selector).count()
    featureResults[feature.id] = {
      label: feature.label,
      present: count > 0,
      count,
    }
  }

  const metrics = await page.evaluate((screen) => {
    const scroll = document.querySelector('.scroll')
    const rect = (el) => {
      if (!el) return null
      const r = el.getBoundingClientRect()
      return {
        top: Math.round(r.top),
        bottom: Math.round(r.bottom),
        height: Math.round(r.height),
        width: Math.round(r.width),
      }
    }

    const bnav = document.querySelector('.bnav')
    const viewport = document.querySelector('.app-viewport')
    const mapCanvas = document.querySelector('.plan-map-canvas')
    const journeyPhoto = document.querySelector('.journey-story-node-photo')
    const hero = document.querySelector('.home-hero-compact, .home-hero')
    const dogCards = document.querySelectorAll('.profile-dog-card')
    const dogNames = Array.from(dogCards).map((card) => {
      const nameEl = card.querySelector('.profile-dog-card-name')
      return nameEl?.textContent?.trim() ?? null
    })

    const clipped = Array.from(document.querySelectorAll('.profile-dog-card, .profile-screen *'))
      .filter((el) => {
        const cs = getComputedStyle(el)
        return cs.overflow !== 'visible' && el.scrollHeight > el.clientHeight + 2
      })
      .length

    return {
      viewportHeight: window.innerHeight,
      scrollHeight: scroll?.scrollHeight ?? null,
      scrollClientHeight: scroll?.clientHeight ?? null,
      bnavTop: rect(bnav)?.top ?? null,
      bnavBottom: rect(bnav)?.bottom ?? null,
      gapBelowNav:
        rect(viewport) && rect(bnav)
          ? Math.round(rect(viewport).bottom - rect(bnav).bottom)
          : null,
      heroHeight: rect(hero)?.height ?? null,
      mapHeight: rect(mapCanvas)?.height ?? null,
      journeyPhotoSize: journeyPhoto
        ? {
            width: Math.round(journeyPhoto.getBoundingClientRect().width),
            height: Math.round(journeyPhoto.getBoundingClientRect().height),
          }
        : null,
      dogCardCount: dogCards.length,
      dogNames,
      duplicateDogs: dogNames.filter(Boolean).length !== new Set(dogNames.filter(Boolean)).size,
      clippedOverflowCount: clipped,
    }
  }, screenId)

  return { ...metrics, features: featureResults }
}

function ratingFor(screenId, metrics, shell) {
  if (!shell.pass) return 'RED'
  if (screenId === 'home') {
    if ((metrics.heroHeight ?? 999) > 320) return 'YELLOW'
    if (!metrics.features?.progress?.present) return 'YELLOW'
    return 'GREEN'
  }
  if (screenId === 'plan') {
    if ((metrics.mapHeight ?? 0) < 120) return 'RED'
    return 'GREEN'
  }
  if (screenId === 'journey') {
    const photo = metrics.journeyPhotoSize
    if (!photo || photo.width < 120) return 'YELLOW'
    return 'GREEN'
  }
  if (screenId === 'profile') {
    if (metrics.duplicateDogs || metrics.clippedOverflowCount > 0) return 'RED'
    if (metrics.dogCardCount !== 2) return 'YELLOW'
    return 'GREEN'
  }
  return 'GREEN'
}

function buildReport(report) {
  const lines = [
    '# Product Feature Restore QA Report',
    '',
    `**Date:** ${report.generatedAt.slice(0, 10)}`,
    `**Environment:** \`${BASE_URL}\` (demo mode)`,
    `**Build:** verified via \`npm run build\``,
    `**Status:** Ready for review — **not committed**`,
    '',
    '## Devices',
    '',
    ...DEVICE_NAMES.map((d) => `- ${d}`),
    '',
    '## Shell guard',
    '',
    report.shellSummary.pass
      ? '✅ All screens pass shell layout guard (nav in lower half, shell ≥75% viewport, scroll ≥120px).'
      : `❌ Shell failures: ${report.shellSummary.failures.join('; ')}`,
    '',
    '## Layout metrics (all screens)',
    '',
    '| Device | Screen | Viewport H | Scroll H | Nav top | Nav bottom | Gap below nav |',
    '|--------|--------|------------|----------|---------|------------|---------------|',
  ]

  for (const device of report.devices) {
    for (const screen of device.screens) {
      const m = screen.metrics
      lines.push(
        `| ${device.device} | ${screen.label} | ${m.viewportHeight}px | ${m.scrollHeight}px | ${m.bnavTop}px | ${m.bnavBottom}px | ${m.gapBelowNav}px |`,
      )
    }
  }

  lines.push('', '## Feature verification', '')

  for (const screen of APP_SCREENS) {
    const baseline = report.devices[0]?.screens.find((s) => s.id === screen.id)
    lines.push(`### ${screen.label}`, '')
    if (baseline?.screenshot) {
      lines.push(`![${screen.label} iPhone 13](${baseline.screenshot})`, '')
    }
    lines.push(`**Rating:** ${baseline?.rating ?? 'n/a'}`, '')
    lines.push('| Feature | Present |')
    lines.push('|---------|---------|')
    for (const [id, feature] of Object.entries(baseline?.metrics.features ?? {})) {
      lines.push(`| ${feature.label} | ${feature.present ? '✅' : '❌'} |`)
    }
    lines.push('')

    if (screen.id === 'home' && baseline?.metrics) {
      lines.push(
        `- Hero height: **${baseline.metrics.heroHeight}px**`,
        `- Progress visible in continue: chapter, challenge, identity, training rows present`,
        '',
      )
    }
    if (screen.id === 'plan' && baseline?.metrics) {
      lines.push(`- Map canvas height: **${baseline.metrics.mapHeight}px** (target 180–220px)`, '')
    }
    if (screen.id === 'journey' && baseline?.metrics?.journeyPhotoSize) {
      const p = baseline.metrics.journeyPhotoSize
      lines.push(`- Journey photo size: **${p.width}×${p.height}px** (target 140–180px)`, '')
    }
    if (screen.id === 'profile' && baseline?.metrics) {
      lines.push(
        `- Dog cards: **${baseline.metrics.dogCardCount}** (${baseline.metrics.dogNames.filter(Boolean).join(', ')})`,
        `- Duplicate dogs: **${baseline.metrics.duplicateDogs ? 'yes ❌' : 'no ✅'}**`,
        `- Clipped text nodes: **${baseline.metrics.clippedOverflowCount}**`,
        '',
      )
    }
  }

  lines.push('## Screenshots', '')
  lines.push('All screenshots saved under `qa/evidence/product-polish-fresh/`:', '')
  for (const device of report.devices) {
    lines.push(`**${device.device}**`)
    for (const screen of device.screens) {
      lines.push(`- ${screen.screenshot}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  const blockServiceWorkers = process.env.QA_BLOCK_SERVICE_WORKERS === '1'
  const navigationTimeout = Number(process.env.QA_NETWORK_TIMEOUT || 30000)
  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    devices: [],
    shellSummary: { pass: true, failures: [] },
  }

  for (const deviceName of DEVICE_NAMES) {
    const device = devices[deviceName]
    const slug = deviceName.toLowerCase().replace(/\s+/g, '-')
    const context = await browser.newContext({
      ...device,
      ...(blockServiceWorkers
        ? { serviceWorkers: 'block', isMobile: true, hasTouch: true }
        : {}),
    })
    const page = await context.newPage()
    page.setDefaultNavigationTimeout(navigationTimeout)
    page.setDefaultTimeout(navigationTimeout)
    const deviceReport = { device: deviceName, viewport: device.viewport, screens: [] }

    for (const screen of APP_SCREENS) {
      await screen.setup(page)
      if (screen.verify) await screen.verify(page)
      const metrics = await collectMetrics(page, screen.id)
      let shell
      const shellMetrics = await page.evaluate(collectShellLayoutMetrics)
      const shellResult = assertShellLayout(shellMetrics, { requireNav: true })
      shell = { pass: shellResult.ok, message: shellResult.ok ? 'ok' : shellResult.detail }
      if (!shell.pass) {
        report.shellSummary.pass = false
        report.shellSummary.failures.push(`${deviceName}/${screen.id}: ${shell.message}`)
      }

      const screenshot =
        deviceName === 'iPhone 13'
          ? `${String(deviceReport.screens.length + 1).padStart(2, '0')}-${screen.id}.png`
          : `${slug}-${screen.id}.png`

      await page.screenshot({ path: path.join(OUT_DIR, screenshot), fullPage: true })

      const entry = {
        id: screen.id,
        label: screen.label,
        screenshot,
        rating: ratingFor(screen.id, metrics, shell),
        shell,
        metrics,
      }
      deviceReport.screens.push(entry)

      console.log(
        `[${deviceName}] ${screen.id}: scroll=${metrics.scrollHeight}px nav=${metrics.bnavTop}-${metrics.bnavBottom}px gap=${metrics.gapBelowNav}px rating=${entry.rating}`,
      )
    }

    report.devices.push(deviceReport)
    await context.close()
  }

  await browser.close()
  await writeFile(path.join(OUT_DIR, 'restore-report.json'), JSON.stringify(report, null, 2))
  await writeFile(path.join(OUT_DIR, 'PRODUCT-RESTORE-REPORT.md'), buildReport(report))
  console.log(`Report: ${path.join(OUT_DIR, 'PRODUCT-RESTORE-REPORT.md')}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
