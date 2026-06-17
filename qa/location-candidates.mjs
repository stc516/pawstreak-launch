/**
 * Phase 2.5 — Custom Adventure GPS + Location Candidates
 *
 *   QA_BASE_URL=http://127.0.0.1:4190 node qa/location-candidates.mjs
 */
import { chromium, devices } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE_URL = process.env.QA_BASE_URL || 'http://127.0.0.1:4190'
const OUT_DIR =
  process.env.QA_OUT_DIR || path.join(__dirname, 'evidence', 'location-candidates')

const iPhone = devices['iPhone 13']

async function installGeolocationMock(context, mode) {
  await context.addInitScript((mockMode) => {
    const coords = { latitude: 32.7157, longitude: -117.1611 }
    Object.defineProperty(navigator, 'permissions', {
      configurable: true,
      value: {
        query: async ({ name }) => {
          if (name === 'geolocation') {
            return { state: mockMode === 'granted' ? 'granted' : 'denied' }
          }
          return { state: 'prompt' }
        },
      },
    })
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition(success, error) {
          if (mockMode === 'granted') {
            success({
              coords,
              timestamp: Date.now(),
            })
            return
          }
          error({
            code: 1,
            PERMISSION_DENIED: 1,
            POSITION_UNAVAILABLE: 2,
            TIMEOUT: 3,
            message: 'mock denied',
          })
        },
      },
    })
  }, mode)
}

async function openDemo(page) {
  await page.goto(`${BASE_URL}/demo/app`, { waitUntil: 'load', timeout: 90000 })
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
  await page.reload({ waitUntil: 'load', timeout: 90000 })
  await page.locator('.home-dog-pill').first().waitFor({ state: 'visible', timeout: 30000 })
  await page.waitForTimeout(700)
}

async function goTab(page, label) {
  await page.locator('.bnav').getByRole('button', { name: label, exact: true }).click()
  await page.waitForTimeout(500)
}

async function readDemoState(page) {
  return page.evaluate(() => {
    const raw = localStorage.getItem('pawstreak:demo')
    return raw ? JSON.parse(raw) : null
  })
}

async function startCustomAdventure(page, title, location = 'San Diego Bay') {
  await goTab(page, 'Plan')
  await page.locator('[data-testid="journey-add-adventure"]').click()
  await page.locator('[data-testid="add-adventure-title"]').fill(title)
  await page.locator('[data-testid="add-adventure-location"]').fill(location)
  await page.locator('[data-testid="add-adventure-notes"]').fill('QA location candidate note')
  await page.locator('[data-testid="add-adventure-start-now"]').click()
  await page.waitForTimeout(900)
}

async function saveCustomAdventure(page, title) {
  await goTab(page, 'Plan')
  await page.locator('[data-testid="journey-add-adventure"]').click()
  await page.locator('[data-testid="add-adventure-title"]').fill(title)
  await page.locator('[data-testid="add-adventure-save-later"]').click()
  await page.waitForTimeout(700)
}

async function finishFromBanner(page) {
  await page.locator('[data-testid="active-adventure-banner"]').click()
  await page.waitForTimeout(500)
  await page.locator('button', { hasText: 'Finish adventure' }).click()
  await page.waitForTimeout(1000)
}

async function cancelFromBanner(page) {
  page.once('dialog', (dialog) => dialog.accept())
  await page
    .locator('[data-testid="active-adventure-banner"]')
    .getByRole('button', { name: 'Cancel' })
    .click()
  await page.waitForTimeout(700)
}

async function runGrantedChecks(browser, results, check) {
  const context = await browser.newContext({
    ...iPhone,
    isMobile: true,
    serviceWorkers: 'block',
  })
  await installGeolocationMock(context, 'granted')
  const page = await context.newPage()
  await openDemo(page)

  await startCustomAdventure(page, 'Boat Day')
  let state = await readDemoState(page)
  check(
    'gps-granted-start-location',
    state?.activeAdventure?.locationPermissionStatus === 'granted' &&
      state?.activeAdventure?.startLat === 32.7157 &&
      state?.activeAdventure?.startLng === -117.1611,
    `status=${state?.activeAdventure?.locationPermissionStatus} start=${state?.activeAdventure?.startLat},${state?.activeAdventure?.startLng}`,
  )

  await page.reload({ waitUntil: 'load', timeout: 90000 })
  await page.waitForTimeout(900)
  state = await readDemoState(page)
  check(
    'refresh-preserves-active-gps',
    state?.activeAdventure?.startLat === 32.7157 &&
      state?.activeAdventure?.locationPermissionStatus === 'granted',
    `status=${state?.activeAdventure?.locationPermissionStatus} start=${state?.activeAdventure?.startLat}`,
  )
  await page.screenshot({ path: path.join(OUT_DIR, '01-active-gps-refresh.png') })

  await finishFromBanner(page)
  state = await readDemoState(page)
  const memory = state?.journeyEntries?.[0]
  const candidate = state?.locationCandidates?.[0]
  check(
    'finish-creates-memory',
    memory?.place === 'Boat Day' && memory?.placeId === 'custom-adventure',
    `memory=${memory?.place} placeId=${memory?.placeId}`,
  )
  check(
    'finish-gps-creates-candidate',
    candidate?.customTitle === 'Boat Day' &&
      candidate?.approximateLat === 32.7157 &&
      candidate?.approximateLng === -117.1611 &&
      candidate?.endLat === 32.7157 &&
      candidate?.reviewStatus === 'new',
    `candidate=${candidate?.customTitle} lat=${candidate?.approximateLat} end=${candidate?.endLat}`,
  )
  await page.screenshot({ path: path.join(OUT_DIR, '02-candidate-created.png') })

  const candidateCount = state?.locationCandidates?.length ?? 0
  await startCustomAdventure(page, 'Farmers Market')
  await cancelFromBanner(page)
  state = await readDemoState(page)
  check(
    'cancel-no-memory-no-candidate',
    !state?.activeAdventure &&
      (state?.locationCandidates?.length ?? 0) === candidateCount &&
      !state?.journeyEntries?.some((entry) => entry.place === 'Farmers Market'),
    `candidates=${state?.locationCandidates?.length} active=${!!state?.activeAdventure}`,
  )

  await saveCustomAdventure(page, 'Camping Trip')
  state = await readDemoState(page)
  check(
    'save-for-later-still-works',
    state?.scheduledAdventures?.some((item) => item.title === 'Camping Trip'),
    `scheduled=${state?.scheduledAdventures?.length}`,
  )

  await goTab(page, 'Plan')
  await page.locator('[data-testid="journey-planned-start"]').first().click()
  await page.waitForTimeout(900)
  state = await readDemoState(page)
  check(
    'planned-start-captures-gps',
    state?.activeAdventure?.location === 'Camping Trip' &&
      state?.activeAdventure?.startLat === 32.7157,
    `active=${state?.activeAdventure?.location} start=${state?.activeAdventure?.startLat}`,
  )

  await context.close()
  return results
}

async function runDeniedChecks(browser, check) {
  const context = await browser.newContext({
    ...iPhone,
    isMobile: true,
    serviceWorkers: 'block',
  })
  await installGeolocationMock(context, 'denied')
  const page = await context.newPage()
  await openDemo(page)

  await startCustomAdventure(page, 'Road Trip Stop')
  const state = await readDemoState(page)
  const banner = await page.locator('[data-testid="active-adventure-banner"]').isVisible()
  check(
    'gps-denied-still-starts',
    banner &&
      state?.activeAdventure?.locationPermissionStatus === 'denied' &&
      state?.activeAdventure?.startLat === undefined,
    `banner=${banner} status=${state?.activeAdventure?.locationPermissionStatus} start=${state?.activeAdventure?.startLat}`,
  )
  await page.screenshot({ path: path.join(OUT_DIR, '03-denied-still-starts.png') })
  await context.close()
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  const results = []

  const check = (id, pass, detail) => {
    results.push({ id, pass, detail })
    console.log(`${pass ? 'PASS' : 'FAIL'} ${id}: ${detail}`)
  }

  const browser = await chromium.launch({ headless: true })
  await runGrantedChecks(browser, results, check)
  await runDeniedChecks(browser, check)

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
