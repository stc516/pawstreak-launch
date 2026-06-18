/**
 * Run before deploy. Fails fast if the mobile app shell collapses on any main tab.
 *
 *   npm run dev
 *   npm run qa:shell-guard
 *
 * Or against preview (block SW in script):
 *   npm run build && npm run preview &
 *   QA_BASE_URL=http://127.0.0.1:4173 npm run qa:shell-guard
 */
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
const OUT_DIR =
  process.env.QA_OUT_DIR || path.join(__dirname, 'evidence', 'mobile-shell-guard')

const APP_TABS = [
  { id: 'home', label: 'Home' },
  { id: 'plan', label: 'Plan' },
  { id: 'journey', label: 'Journey' },
  { id: 'challenges', label: 'Challenges' },
  { id: 'community', label: 'Community' },
]

async function openDemoApp(page) {
  await page.goto(`${BASE_URL}/demo/app`, { waitUntil: 'networkidle', timeout: 60000 })
  await page.evaluate(() => localStorage.clear())
  await page.reload({ waitUntil: 'networkidle', timeout: 60000 })
  await page.locator('.home-dog-pill').first().waitFor({ state: 'visible', timeout: 15000 })
}

async function checkScreen(page, screen) {
  if (screen.label !== 'Home') {
    await page.getByRole('button', { name: screen.label, exact: true }).click()
    await page.waitForTimeout(500)
  }

  const metrics = await page.evaluate(collectShellLayoutMetrics)
  const result = assertShellLayout(metrics, { requireNav: true })

  return { screen: screen.id, metrics, result }
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    ...devices['iPhone 13'],
    isMobile: true,
    hasTouch: true,
    serviceWorkers: 'block',
  })
  const page = await context.newPage()

  const results = []

  try {
    await openDemoApp(page)

    for (const screen of APP_TABS) {
      const checked = await checkScreen(page, screen)
      results.push(checked)

      const status = checked.result.ok ? 'PASS' : 'FAIL'
      console.log(
        `[${status}] ${screen.id}: ${checked.result.ok ? 'shell ok' : `${checked.result.code} — ${checked.result.detail}`}`,
      )

      if (!checked.result.ok) {
        await page.screenshot({
          path: path.join(OUT_DIR, `fail-${screen.id}.png`),
          fullPage: false,
        })
      }
    }

    await page.getByRole('button', { name: 'Challenges', exact: true }).click()
    await page.waitForTimeout(400)
    await page.getByRole('button', { name: /Badges & Achievements/i }).click()
    await page.waitForTimeout(500)
    const achievementsMetrics = await page.evaluate(collectShellLayoutMetrics)
    const achievementsResult = assertShellLayout(achievementsMetrics, { requireNav: true })
    results.push({
      screen: 'achievements',
      metrics: achievementsMetrics,
      result: achievementsResult,
    })
    console.log(
      `[${achievementsResult.ok ? 'PASS' : 'FAIL'}] achievements: ${
        achievementsResult.ok
          ? 'shell ok'
          : `${achievementsResult.code} — ${achievementsResult.detail}`
      }`,
    )
    if (!achievementsResult.ok) {
      await page.screenshot({
        path: path.join(OUT_DIR, 'fail-achievements.png'),
        fullPage: false,
      })
    }

    // Profile uses header pill, not bottom nav — still must fill the shell.
    // Profile opens from the dog pill on Home.
    await page.getByRole('button', { name: 'Home', exact: true }).click()
    await page.waitForTimeout(400)
    await page.locator('.home-dog-pill').click()
    await page.waitForTimeout(500)
    const profileMetrics = await page.evaluate(collectShellLayoutMetrics)
    const profileResult = assertShellLayout(profileMetrics, { requireNav: true })
    results.push({ screen: 'profile', metrics: profileMetrics, result: profileResult })
    console.log(
      `[${profileResult.ok ? 'PASS' : 'FAIL'}] profile: ${
        profileResult.ok ? 'shell ok' : `${profileResult.code} — ${profileResult.detail}`
      }`,
    )
    if (!profileResult.ok) {
      await page.screenshot({
        path: path.join(OUT_DIR, 'fail-profile.png'),
        fullPage: false,
      })
    }
  } finally {
    await browser.close()
  }

  const report = {
    baseUrl: BASE_URL,
    checkedAt: new Date().toISOString(),
    results: results.map(({ screen, result, metrics }) => ({
      screen,
      pass: result.ok,
      code: result.ok ? null : result.code,
      detail: result.ok ? null : result.detail,
      shellFillRatio: metrics.layout.shellFillRatio,
      navCenterY: metrics.layout.navCenterY,
      scrollClientHeight: metrics.heights.scrollClientHeight,
    })),
  }

  await writeFile(
    path.join(OUT_DIR, 'report.json'),
    `${JSON.stringify(report, null, 2)}\n`,
  )

  const failures = report.results.filter((item) => !item.pass)
  if (failures.length > 0) {
    console.error(`\nShell guard failed on: ${failures.map((f) => f.screen).join(', ')}`)
    console.error(`Evidence: ${OUT_DIR}`)
    process.exit(1)
  }

  console.log(`\nShell guard passed (${report.results.length} screens). Evidence: ${OUT_DIR}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
