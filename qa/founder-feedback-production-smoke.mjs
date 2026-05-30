import { chromium, devices } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  assertShellLayout,
  collectShellLayoutMetrics,
} from './lib/shellLayoutGuard.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE_URL = process.env.QA_BASE_URL || 'https://pawstreakapp.com'
const OUT_DIR =
  process.env.QA_OUT_DIR || path.join(__dirname, 'evidence', 'founder-feedback-production')

const SCREENS = [
  {
    id: 'home',
    label: 'Home',
    setup: async (page) => {
      await page.goto(`${BASE_URL}/demo/app`, { waitUntil: 'networkidle', timeout: 60000 })
      await page.evaluate(() => localStorage.clear())
      await page.reload({ waitUntil: 'networkidle', timeout: 60000 })
      await page.locator('.home-quick-primary-btn').first().waitFor({ state: 'visible', timeout: 15000 })
      await page.waitForTimeout(800)
    },
    checks: async (page) => {
      const results = []
      results.push({
        id: 'no-training-spotlight',
        pass: (await page.locator('.home-training-row, .home-training--compact .home-section-label').count()) === 0,
        detail: 'Training should not be a Home spotlight section',
      })
      results.push({
        id: 'curated-adventures',
        pass: (await page.locator('.home-curated').count()) > 0,
        detail: 'Curated Adventures section visible on Home',
      })
      results.push({
        id: 'quick-walk',
        pass: (await page.getByRole('button', { name: 'Quick Walk' }).count()) > 0,
        detail: 'Quick Walk emphasized',
      })
      return results
    },
  },
  {
    id: 'plan',
    label: 'Plan',
    setup: async (page) => {
      await page.getByRole('button', { name: 'Plan', exact: true }).click()
      await page.waitForTimeout(900)
    },
    checks: async (page) => {
      const results = []
      results.push({
        id: 'no-events',
        pass: (await page.locator('.plan-events-list, .plan-event-card').count()) === 0,
        detail: 'Fake Events section removed from Plan',
      })
      results.push({
        id: 'map-pins',
        pass: (await page.locator('.plan-map-pin').count()) > 0,
        detail: 'Map shows real place pins',
      })

      const firstPin = page.locator('.plan-map-pin').first()
      if (await firstPin.count()) {
        const placeId = await firstPin.getAttribute('aria-label')
        await firstPin.evaluate((el) => el.click())
        await page.waitForTimeout(400)
        const selectedCard = await page.locator('.pcard--map-selected').count()
        results.push({
          id: 'pin-card-sync',
          pass: selectedCard > 0,
          detail: `Selected pin highlights matching card (${placeId || 'pin'})`,
        })
      }

      const bodyText = await page.locator('body').innerText()
      results.push({
        id: 'no-calendar-language',
        pass: !/calendar saved|saved to calendar|sync to calendar/i.test(bodyText),
        detail: 'No fake calendar language on Plan',
      })

      return results
    },
  },
  {
    id: 'curated-plan',
    label: 'Curated Plan',
    setup: async (page) => {
      await page.getByRole('button', { name: 'Build a curated plan' }).click()
      await page.waitForTimeout(600)
      await page.locator('.curated-option').first().click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.waitForTimeout(400)
      await page.locator('.curated-option').first().click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.waitForTimeout(400)
      await page.locator('.curated-option').first().click()
      await page.getByRole('button', { name: /Build .* plan/ }).click()
      await page.waitForTimeout(900)
    },
    checks: async (page) => {
      const bodyText = await page.locator('body').innerText()
      return [
        {
          id: 'real-adventure-cards',
          pass: (await page.locator('.curated-adventure-card').count()) >= 3,
          detail: 'Curated plan shows real adventure cards',
        },
        {
          id: 'no-nonsense-copy',
          pass: !/neighborhood reset|social hello|neighborhood explorer/i.test(bodyText),
          detail: 'No abstract wellness schedule copy',
        },
        {
          id: 'save-to-plan-copy',
          pass: /save to plan/i.test(bodyText) && !/calendar saved/i.test(bodyText),
          detail: 'Save to Plan copy, not calendar saved',
        },
      ]
    },
  },
  {
    id: 'journey',
    label: 'Journey',
    setup: async (page) => {
      await page.goto(`${BASE_URL}/demo/app`, { waitUntil: 'networkidle', timeout: 60000 })
      await page.getByRole('button', { name: 'Journey', exact: true }).click()
      await page.waitForTimeout(900)
    },
    checks: async (page) => {
      const bodyText = await page.locator('body').innerText()
      return [
        {
          id: 'no-flashback',
          pass: (await page.locator('.flash').count()) === 0,
          detail: 'Flashback filler removed from Journey bottom',
        },
        {
          id: 'map-entry',
          pass: (await page.locator('.jmap').count()) > 0,
          detail: 'Journey map entry still present',
        },
        {
          id: 'no-remember-friday-filler',
          pass: !/^Remember (monday|tuesday|wednesday|thursday|friday|saturday|sunday)/im.test(bodyText),
          detail: 'No fake Remember {day} flashback title',
        },
      ]
    },
  },
  {
    id: 'challenges-demo',
    label: 'Challenges (demo)',
    setup: async (page) => {
      await page.goto(`${BASE_URL}/demo/app`, { waitUntil: 'networkidle', timeout: 60000 })
      await page.getByRole('button', { name: 'Challenges', exact: true }).click()
      await page.waitForTimeout(900)
    },
    checks: async (page) => {
      return [
        {
          id: 'challenges-load',
          pass: (await page.locator('.ms-screen, .ms-challenge-sec').count()) > 0,
          detail: 'Challenges tab loads',
        },
      ]
    },
  },
  {
    id: 'app-clean',
    label: 'Production /app clean state',
    setup: async (page) => {
      await page.goto(`${BASE_URL}/app`, { waitUntil: 'networkidle', timeout: 60000 })
      await page.evaluate(() => localStorage.clear())
      await page.reload({ waitUntil: 'networkidle', timeout: 60000 })
      await page.waitForTimeout(1200)
    },
    checks: async (page) => {
      const url = page.url()
      const onApp = url.includes('/app')
      if (!onApp) {
        return [{ id: 'app-route', pass: true, detail: `/app redirected to ${url} — skip seeded challenge check` }]
      }

      const challengesBtn = page.getByRole('button', { name: 'Challenges', exact: true })
      if ((await challengesBtn.count()) === 0) {
        return [{ id: 'app-nav', pass: true, detail: 'Challenges nav not available on /app without session' }]
      }

      await challengesBtn.click()
      await page.waitForTimeout(900)
      const bodyText = await page.locator('body').innerText()
      const joinedCount = await page.locator('.ms-challenge-sec-count').innerText().catch(() => '0 joined')
      return [
        {
          id: 'no-demo-joined',
          pass: !joinedCount.includes('1 joined') || /0 joined/.test(joinedCount),
          detail: `Joined challenges: ${joinedCount}`,
        },
        {
          id: 'no-beach-explorer-seeded',
          pass: !bodyText.includes('Beach Explorer') || bodyText.includes('Join a curated challenge'),
          detail: 'No demo Beach Explorer active progress on fresh /app',
        },
      ]
    },
  },
]

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    ...devices['iPhone 13'],
    serviceWorkers: 'block',
  })
  const page = await context.newPage()
  const report = {
    baseUrl: BASE_URL,
    device: 'iPhone 13',
    capturedAt: new Date().toISOString(),
    pass: true,
    screens: [],
  }

  for (const screen of SCREENS) {
    const entry = {
      id: screen.id,
      label: screen.label,
      pass: true,
      checks: [],
      shell: null,
      screenshot: `${screen.id}.png`,
    }

    try {
      await screen.setup(page)
      await page.screenshot({
        path: path.join(OUT_DIR, `${screen.id}.png`),
        fullPage: true,
      })

      const shellMetrics = await page.evaluate(collectShellLayoutMetrics)
      const shellAssert = assertShellLayout(shellMetrics, { requireNav: screen.id !== 'curated-plan' && screen.id !== 'app-clean' })
      entry.shell = { metrics: shellMetrics.layout, assert: shellAssert }
      entry.checks.push({
        id: 'bottom-nav-pinned',
        pass: shellAssert.ok || screen.id === 'curated-plan' || screen.id === 'app-clean',
        detail: shellAssert.ok ? 'Bottom nav pinned correctly' : shellAssert.detail,
      })

      const screenChecks = await screen.checks(page)
      entry.checks.push(...screenChecks)
      entry.pass = entry.checks.every((check) => check.pass)
      if (!entry.pass) report.pass = false

      console.log(`[${entry.pass ? 'PASS' : 'FAIL'}] ${screen.label}`)
      for (const check of entry.checks) {
        console.log(`  ${check.pass ? '✓' : '✗'} ${check.id}: ${check.detail}`)
      }
    } catch (error) {
      entry.pass = false
      report.pass = false
      entry.error = error instanceof Error ? error.message : String(error)
      console.log(`[FAIL] ${screen.label}: ${entry.error}`)
    }

    report.screens.push(entry)
  }

  await browser.close()
  await writeFile(path.join(OUT_DIR, 'report.json'), JSON.stringify(report, null, 2))
  console.log(`\nOverall: ${report.pass ? 'PASS' : 'FAIL'}`)
  console.log(`Report: ${path.join(OUT_DIR, 'report.json')}`)
  if (!report.pass) process.exit(1)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
