/**
 * Phase 1 — global active adventure (banner + tab navigation).
 *
 *   QA_BASE_URL=http://127.0.0.1:4190 node qa/active-adventure-global.mjs
 */
import { chromium, devices } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE_URL = process.env.QA_BASE_URL || 'http://127.0.0.1:4190'
const OUT_DIR =
  process.env.QA_OUT_DIR || path.join(__dirname, 'evidence', 'active-adventure-global')

const iPhone = devices['iPhone 13']
const NAV_TABS = ['Home', 'Plan', 'Journey', 'Challenges', 'Achievements', 'Community']

async function openDemo(page) {
  await page.goto(`${BASE_URL}/demo/app`, { waitUntil: 'load', timeout: 90000 })
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
  await page.reload({ waitUntil: 'load', timeout: 90000 })
  await page.locator('.home-dog-pill').first().waitFor({ state: 'visible', timeout: 30000 })
  await page.waitForTimeout(800)
}

async function goTab(page, label) {
  await page.locator('.bnav').getByRole('button', { name: label, exact: true }).click()
  await page.waitForTimeout(650)
}

async function readState(page) {
  return page.evaluate(() => {
    const raw = localStorage.getItem('pawstreak:demo')
    if (!raw) return null
    const s = JSON.parse(raw)
    return {
      activeAdventure: !!s.activeAdventure,
      started: s.activeAdventure?.started,
      view: s.activeAdventureView,
      journeyCount: s.journeyEntries?.length ?? 0,
    }
  })
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  const results = []

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    ...iPhone,
    isMobile: true,
    serviceWorkers: 'block',
  })
  const page = await context.newPage()

  const check = (id, pass, detail) => {
    results.push({ id, pass, detail })
    console.log(`${pass ? 'PASS' : 'FAIL'} ${id}: ${detail}`)
  }

  await openDemo(page)

  await page.locator('.home-quick-walk-btn').click()
  await page.waitForTimeout(900)

  const bannerVisible = await page.locator('[data-testid="active-adventure-banner"]').isVisible()
  const bnavVisible = await page.locator('.bnav').first().isVisible()
  check(
    'quick-walk-banner-and-nav',
    bannerVisible && bnavVisible,
    `banner=${bannerVisible} bnav=${bnavVisible}`,
  )
  await page.screenshot({ path: path.join(OUT_DIR, '01-quick-walk-banner.png') })

  for (const tab of NAV_TABS) {
    await goTab(page, tab)
    const still = await readState(page)
    const tabBanner = await page.locator('[data-testid="active-adventure-banner"]').isVisible()
    check(
      `nav-${tab.toLowerCase()}-active`,
      still?.activeAdventure && tabBanner,
      `${tab}: adventure=${still?.activeAdventure} banner=${tabBanner}`,
    )
  }

  await page.reload({ waitUntil: 'load', timeout: 90000 })
  await page.locator('.home-dog-pill').first().waitFor({ state: 'visible', timeout: 30000 })
  await page.waitForTimeout(800)
  const afterReload = await readState(page)
  const bannerAfterReload = await page.locator('[data-testid="active-adventure-banner"]').isVisible()
  check(
    'reload-persists-adventure',
    afterReload?.activeAdventure && bannerAfterReload,
    JSON.stringify(afterReload),
  )

  await page.getByRole('button', { name: 'Resume', exact: true }).click()
  await page.waitForTimeout(700)
  const focusedClock = await page.locator('.clock-bg--active').isVisible()
  check('resume-opens-focused', focusedClock, `clock=${focusedClock}`)

  await page.locator('.active-adventure-minimize').click()
  await page.waitForTimeout(600)
  const bannerAfterMinimize = await page.locator('[data-testid="active-adventure-banner"]').isVisible()
  check('minimize-back-to-banner', bannerAfterMinimize, `banner=${bannerAfterMinimize}`)

  const journeyBefore = (await readState(page))?.journeyCount ?? 0
  await page.getByRole('button', { name: 'Finish', exact: true }).click()
  await page.waitForTimeout(1200)
  const afterFinish = await readState(page)
  await goTab(page, 'Journey')
  const journeyAfter = (await readState(page))?.journeyCount ?? 0
  check(
    'finish-clears-adventure-saves-memory',
    !afterFinish?.activeAdventure && journeyAfter > journeyBefore,
    `journey ${journeyBefore}→${journeyAfter} active=${afterFinish?.activeAdventure}`,
  )

  await openDemo(page)
  await page.locator('.home-quick-walk-btn').click()
  await page.waitForTimeout(800)
  const journeyBeforeCancel = (await readState(page))?.journeyCount ?? 0
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await page.waitForTimeout(800)
  const afterCancel = await readState(page)
  const journeyAfterCancel = (await readState(page))?.journeyCount ?? 0
  check(
    'cancel-clears-no-memory',
    !afterCancel?.activeAdventure && journeyAfterCancel === journeyBeforeCancel,
    `journey stayed ${journeyAfterCancel}`,
  )

  await openDemo(page)
  await page.locator('section[aria-label="Build My Month"] button').click()
  await page.waitForTimeout(500)
  await page.getByRole('button', { name: /Dog park/i }).click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.getByRole('button', { name: /1 adventure per week/i }).click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.getByRole('button', { name: 'Weekends', exact: true }).click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.getByRole('button', { name: 'Save plan', exact: true }).click()
  await page.waitForTimeout(800)
  const planGo = page.locator('.home-active-plan .st-btn--forest').first()
  if ((await planGo.count()) > 0) {
    await planGo.click()
    await page.waitForTimeout(700)
    if ((await page.getByRole('button', { name: 'Start adventure', exact: true }).count()) > 0) {
      await page.getByRole('button', { name: 'Start adventure', exact: true }).click()
      await page.waitForTimeout(500)
    }
    await page.getByRole('button', { name: 'Finish', exact: true }).click()
    await page.waitForTimeout(1200)
    check('monthly-plan-go-finishes', true, 'monthly plan adventure completed from banner/focus')
  }

  await goTab(page, 'Community')
  const comm = await page.locator('body').innerText()
  check(
    'community-coming-soon',
    comm.includes('Coming soon') && !comm.includes('packs joined'),
    'Community honest',
  )

  await goTab(page, 'Home')
  await page.locator('.home-dog-pill').click()
  await page.waitForTimeout(700)
  const profNav = await page.locator('.bnav').getByRole('button', { name: 'Profile', exact: true }).count()
  check('profile-not-in-nav', profNav === 0, 'Profile only via pill')

  await browser.close()

  const report = { baseUrl: BASE_URL, results, pass: results.every((r) => r.pass) }
  await writeFile(path.join(OUT_DIR, 'report.json'), JSON.stringify(report, null, 2))
  console.log('\nEvidence:', OUT_DIR)
  process.exit(report.pass ? 0 : 1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
