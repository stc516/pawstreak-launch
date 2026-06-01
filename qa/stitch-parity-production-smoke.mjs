import { chromium, devices } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE_URL = process.env.QA_BASE_URL || 'https://pawstreakapp.com'
const OUT_DIR = process.env.QA_OUT_DIR || path.join(__dirname, 'evidence', 'stitch-parity-production')

const SCREENS = [
  {
    id: '01-home',
    label: 'Home',
    setup: async (page) => {
      await page.goto(`${BASE_URL}/demo/app`, { waitUntil: 'networkidle', timeout: 60000 })
      await page.evaluate(() => localStorage.clear())
      await page.reload({ waitUntil: 'networkidle', timeout: 60000 })
      await page.locator('.home-dog-pill').first().waitFor({ state: 'visible', timeout: 15000 })
      await page.waitForTimeout(800)
    },
    checks: [
      { id: 'no-training-tools', selector: '.st-training-row-wrap', expectMissing: true },
      { id: 'quick-grid', selector: '.st-quick-grid' },
      { id: 'suggested-spots', selector: '.home-suggested-spots' },
      { id: 'suggested-after-quick', fn: async (page) => {
        return page.evaluate(() => {
          const quick = document.querySelector('.st-quick-grid')
          const suggested = document.querySelector('.home-suggested-spots')
          if (!quick || !suggested) return false
          return quick.compareDocumentPosition(suggested) & Node.DOCUMENT_POSITION_FOLLOWING
        })
      }},
      { id: 'bottom-nav-pinned', selector: '.app-shell-footer .bnav' },
    ],
  },
  {
    id: '04-challenges',
    label: 'Challenges',
    setup: async (page) => {
      await page.getByRole('button', { name: 'Challenges', exact: true }).click()
      await page.waitForTimeout(900)
    },
    checks: [
      { id: 'discover-challenges', selector: '.ms-discover-sec' },
      { id: 'no-earned-tags', selector: '.ms-achievement-sec', expectMissing: true },
      { id: 'no-training', selector: '.ms-training-sec', expectMissing: true },
      { id: 'bottom-nav', selector: '.app-shell-footer .bnav' },
    ],
  },
  {
    id: '05-profile',
    label: 'Profile',
    setup: async (page) => {
      await page.getByRole('button', { name: 'Home', exact: true }).click()
      await page.waitForTimeout(500)
      await page.locator('.home-dog-pill').first().click()
      await page.waitForTimeout(800)
    },
    checks: [
      { id: 'dog-stack', selector: '.profile-dog-stack' },
      { id: 'no-dog-scroll', selector: '.profile-dog-scroll', expectMissing: true },
      { id: 'both-dogs-no-horizontal-scroll', fn: async (page) => {
        return page.evaluate(() => {
          const stack = document.querySelector('.profile-dog-stack')
          if (!stack) return false
          const cards = stack.querySelectorAll('.profile-dog-card--compact')
          if (cards.length < 2) return cards.length >= 1
          return stack.scrollWidth <= stack.clientWidth + 2
        })
      }},
      { id: 'earned-tags', selector: '.profile-section:has-text("Earned Tags")' },
      { id: 'training', selector: '.profile-section:has-text("Training")' },
    ],
  },
  {
    id: '06-settings',
    label: 'Settings',
    setup: async (page) => {
      await page.locator('.profile-settings-btn').click()
      await page.waitForTimeout(600)
    },
    checks: [
      { id: 'zip-section', selector: '.settings-section-label:has-text("Location / ZIP")' },
      { id: 'zip-input', selector: '.settings-zip-input' },
      { id: 'manage-dogs', selector: '.settings-row-title:has-text("Manage dogs")' },
      { id: 'privacy', selector: '.settings-section-label:has-text("Privacy")' },
      { id: 'sign-out', selector: '.settings-signout--stitch' },
      { id: 'bottom-nav', selector: '.app-shell-footer .bnav' },
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

async function runCheck(page, check) {
  if (check.fn) {
    const pass = await check.fn(page)
    return { ...check, pass }
  }
  const count = await page.locator(check.selector).count()
  const pass = check.expectMissing ? count === 0 : count > 0
  return { ...check, pass, present: check.expectMissing ? count === 0 : count > 0 }
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
    const entry = { id: screen.id, label: screen.label, pass: true, checks: [], screenshot: `${screen.id}.png` }
    try {
      await screen.setup(page)
      await page.screenshot({ path: path.join(OUT_DIR, `${screen.id}.png`), fullPage: true })
      for (const check of screen.checks) {
        const result = await runCheck(page, check)
        entry.checks.push(result)
        if (!result.pass) entry.pass = false
      }
    } catch (error) {
      entry.pass = false
      entry.error = error instanceof Error ? error.message : String(error)
    }
    results.push(entry)
    console.log(`[${entry.pass ? 'PASS' : 'FAIL'}] ${screen.label}`)
    for (const check of entry.checks) {
      if (!check.pass) console.log(`  FAIL ${check.id}`)
    }
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
