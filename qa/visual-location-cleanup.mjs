/**
 * Visual cleanup + Plan location correctness regression.
 *
 *   QA_BASE_URL=http://127.0.0.1:4190 node qa/visual-location-cleanup.mjs
 */
import { chromium, devices } from 'playwright'

const BASE_URL = process.env.QA_BASE_URL || 'http://127.0.0.1:4190'
const SD_SPOT_NAMES = ['Dog Beach, Ocean Beach', 'Torrey Pines Trail', 'Balboa Park']
const USER_PHOTO =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MCA4MCI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjZmY2OWI0Ii8+PHRleHQgeD0iMTIiIHk9IjQ1IiBmb250LXNpemU9IjE0Ij5VU0VSIERPRzwvdGV4dD48L3N2Zz4='

const GEOCODE_MOCK = {
  '92123': {
    rawInput: '92123',
    placeName: 'San Diego, California 92123, United States',
    city: 'San Diego',
    state: 'California',
    country: 'United States',
    lat: 32.8012,
    lng: -117.074,
    mapboxPlaceId: 'postcode.92123',
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
    placeName: 'Forest Hills, Queens, New York, United States',
    city: 'Forest Hills',
    state: 'New York',
    country: 'United States',
    lat: 40.7196,
    lng: -73.8448,
    mapboxPlaceId: 'place.forest-hills',
    relevance: 0.98,
  },
}

const results = []

function check(id, pass, detail) {
  results.push({ id, pass, detail })
  console.log(`${pass ? 'PASS' : 'FAIL'} ${id}: ${detail}`)
}

async function readState(page) {
  return page.evaluate(() => {
    const raw = localStorage.getItem('pawstreak:demo')
    return raw ? JSON.parse(raw) : null
  })
}

async function writeState(page, updater, arg) {
  await page.evaluate(({ updaterSource, arg }) => {
    const raw = localStorage.getItem('pawstreak:demo')
    if (!raw) return
    const state = JSON.parse(raw)
    const next = new Function('state', 'arg', `return (${updaterSource})(state, arg)`)(
      state,
      arg,
    )
    localStorage.setItem('pawstreak:demo', JSON.stringify(next))
  }, { updaterSource: updater.toString(), arg })
}

async function goTab(page, label) {
  await page.locator('.bnav').getByRole('button', { name: label, exact: true }).click()
  await page.waitForTimeout(650)
}

async function applyLocationViaSettings(page, query) {
  await page.locator('[aria-label="Open profile and settings"]').first().click()
  await page.waitForTimeout(400)
  await page.locator('[aria-label="Open settings"]').click()
  await page.waitForTimeout(400)
  await page.locator('.settings-zip-input').fill(query)
  await page.locator('.settings-zip-btn').click()
  await page.waitForTimeout(900)
  await page.locator('.settings-back').click()
  await page.waitForTimeout(400)
  await goTab(page, 'Home')
}

async function openDemoApp(page) {
  await page.goto(`${BASE_URL}/demo/app`, { waitUntil: 'load', timeout: 90000 })
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
  await page.reload({ waitUntil: 'load', timeout: 90000 })
  await page.locator('.home-dog-pill').first().waitFor({ state: 'visible', timeout: 30000 })
  await page.waitForTimeout(800)
}

async function renderedBackgrounds(page, selector) {
  return page.locator(selector).evaluateAll((nodes) =>
    nodes.map((node) => getComputedStyle(node).backgroundImage),
  )
}

function allIllustrated(backgrounds) {
  return backgrounds.length > 0 && backgrounds.every((value) => value.includes('data:image/svg+xml'))
}

function hasStockUrl(backgrounds) {
  return backgrounds.some((value) =>
    /unsplash|images\.unsplash|sample-images|stock|kettle|tea/i.test(value),
  )
}

async function planCardTexts(page) {
  return page.locator('.pcard').evaluateAll((nodes) => nodes.map((node) => node.innerText))
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    ...devices['iPhone 13'],
    isMobile: true,
    serviceWorkers: 'block',
  })
  await context.addInitScript((mock) => {
    window.__PAWSTREAK_GEOCODE_MOCK__ = mock
  }, GEOCODE_MOCK)
  const page = await context.newPage()

  await openDemoApp(page)
  await applyLocationViaSettings(page, '92123')
  let state = await readState(page)
  check('san-diego-supported', state?.locationSupported === true, `label=${state?.locationLabel}`)

  const homeRecommendationImages = await renderedBackgrounds(
    page,
    '.home-quick-adventure-photo, .st-suggested-spots-tile-photo',
  )
  check(
    'home-recommendations-use-illustrations',
    allIllustrated(homeRecommendationImages) && !hasStockUrl(homeRecommendationImages),
    `count=${homeRecommendationImages.length}`,
  )

  await goTab(page, 'Plan')
  let cards = await planCardTexts(page)
  check(
    'san-diego-local-first',
    !/Worth the drive|Day trip|4[0-9]\s*mi|[5-9][0-9]\s*mi/i.test(cards.slice(0, 4).join(' | ')),
    cards.slice(0, 4).join(' | '),
  )
  const planRecommendationImages = await renderedBackgrounds(
    page,
    '.plan-suggested-card-photo, .pcard-thumb',
  )
  check(
    'plan-recommendations-use-illustrations',
    allIllustrated(planRecommendationImages) && !hasStockUrl(planRecommendationImages),
    `count=${planRecommendationImages.length}`,
  )

  const firstNamedCard = page.locator('.pcard').filter({ has: page.locator('.pgo') }).first()
  const selectedName = (await firstNamedCard.locator('.pname').innerText()).trim()
  await firstNamedCard.locator('.pgo').click()
  await page.waitForTimeout(900)
  state = await readState(page)
  check(
    'plan-go-starts-selected-place',
    state?.activeAdventure?.location === selectedName,
    `selected=${selectedName} active=${state?.activeAdventure?.location}`,
  )

  await openDemoApp(page)
  await applyLocationViaSettings(page, 'Irvine, CA')
  state = await readState(page)
  check('orange-county-supported', state?.locationLabel === 'Orange County, CA', `label=${state?.locationLabel}`)
  await goTab(page, 'Plan')
  cards = await planCardTexts(page)
  const firstFour = cards.slice(0, 4).join(' | ')
  check(
    'orange-county-local-first',
    !SD_SPOT_NAMES.some((name) => firstFour.includes(name)) &&
      !/Worth the drive|Day trip|4[0-9]\s*mi|[5-9][0-9]\s*mi/i.test(firstFour),
    firstFour,
  )

  await openDemoApp(page)
  await applyLocationViaSettings(page, 'Forest Hills, NY')
  state = await readState(page)
  await goTab(page, 'Plan')
  const body = await page.locator('body').innerText()
  const sdLeak = SD_SPOT_NAMES.filter((name) => body.includes(name))
  const genericVisible = await page.locator('[data-testid="plan-generic-adventures"]').isVisible()
  const markers = await page.locator('.mapboxgl-marker').count().catch(() => 0)
  check(
    'forest-hills-generic-no-socal-leak',
    state?.locationSupported === false && genericVisible && sdLeak.length === 0 && markers === 0,
    `supported=${state?.locationSupported} generic=${genericVisible} leaks=${sdLeak.join(',') || 'none'} markers=${markers}`,
  )

  await openDemoApp(page)
  await writeState(page, (state, userPhoto) => ({
    ...state,
    journeyEntries: state.journeyEntries.map((entry, index) =>
      index === 0 ? { ...entry, photoUrls: [userPhoto] } : entry,
    ),
  }), USER_PHOTO)
  await page.reload({ waitUntil: 'load', timeout: 90000 })
  await page.locator('.home-dog-pill').first().waitFor({ state: 'visible', timeout: 30000 })
  const memoryBackgrounds = await renderedBackgrounds(page, '.home-memory-tile-photo')
  const recommendationBackgrounds = await renderedBackgrounds(
    page,
    '.home-quick-adventure-photo, .st-suggested-spots-tile-photo',
  )
  check(
    'memory-user-photo-preserved',
    memoryBackgrounds.some((value) => value.includes('PHN2ZyB4bWxucz0iaHR0cDov')),
    `memoryImages=${memoryBackgrounds.length}`,
  )
  check(
    'recommendations-do-not-use-user-photo',
    recommendationBackgrounds.every((value) => !value.includes('PHN2ZyB4bWxucz0iaHR0cDov')),
    `recommendationImages=${recommendationBackgrounds.length}`,
  )

  await browser.close()

  const pass = results.every((result) => result.pass)
  console.log(`\n${results.filter((result) => result.pass).length}/${results.length} checks passed`)
  if (!pass) process.exit(1)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
