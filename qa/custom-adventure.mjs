/**
 * Phase 2 — Custom / Add Adventure v2
 *
 *   QA_BASE_URL=http://127.0.0.1:4190 node qa/custom-adventure.mjs
 */
import { chromium, devices } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE_URL = process.env.QA_BASE_URL || 'http://127.0.0.1:4190'
const OUT_DIR =
  process.env.QA_OUT_DIR || path.join(__dirname, 'evidence', 'custom-adventure')

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

async function readDemoState(page) {
  return page.evaluate(() => {
    const raw = localStorage.getItem('pawstreak:demo')
    if (!raw) return null
    return JSON.parse(raw)
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

  // CA-1: Plan entry + title validation
  await goTab(page, 'Plan')
  await page.locator('[data-testid="journey-add-adventure"]').click()
  await page.waitForTimeout(500)
  const startDisabledEmpty = await page
    .locator('[data-testid="add-adventure-start-now"]')
    .isDisabled()
  const saveDisabledEmpty = await page
    .locator('[data-testid="add-adventure-save-later"]')
    .isDisabled()
  check(
    'title-validation',
    startDisabledEmpty && saveDisabledEmpty,
    `start disabled=${startDisabledEmpty} save disabled=${saveDisabledEmpty}`,
  )
  await page.screenshot({ path: path.join(OUT_DIR, '01-title-validation.png') })

  await page.locator('[data-testid="add-adventure-title"]').fill('Golf Day')
  await page.waitForTimeout(200)

  // Dog multi-select: deselect one then reselect
  const dogButtons = page.locator('[data-testid="add-adventure-dogs"] button')
  const dogCount = await dogButtons.count()
  if (dogCount >= 2) {
    await dogButtons.nth(1).click()
    await page.waitForTimeout(200)
    let state = await readDemoState(page)
    const oneDog = state?.addAdventureDraft?.selectedDogIds?.length === 1
    await dogButtons.nth(1).click()
    await page.waitForTimeout(200)
    state = await readDemoState(page)
    const twoDogs = (state?.addAdventureDraft?.selectedDogIds?.length ?? 0) >= 2
    check('dog-multiselect', oneDog && twoDogs, `oneDog=${oneDog} twoDogs=${twoDogs}`)
  } else {
    check('dog-multiselect', dogCount >= 1, `dog buttons=${dogCount}`)
  }

  await page.locator('[data-testid="add-adventure-location"]').fill('Torrey Pines')
  await page.locator('[data-testid="add-adventure-notes"]').fill('Early tee time with the pack')

  // CA-2: Start now → banner
  await page.locator('[data-testid="add-adventure-start-now"]').click()
  await page.waitForTimeout(900)
  const bannerAfterStart = await page
    .locator('[data-testid="active-adventure-banner"]')
    .isVisible()
  check('start-now-banner', bannerAfterStart, `banner=${bannerAfterStart}`)
  await page.screenshot({ path: path.join(OUT_DIR, '02-active-banner.png') })

  let state = await readDemoState(page)
  check(
    'custom-active-state',
    state?.activeAdventure?.placeId === 'custom-adventure' && state?.activeAdventure?.started,
    `placeId=${state?.activeAdventure?.placeId} started=${state?.activeAdventure?.started}`,
  )

  // Navigate all six tabs with banner
  let tabsOk = true
  for (const tab of NAV_TABS) {
    await goTab(page, tab)
    const banner = await page.locator('[data-testid="active-adventure-banner"]').isVisible()
    const nav = await page.locator('.bnav').first().isVisible()
    if (!banner || !nav) tabsOk = false
  }
  check('six-tabs-with-banner', tabsOk, `all tabs keep banner and nav`)
  await page.screenshot({ path: path.join(OUT_DIR, '03-tabs-with-banner.png') })

  // Resume custom adventure
  await page.locator('[data-testid="active-adventure-banner"]').click()
  await page.waitForTimeout(600)
  const overlayTitle = await page.locator('.clk-sub').textContent()
  check('resume-custom', overlayTitle?.includes('Golf'), `overlay title=${overlayTitle}`)

  // Finish → memory
  await page.locator('button', { hasText: 'Finish adventure' }).click()
  await page.waitForTimeout(1200)
  state = await readDemoState(page)
  const memory = state?.journeyEntries?.[0]
  const memoryOk =
    memory?.place === 'Golf Day' &&
    memory?.placeId === 'custom-adventure' &&
    !state?.activeAdventure
  check(
    'finish-creates-memory',
    memoryOk,
    `place=${memory?.place} active=${!!state?.activeAdventure}`,
  )
  await page.screenshot({ path: path.join(OUT_DIR, '04-after-finish.png') })

  check(
    'notes-location-persist',
    memory?.customLocationLabel === 'Torrey Pines' &&
      (memory?.userNotes?.includes('tee time') || memory?.magicLine?.includes('tee time')),
    `location=${memory?.customLocationLabel} notes=${memory?.userNotes ?? memory?.magicLine}`,
  )

  // Cancel creates no memory
  await goTab(page, 'Plan')
  await page.locator('[data-testid="journey-add-adventure"]').click()
  await page.waitForTimeout(400)
  await page.locator('[data-testid="add-adventure-title"]').fill('Boat Day')
  await page.locator('[data-testid="add-adventure-start-now"]').click()
  await page.waitForTimeout(800)
  const countBeforeCancel = (await readDemoState(page))?.journeyEntries?.length ?? 0
  await page.locator('[data-testid="active-adventure-banner"]').getByRole('button', { name: 'Cancel' }).click()
  await page.waitForTimeout(400)
  page.once('dialog', (d) => d.accept())
  await page.waitForTimeout(800)
  state = await readDemoState(page)
  const cancelOk =
    !state?.activeAdventure &&
    (state?.journeyEntries?.length ?? 0) === countBeforeCancel &&
    !state?.journeyEntries?.some((e) => e.place === 'Boat Day')
  check('cancel-no-memory', cancelOk, `entries=${state?.journeyEntries?.length}`)

  // Save for later → Plan / Planned
  await goTab(page, 'Plan')
  await page.locator('[data-testid="journey-add-adventure"]').click()
  await page.waitForTimeout(400)
  await page.locator('[data-testid="add-adventure-title"]').fill('Camping Trip')
  await page.locator('[data-testid="add-adventure-scheduled-for"]').fill('2030-06-15T09:30')
  await page.locator('[data-testid="add-adventure-save-later"]').click()
  await page.waitForTimeout(900)
  await goTab(page, 'Plan')
  const plannedVisible = await page
    .locator('[data-testid="journey-planned-section"]')
    .isVisible()
  state = await readDemoState(page)
  const plannedOk =
    plannedVisible && (state?.scheduledAdventures?.length ?? 0) >= 1
  check('save-for-later-planned', plannedOk, `planned section=${plannedVisible}`)
  await page.screenshot({ path: path.join(OUT_DIR, '05-planned-section.png') })

  const noBannerPlanned = !(await page
    .locator('[data-testid="active-adventure-banner"]')
    .isVisible())
  check('save-later-no-banner', noBannerPlanned, `banner absent=${noBannerPlanned}`)

  // Start planned → active
  await page.locator('[data-testid="journey-planned-start"]').first().click()
  await page.waitForTimeout(900)
  state = await readDemoState(page)
  const promoteOk =
    state?.activeAdventure?.location === 'Camping Trip' &&
    (state?.scheduledAdventures?.length ?? 0) === 0
  check('start-planned-promotes', promoteOk, `active=${state?.activeAdventure?.location} scheduled=${state?.scheduledAdventures?.length}`)
  await page.locator('[data-testid="active-adventure-banner"]').getByRole('button', { name: 'Cancel' }).click()
  page.once('dialog', (d) => d.accept())
  await page.waitForTimeout(700)

  // Refresh preserves planned (new planned item)
  await goTab(page, 'Plan')
  await page.locator('[data-testid="journey-add-adventure"]').click()
  await page.locator('[data-testid="add-adventure-title"]').fill('Brewery Day')
  await page.locator('[data-testid="add-adventure-scheduled-for"]').fill('2030-06-16T16:30')
  await page.locator('[data-testid="add-adventure-save-later"]').click()
  await page.waitForTimeout(700)
  await page.reload({ waitUntil: 'load', timeout: 90000 })
  await page.waitForTimeout(1000)
  state = await readDemoState(page)
  const refreshOk = state?.scheduledAdventures?.some((s) => s.title === 'Brewery Day')
  check('refresh-planned-persists', refreshOk, `brewery planned=${refreshOk}`)

  // Block second active adventure
  await goTab(page, 'Plan')
  await page.locator('[data-testid="journey-planned-start"]').first().click()
  await page.waitForTimeout(800)
  await page.locator('[data-testid="journey-add-adventure"]').click()
  await page.waitForTimeout(600)
  const flowStillClosed = !(await page.locator('[data-testid="add-adventure-flow"]').isVisible())
  state = await readDemoState(page)
  const blockOk = flowStillClosed && state?.activeAdventure?.location === 'Brewery Day'
  check('block-while-active', blockOk, `flow closed=${flowStillClosed} active=${state?.activeAdventure?.location}`)

  // Phase 1 regression: Quick Walk still works
  state = await readDemoState(page)
  if (state?.activeAdventure) {
    await page.locator('[data-testid="active-adventure-banner"]').getByRole('button', { name: 'Cancel' }).click()
    page.once('dialog', (d) => d.accept())
    await page.waitForTimeout(600)
  }
  await goTab(page, 'Home')
  await page.locator('.home-quick-walk-btn').click()
  await page.waitForTimeout(900)
  const qwBanner = await page.locator('[data-testid="active-adventure-banner"]').isVisible()
  check('phase1-quick-walk', qwBanner, `quick walk banner=${qwBanner}`)

  // Community Beta
  await goTab(page, 'Community')
  const communityText = await page.locator('body').innerText()
  const communityBeta =
    communityText.includes('Community Beta') &&
    communityText.includes("Post today's adventure") &&
    !/Coming soon/i.test(communityText)
  check('community-beta', communityBeta, `community beta=${communityBeta}`)
  await page.screenshot({ path: path.join(OUT_DIR, '06-community.png') })

  const passCount = results.filter((r) => r.pass).length
  const failCount = results.length - passCount
  const report = {
    baseUrl: BASE_URL,
    ranAt: new Date().toISOString(),
    pass: passCount,
    fail: failCount,
    total: results.length,
    results,
  }
  await writeFile(path.join(OUT_DIR, 'report.json'), JSON.stringify(report, null, 2))

  console.log(`\n${passCount}/${results.length} PASS`)
  await browser.close()
  process.exit(failCount > 0 ? 1 : 0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
