/**
 * National geocoding + unsupported-region tracking
 *
 *   QA_BASE_URL=http://127.0.0.1:4190 node qa/national-geocoding.mjs
 *
 * Uses the deterministic geocode mock (window.__PAWSTREAK_GEOCODE_MOCK__)
 * so no Mapbox network calls are made. Keys absent from the mock simulate
 * geocoding being unavailable (helper returns null → regex fallback).
 */
import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE_URL = process.env.QA_BASE_URL || 'http://127.0.0.1:4190'
const OUT_DIR =
  process.env.QA_OUT_DIR || path.join(__dirname, 'evidence', 'national-geocoding')

const GEOCODE_MOCK = {
  '92101': {
    rawInput: '92101',
    placeName: 'San Diego, California 92101, United States',
    city: 'San Diego',
    state: 'California',
    country: 'United States',
    lat: 32.7157,
    lng: -117.1611,
    mapboxPlaceId: 'postcode.92101',
    relevance: 1,
  },
  'irvine, ca': {
    rawInput: 'Irvine, CA',
    placeName: 'Irvine, California, United States',
    city: 'Irvine',
    state: 'California',
    country: 'United States',
    lat: 33.6846,
    lng: -117.8265,
    mapboxPlaceId: 'place.irvine',
    relevance: 1,
  },
  'forest hills, ny': {
    rawInput: 'Forest Hills, NY',
    placeName: 'Forest Hills, New York, United States',
    city: 'Forest Hills',
    state: 'New York',
    country: 'United States',
    lat: 40.7196,
    lng: -73.8448,
    mapboxPlaceId: 'place.forest-hills',
    relevance: 0.98,
  },
  // 'zzzzz nowhere' intentionally absent → geocode returns null (fallback path)
}

const SD_SPOT_NAMES = ['Dog Beach', 'Torrey Pines', 'Balboa', 'Fiesta Island', 'Sunset Cliffs']

async function readDemoState(page) {
  return page.evaluate(() => {
    const raw = localStorage.getItem('pawstreak:demo')
    if (!raw) return null
    return JSON.parse(raw)
  })
}

async function goTab(page, label) {
  await page.locator('.bnav').getByRole('button', { name: label, exact: true }).click()
  await page.waitForTimeout(650)
}

async function bodyText(page) {
  return (await page.locator('body').innerText()).toLowerCase()
}

async function applyLocationViaSettings(page, query) {
  await page.locator('[aria-label="Open profile and settings"]').first().click()
  await page.waitForTimeout(500)
  await page.locator('[aria-label="Open settings"]').click()
  await page.waitForTimeout(500)
  await page.locator('.settings-zip-input').fill(query)
  await page.locator('.settings-zip-btn').click()
  await page.waitForTimeout(900)
  await page.locator('.settings-back').click()
  await page.waitForTimeout(400)
  await goTab(page, 'Home')
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  const results = []
  const consoleLogs = []

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    serviceWorkers: 'block',
  })
  await context.addInitScript((mock) => {
    window.__PAWSTREAK_GEOCODE_MOCK__ = mock
  }, GEOCODE_MOCK)

  const page = await context.newPage()
  page.on('console', (msg) => consoleLogs.push(msg.text()))

  const check = (id, pass, detail) => {
    results.push({ id, pass, detail })
    console.log(`${pass ? 'PASS' : 'FAIL'} ${id}: ${detail}`)
  }

  // ---- Scenario 1: onboarding with unsupported location (Forest Hills, NY)
  await page.goto(`${BASE_URL}/demo/onboarding`, { waitUntil: 'load', timeout: 90000 })
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
  await page.reload({ waitUntil: 'load', timeout: 90000 })
  await page.waitForTimeout(800)
  await page.getByRole('button', { name: /Create Your Free Account/i }).click()
  await page.waitForTimeout(500)
  await page.getByPlaceholder('First name').fill('QA Geo')
  await page.getByPlaceholder('you@email.com').fill('qa-geo@pawstreak.test')
  await page.getByPlaceholder('Min. 8 characters').fill('password123')
  await page.getByRole('button', { name: /Create account/i }).click()
  await page.getByPlaceholder('e.g. Luna').fill('Remy')
  await page.locator('select.field-input').first().selectOption('Mixed / Other')
  await page.locator('select.field-input').nth(1).selectOption('1–3 years')
  await page.getByRole('button', { name: /^Next$/ }).click()
  await page.getByRole('button', { name: 'Explorer' }).click()
  await page.getByRole('button', { name: /^Next$/ }).click()
  await page.waitForTimeout(400)

  // Blank location blocks continue
  const locationInput = page.getByPlaceholder(/ZIP, city, or neighborhood/i)
  await locationInput.fill('')
  await page.waitForTimeout(250)
  const continueDisabledBlank = await page
    .getByRole('button', { name: /Create our world/i })
    .isDisabled()
  check('blank-location-blocked', continueDisabledBlank, `disabled=${continueDisabledBlank}`)

  await locationInput.fill('Forest Hills, NY')
  await page.waitForTimeout(400)
  const stepText = await bodyText(page)
  check(
    'onboarding-unsupported-preview',
    stepText.includes('generic adventures for now') &&
      !stepText.includes('dog beach, ocean beach'),
    'unsupported preview shown, SD nearby spots hidden',
  )
  await page.screenshot({ path: path.join(OUT_DIR, '01-onboarding-forest-hills.png') })

  await page.getByRole('button', { name: /Create our world/i }).click()
  await page.waitForTimeout(400)
  await page.getByRole('button', { name: /Start your first adventure/i }).click()
  await page.waitForTimeout(1200)

  let state = await readDemoState(page)
  check(
    'forest-hills-state',
    state?.locationSupported === false &&
      (state?.locationLabel ?? '').includes('Forest Hills') &&
      state?.resolvedLocation?.state === 'New York',
    `supported=${state?.locationSupported} label=${state?.locationLabel} resolvedState=${state?.resolvedLocation?.state}`,
  )

  const expansionLogged = consoleLogs.some((line) =>
    line.includes('New unsupported location request'),
  )
  check(
    'expansion-request-logged',
    expansionLogged,
    `console contains expansion request=${expansionLogged}`,
  )

  // Home: generic experience, no SD spots
  const homeText = await bodyText(page)
  const sdSpotOnHome = SD_SPOT_NAMES.some((name) => homeText.includes(name.toLowerCase()))
  const genericOnHome = await page
    .locator('[data-testid="home-generic-adventures"]')
    .isVisible()
  const fallbackOnHome = await page.locator('[data-testid="home-area-fallback"]').isVisible()
  check(
    'home-unsupported-generic',
    genericOnHome && fallbackOnHome && !sdSpotOnHome,
    `generic=${genericOnHome} fallback=${fallbackOnHome} sdSpotLeak=${sdSpotOnHome}`,
  )
  await page.screenshot({ path: path.join(OUT_DIR, '02-home-unsupported.png') })

  // Plan: generic adventure list, no curated SD suggested/nearby cards.
  // (Saved places are the user's own list and are out of scope here.)
  await goTab(page, 'Plan')
  const planGeneric = await page
    .locator('[data-testid="plan-generic-adventures"]')
    .isVisible()
  const suggestedStripCount = await page.locator('.plan-suggested-strip').count()
  const proximityStripCount = await page.locator('.plan-proximity-strip').count()
  const nearbyText = (
    await page.locator('[data-testid="plan-generic-adventures"]').innerText()
  ).toLowerCase()
  const sdSpotOnPlan = SD_SPOT_NAMES.some((name) =>
    nearbyText.includes(name.toLowerCase()),
  )
  check(
    'plan-unsupported-generic',
    planGeneric && suggestedStripCount === 0 && proximityStripCount === 0 && !sdSpotOnPlan,
    `generic=${planGeneric} suggestedStrips=${suggestedStripCount} proximityStrips=${proximityStripCount} sdSpotLeak=${sdSpotOnPlan}`,
  )
  await page.screenshot({ path: path.join(OUT_DIR, '03-plan-unsupported.png') })

  // Refresh: unsupported experience persists
  await page.reload({ waitUntil: 'load', timeout: 90000 })
  await page.waitForTimeout(900)
  state = await readDemoState(page)
  check(
    'unsupported-persists-refresh',
    state?.locationSupported === false,
    `supported after refresh=${state?.locationSupported}`,
  )

  // ---- Scenario 2: San Diego via settings → supported localized experience
  await goTab(page, 'Home')
  await applyLocationViaSettings(page, '92101')
  state = await readDemoState(page)
  const sdHomeText = await bodyText(page)
  const sdGenericGone = !(await page
    .locator('[data-testid="home-generic-adventures"]')
    .isVisible())
  check(
    'san-diego-supported',
    state?.locationSupported === true &&
      state?.locationLabel === 'San Diego, CA' &&
      sdGenericGone &&
      sdHomeText.includes('suggested spots'),
    `supported=${state?.locationSupported} label=${state?.locationLabel} genericGone=${sdGenericGone}`,
  )
  await page.screenshot({ path: path.join(OUT_DIR, '04-home-san-diego.png') })

  // ---- Scenario 3: Orange County → supported
  await applyLocationViaSettings(page, 'Irvine, CA')
  state = await readDemoState(page)
  check(
    'orange-county-supported',
    state?.locationSupported === true && state?.locationLabel === 'Orange County, CA',
    `supported=${state?.locationSupported} label=${state?.locationLabel}`,
  )
  await page.screenshot({ path: path.join(OUT_DIR, '05-home-orange-county.png') })

  // ---- Scenario 4: geocode unavailable → regex fallback still works
  await applyLocationViaSettings(page, 'San Diego')
  state = await readDemoState(page)
  check(
    'geocode-unavailable-fallback',
    state?.locationSupported === true && state?.resolvedLocation === null,
    `supported=${state?.locationSupported} resolved=${JSON.stringify(state?.resolvedLocation)}`,
  )

  // ---- Scenario 5: invalid/unknown location → graceful unsupported, no crash
  const logCountBefore = consoleLogs.filter((line) =>
    line.includes('New unsupported location request'),
  ).length
  await applyLocationViaSettings(page, 'Zzzzz Nowhere')
  state = await readDemoState(page)
  const logCountAfter = consoleLogs.filter((line) =>
    line.includes('New unsupported location request'),
  ).length
  const appAlive = await page.locator('.home-dog-pill').first().isVisible()
  check(
    'invalid-location-graceful',
    state?.locationSupported === false && appAlive && logCountAfter > logCountBefore,
    `supported=${state?.locationSupported} alive=${appAlive} newRequests=${logCountAfter - logCountBefore}`,
  )
  await page.screenshot({ path: path.join(OUT_DIR, '06-home-invalid-location.png') })

  await browser.close()

  const passCount = results.filter((result) => result.pass).length
  console.log(`\n${passCount}/${results.length} checks passed`)
  await writeFile(
    path.join(OUT_DIR, 'report.json'),
    JSON.stringify({ baseUrl: BASE_URL, results, consoleLogs }, null, 2),
  )

  if (passCount !== results.length) process.exitCode = 1
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
