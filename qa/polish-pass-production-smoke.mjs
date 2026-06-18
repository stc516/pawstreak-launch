import { chromium, devices } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE_URL = process.env.QA_BASE_URL || 'https://pawstreakapp.com'
const OUT_DIR = process.env.QA_OUT_DIR || path.join(__dirname, 'evidence', 'polish-pass-finish-production')

const SCREENS = [
  {
    id: 'home',
    label: 'Home',
    setup: async (page) => {
      await page.goto(`${BASE_URL}/demo/app`, { waitUntil: 'networkidle', timeout: 60000 })
      await page.evaluate(() => localStorage.clear())
      await page.reload({ waitUntil: 'networkidle', timeout: 60000 })
      await page.locator('.home-quick-walk-btn').first().waitFor({ state: 'visible', timeout: 15000 })
      await page.waitForTimeout(800)
    },
    checks: [
      { id: 'quick-walk', selector: 'button:has-text("Quick Walk")' },
      { id: 'todays-pick', selector: '.home-quick-adventure' },
      { id: 'plan-something-new', selector: '.home-plan-action:has-text("Training")' },
      { id: 'headline', selector: '.home-headline' },
    ],
  },
  {
    id: 'plan',
    label: 'Plan',
    setup: async (page) => {
      await page.getByRole('button', { name: 'Plan', exact: true }).click()
      await page.waitForTimeout(900)
    },
    checks: [
      { id: 'map', selector: '.plan-map-canvas' },
      { id: 'suggested', selector: '.plan-suggested-sec, .plan-build-curated-plan' },
      { id: 'no-challenges', selector: '.plan-challenge-list', expectMissing: true },
      { id: 'create-custom-adventure', selector: 'button:has-text("Create Custom Adventure")' },
    ],
  },
  {
    id: 'profile',
    label: 'Profile',
    setup: async (page) => {
      await page.getByRole('button', { name: 'Home', exact: true }).click()
      await page.waitForTimeout(500)
      await page.locator('.home-dog-pill').first().click()
      await page.waitForTimeout(800)
    },
    checks: [
      { id: 'pack-access', selector: '.profile-section:has-text("Pack Access")' },
      { id: 'no-training', selector: '.profile-section:has-text("Training")', expectMissing: true },
      { id: 'settings-btn', selector: '.profile-settings-btn' },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    setup: async (page) => {
      await page.locator('.profile-settings-btn').click()
      await page.waitForTimeout(800)
    },
    checks: [{ id: 'settings-screen', selector: '.settings-screen, .settings-row' }],
  },
  {
    id: 'quick-walk',
    label: 'Quick Walk',
    setup: async (page) => {
      await page.goto(`${BASE_URL}/demo/app`, { waitUntil: 'networkidle', timeout: 60000 })
      await page.locator('.home-quick-walk-btn').first().waitFor({ state: 'visible', timeout: 15000 })
      await page.getByRole('button', { name: 'Quick Walk' }).click()
      await page.waitForTimeout(800)
    },
    checks: [{ id: 'active-adventure-banner', selector: '[data-testid="active-adventure-banner"]' }],
  },
  {
    id: 'challenges',
    label: 'Challenges',
    setup: async (page) => {
      await page.goto(`${BASE_URL}/demo/app`, { waitUntil: 'networkidle', timeout: 60000 })
      await page.evaluate(() => localStorage.clear())
      await page.reload({ waitUntil: 'networkidle', timeout: 60000 })
      await page.getByRole('button', { name: 'Challenges', exact: true }).click()
      await page.waitForTimeout(900)
    },
    checks: [
      { id: 'discover-challenges', selector: '.ms-discover-sec' },
      { id: 'no-earned-tags', selector: '.ms-achievement-sec', expectMissing: true },
      { id: 'no-training', selector: '.ms-training-sec', expectMissing: true },
    ],
  },
]

function resolveCommit() {
  try {
    return execSync('git rev-parse HEAD', { cwd: path.join(__dirname, '..'), encoding: 'utf8' }).trim()
  } catch {
    return process.env.QA_COMMIT || 'unknown'
  }
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    ...devices['iPhone 13'],
    serviceWorkers: 'block',
  })
  const page = await context.newPage()
  const results = []

  for (const screen of SCREENS) {
    const entry = {
      id: screen.id,
      label: screen.label,
      pass: true,
      checks: [],
      screenshot: `${screen.id}.png`,
    }

    try {
      await screen.setup(page)
      await page.screenshot({
        path: path.join(OUT_DIR, `${screen.id}.png`),
        fullPage: true,
      })

      for (const check of screen.checks) {
        const count = await page.locator(check.selector).count()
        const present = check.expectMissing ? count === 0 : count > 0
        entry.checks.push({ ...check, present, pass: present })
        if (!present) entry.pass = false
      }
    } catch (error) {
      entry.pass = false
      entry.error = error instanceof Error ? error.message : String(error)
    }

    results.push(entry)
    console.log(`[${entry.pass ? 'PASS' : 'FAIL'}] ${screen.label}`)
  }

  await browser.close()

  const report = {
    commit: resolveCommit(),
    baseUrl: BASE_URL,
    device: 'iPhone 13',
    capturedAt: new Date().toISOString(),
    pass: results.every((item) => item.pass),
    screens: results,
  }

  await writeFile(path.join(OUT_DIR, 'report.json'), JSON.stringify(report, null, 2))
  console.log(`Report: ${path.join(OUT_DIR, 'report.json')}`)
  if (!report.pass) process.exit(1)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
