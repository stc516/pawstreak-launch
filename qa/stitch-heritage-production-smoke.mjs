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
  process.env.QA_OUT_DIR || path.join(__dirname, 'evidence', 'stitch-heritage-production')

const SCREENS = [
  {
    id: '01-home',
    setup: async (page) => {
      await page.goto(`${BASE_URL}/demo/app`, { waitUntil: 'networkidle', timeout: 60000 })
      await page.evaluate(() => localStorage.clear())
      await page.reload({ waitUntil: 'networkidle', timeout: 60000 })
      await page.getByRole('button', { name: 'Quick Walk' }).waitFor({ state: 'visible', timeout: 15000 })
      await page.waitForTimeout(800)
    },
  },
  {
    id: '02-plan',
    setup: async (page) => {
      await page.getByRole('button', { name: 'Plan', exact: true }).click()
      await page.waitForTimeout(900)
    },
  },
  {
    id: '03-journey',
    setup: async (page) => {
      await page.getByRole('button', { name: 'Journey', exact: true }).click()
      await page.locator('.journey-story-track').first().waitFor({ state: 'visible', timeout: 15000 })
      await page.waitForTimeout(900)
    },
  },
  {
    id: '04-challenges',
    setup: async (page) => {
      await page.getByRole('button', { name: 'Challenges', exact: true }).click()
      await page.waitForTimeout(900)
    },
  },
  {
    id: '05-profile',
    setup: async (page) => {
      await page.getByRole('button', { name: 'Home', exact: true }).click()
      await page.waitForTimeout(500)
      await page.locator('.home-dog-pill').first().click()
      await page.waitForTimeout(800)
    },
  },
  {
    id: '06-settings',
    setup: async (page) => {
      await page.locator('.profile-settings-btn').click()
      await page.waitForTimeout(800)
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
      pass: true,
      screenshot: `${screen.id}.png`,
      shell: null,
      error: null,
    }

    try {
      await screen.setup(page)
      await page.screenshot({
        path: path.join(OUT_DIR, `${screen.id}.png`),
        fullPage: true,
      })

      const metrics = await page.evaluate(collectShellLayoutMetrics)
      const shell = assertShellLayout(metrics, { requireNav: true })
      entry.shell = {
        ok: shell.ok,
        code: shell.ok ? null : shell.code,
        detail: shell.ok ? null : shell.detail,
      }
      if (!shell.ok) {
        entry.pass = false
        report.pass = false
      }

      console.log(`[${entry.pass ? 'PASS' : 'FAIL'}] ${screen.id}`)
    } catch (error) {
      entry.pass = false
      report.pass = false
      entry.error = error instanceof Error ? error.message : String(error)
      console.log(`[FAIL] ${screen.id}: ${entry.error}`)
    }

    report.screens.push(entry)
  }

  await browser.close()
  await writeFile(path.join(OUT_DIR, 'report.json'), `${JSON.stringify(report, null, 2)}\n`)
  console.log(`\nOverall: ${report.pass ? 'PASS' : 'FAIL'}`)
  console.log(`Evidence: ${OUT_DIR}`)
  if (!report.pass) process.exit(1)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
