/**
 * Product coherence fixes smoke test.
 *
 *   QA_BASE_URL=http://127.0.0.1:4190 node qa/product-coherence-fixes.mjs
 */
import { chromium, devices } from 'playwright'

const BASE_URL = process.env.QA_BASE_URL || 'http://127.0.0.1:4190'
const BAD_IMAGE_PATTERNS = /unsplash|images\.unsplash|sample-images|kettle|girl|legs|forest people|stock/i
const USER_PHOTO =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MCA4MCI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjZmY2OWI0Ii8+PHRleHQgeD0iMTIiIHk9IjQ1IiBmb250LXNpemU9IjE0Ij5VU0VSIERPRzwvdGV4dD48L3N2Zz4='

const GEOCODE_MOCK = {
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
}

const results = []

function check(id, pass, detail) {
  results.push({ id, pass, detail })
  console.log(`${pass ? 'PASS' : 'FAIL'} ${id}: ${detail}`)
}

async function bodyText(page) {
  return await page.locator('body').innerText()
}

async function readState(page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem('pawstreak:demo') || 'null'))
}

async function writeState(page, updater, arg) {
  await page.evaluate(({ updaterSource, arg }) => {
    const state = JSON.parse(localStorage.getItem('pawstreak:demo') || 'null')
    if (!state) return
    const next = new Function('state', 'arg', `return (${updaterSource})(state, arg)`)(state, arg)
    localStorage.setItem('pawstreak:demo', JSON.stringify(next))
  }, { updaterSource: updater.toString(), arg })
}

async function goTab(page, label) {
  await page.locator('.bnav').getByRole('button', { name: label, exact: true }).click()
  await page.waitForTimeout(700)
}

async function openDemoApp(page) {
  await page.goto(`${BASE_URL}/demo/app`, { waitUntil: 'load', timeout: 90000 })
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
  await page.reload({ waitUntil: 'load', timeout: 90000 })
  await page.locator('.home-dog-pill').first().waitFor({ state: 'visible', timeout: 30000 })
  await page.waitForTimeout(900)
}

async function applyLocationViaSettings(page, query) {
  await goTab(page, 'Home')
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

async function renderedBackgrounds(page, selector) {
  return page.locator(selector).evaluateAll((nodes) =>
    nodes.map((node) => getComputedStyle(node).backgroundImage),
  )
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
  let text = await bodyText(page)
  check('mobile-shell-no-fake-status', !text.includes('9:41') && !/wi-fi|wifi/i.test(text), 'no fake 9:41/Wi-Fi copy')

  const homeImages = await renderedBackgrounds(page, '.home-quick-adventure-photo, .st-suggested-spots-tile-photo')
  check(
    'generated-card-images-illustrated',
    homeImages.length > 0 &&
      homeImages.every((value) => value.includes('data:image/svg+xml')) &&
      homeImages.every((value) => !BAD_IMAGE_PATTERNS.test(value)),
    `images=${homeImages.length}`,
  )

  await goTab(page, 'Achievements')
  text = await bodyText(page)
  check(
    'fresh-achievements-no-fake-earned',
    text.includes('Available to Earn') &&
      !text.includes('Surfer Dog') &&
      !text.includes('Adventure Dog') &&
      !text.includes('Pack Member'),
    'available achievements visible, old fake-earned names absent',
  )
  await page.getByText('First Adventure').first().click()
  await page.waitForTimeout(500)
  text = await bodyText(page)
  const lowerDetailText = text.toLowerCase()
  check(
    'achievement-detail-requirements-progress-next',
    lowerDetailText.includes('how to earn') &&
      lowerDetailText.includes('finish 1 adventure') &&
      lowerDetailText.includes('progress') &&
      lowerDetailText.includes('suggested next action'),
    'detail includes earn/progress/next action',
  )
  await page.getByRole('button', { name: /Back/i }).click()
  await page.waitForTimeout(500)

  await goTab(page, 'Challenges')
  text = await bodyText(page)
  const requiredChallenges = [
    'Beach Explorer',
    'Trail Scout',
    'Dog Park Tour',
    'Patio Pup',
    'Brewery Buddy',
    'First Walk Week',
    'Sniffari Streak',
    'Memory Maker',
    'Social Confidence',
    'New Route Challenge',
  ]
  check(
    'exact-initial-challenge-set-visible',
    requiredChallenges.every((title) => text.includes(title)) &&
      !text.includes('Holiday Adventure Challenge'),
    '10 requested challenge titles present, holiday absent',
  )
  await page.getByRole('button', { name: 'Preview', exact: true }).first().click()
  await page.waitForTimeout(700)
  const challengePathNodes = await page.locator('.challenge-path .challenge-node').count()
  const challengeLeftNodes = await page.locator('.challenge-node-row--left').count()
  const challengeRightNodes = await page.locator('.challenge-node-row--right').count()
  text = await bodyText(page)
  const lowerChallengeDetailText = text.toLowerCase()
  check(
    'challenge-detail-staggered-path',
    lowerChallengeDetailText.includes('challenge path') &&
      challengePathNodes >= 4 &&
      challengeLeftNodes > 0 &&
      challengeRightNodes > 0,
    `nodes=${challengePathNodes} left=${challengeLeftNodes} right=${challengeRightNodes}`,
  )
  await page.getByRole('button', { name: /Back/i }).click()
  await page.waitForTimeout(500)

  await applyLocationViaSettings(page, 'Forest Hills, NY')
  await goTab(page, 'Challenges')
  text = await bodyText(page)
  check(
    'unsupported-generic-challenges',
    text.includes('First Walk Week') &&
      text.includes('New Route Challenge') &&
      !text.includes('Beach Explorer') &&
      !text.includes('Brewery Buddy'),
    'unsupported sees generic challenges only',
  )

  await goTab(page, 'Journey')
  text = await bodyText(page)
  const journeyMemoryNodes = await page.locator('.journey-memory-node').count()
  const journeyCurrentNodes = await page.locator('.journey-story-node--current, .journey-story-node--locked').count()
  check(
    'journey-monthly-memory-framing',
    text.includes('This Month With') &&
      journeyMemoryNodes > 0 &&
      journeyCurrentNodes === 0 &&
      !/life story|chapter \\d|chapters saved|your dog.s story/i.test(text),
    `memoryNodes=${journeyMemoryNodes} futureNodes=${journeyCurrentNodes}`,
  )

  await applyLocationViaSettings(page, '92123')
  await goTab(page, 'Plan')
  text = await bodyText(page)
  check(
    'plan-unified-hub',
    ['Build My Month', 'Surprise Me', 'Type a Plan', 'Training Goal Plan'].every((label) => text.includes(label)),
    'Plan contains all planning modes',
  )
  await page.getByText('Build My Month').first().click()
  await page.waitForTimeout(700)
  text = await bodyText(page)
  const lowerBuildMonthText = text.toLowerCase()
  check(
    'build-my-month-multi-category',
    lowerBuildMonthText.includes('choose 3–4 preferred categories') &&
      lowerBuildMonthText.includes('beach') &&
      lowerBuildMonthText.includes('trail') &&
      lowerBuildMonthText.includes('dog park'),
    'category selection visible',
  )
  await page.getByRole('button', { name: /Beach/i }).click()
  await page.getByRole('button', { name: /Trail/i }).click()
  await page.getByRole('button', { name: /Dog park/i }).click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.getByRole('button', { name: /1 adventure per week/i }).click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.getByRole('button', { name: 'Weekends', exact: true }).click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.waitForTimeout(500)
  const plannedPathNodes = await page.locator('.build-month-path .staggered-path-row').count()
  text = await bodyText(page)
  check(
    'build-my-month-planned-outing-path',
    plannedPathNodes >= 4 &&
      text.includes('Planned outing path') &&
      text.includes('Best time:') &&
      text.includes('Helps with:'),
    `plannedNodes=${plannedPathNodes}`,
  )
  await page.getByRole('button', { name: /Back/i }).click()
  await page.waitForTimeout(500)

  await goTab(page, 'Plan')
  await page.getByText('Training Goal Plan').click()
  await page.waitForTimeout(500)
  await page.locator('.training-flow-program').first().click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.getByRole('button', { name: 'Daily', exact: true }).click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.waitForTimeout(500)
  const trainingPathNodes = await page.locator('.training-session-path .staggered-path-row').count()
  text = await bodyText(page)
  check(
    'training-goal-session-path',
    trainingPathNodes >= 3 && text.includes('Training session path'),
    `trainingNodes=${trainingPathNodes}`,
  )
  await page.getByRole('button', { name: /Back/i }).click()
  await page.waitForTimeout(500)

  await goTab(page, 'Plan')
  const firstCard = page.locator('.pcard').first()
  await firstCard.click()
  await page.waitForTimeout(500)
  text = await bodyText(page)
  check(
    'plan-place-detail-useful',
    text.includes('Best time:') &&
      text.includes('Start this adventure') &&
      text.includes('Helps with:'),
    'place detail has timing/start/progress hints',
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
  const memoryImages = await renderedBackgrounds(page, '.home-memory-tile-photo')
  check(
    'real-memory-photo-preserved',
    memoryImages.some((value) => value.includes('PHN2ZyB4bWxucz0iaHR0cDov')),
    `memoryImages=${memoryImages.length}`,
  )

  await browser.close()

  const passed = results.filter((result) => result.pass).length
  console.log(`\n${passed}/${results.length} checks passed`)
  if (passed !== results.length) process.exit(1)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
