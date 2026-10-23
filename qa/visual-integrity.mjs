import assert from 'node:assert/strict'
import { chromium, devices } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const base = process.env.QA_BASE_URL || 'http://127.0.0.1:4173'
const out = process.env.QA_OUT_DIR || 'artifacts/qa/visual-integrity'
const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ ...devices['iPhone 13'], serviceWorkers: 'block', reducedMotion: 'reduce' })
const page = await context.newPage()
const results = []
const errors = []
page.on('pageerror', error => errors.push(error.message))
page.setDefaultTimeout(10000)
await mkdir(out, { recursive: true })

async function inspect(name) {
  await page.waitForTimeout(180)
  const bad = await page.evaluate(() => [...document.querySelectorAll('*')].flatMap(el => {
    const values = [el.getAttribute('src'), getComputedStyle(el).backgroundImage, getComputedStyle(el, '::before').backgroundImage]
    return values.filter(value => /sample-images|images\.unsplash|source\.unsplash|04-map-path|pawstreak-demo-flow/.test(value ?? ''))
  }))
  assert.deepEqual(bad, [], `${name}: retired imagery rendered`)
  assert.equal(await page.locator('.plan-map-terrain, .plan-map-pin--fallback, .jmap-overlay-panel-grid, .plan-map-road, .plan-map-coast').count(), 0, `${name}: fake map rendered`)
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${name}: horizontal overflow`)
  await page.screenshot({ path: path.join(out, `${String(results.length + 1).padStart(2, '0')}-${name}.png`), fullPage: true })
  results.push({ screen: name, pass: true })
  console.log(`[PASS] ${name}: no retired imagery, fabricated maps, or horizontal overflow`)
}
async function app() {
  await page.goto(`${base}/demo/app`, { waitUntil: 'networkidle' })
  await page.evaluate(() => localStorage.removeItem('pawstreak:demo'))
  await page.reload({ waitUntil: 'networkidle' })
  await page.locator('.home-dog-pill').waitFor()
}
async function tab(name) { await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('button', { name, exact: true }).click() }
try {
  for (const [route, name] of [['/', 'landing'], ['/start', 'start'], ['/app', 'signup'], ['/demo/onboarding', 'onboarding'], ['/privacy', 'privacy'], ['/terms', 'terms'], ['/support', 'support'], ['/delete-account', 'account-deletion'], ['/early-access', 'early-access'], ['/internal/content-studio', 'content-studio-access-gate']]) {
    await page.goto(`${base}${route}`, { waitUntil: 'networkidle' })
    await inspect(name)
  }
  await app()
  await inspect('today')
  await tab('Explore')
  await inspect('explore')
  const rows = page.locator('.geographic-place-row')
  if (await rows.count()) {
    assert.ok(await page.getByTestId('map-unavailable').isVisible())
    await rows.first().click()
    await page.locator('.plan-selected-place').waitFor()
    await inspect('map-unavailable-place-selection')
  } else {
    await page.locator('.geographic-map-marker').first().waitFor()
    await page.locator('.geographic-map-marker').first().click()
    await inspect('map-coordinate-selection')
  }
  await page.locator('.pcard').first().click()
  await page.locator('.plan-place-detail').waitFor()
  await inspect('adventure-details')
  await page.locator('.plan-hub-action').filter({ hasText: 'Add Your Own' }).click()
  await inspect('add-adventure')
  await app()
  await tab('Explore')
  await page.locator('.plan-hub-action').filter({ hasText: 'Build My Month' }).click()
  await inspect('monthly-plan-choices')
  for (let index = 0; index < 3; index++) await page.locator('.build-month-option').nth(index).click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await inspect('monthly-plan-frequency')
  await page.getByRole('button', { name: /4 outings this month/ }).click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await inspect('monthly-plan-timing')
  await page.getByRole('button', { name: 'Weekends', exact: true }).click()
  await page.getByRole('button', { name: /Balanced mix/ }).click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await inspect('monthly-plan-result')
  await app()
  await tab('Explore')
  await page.locator('.plan-hub-action').filter({ hasText: 'Training' }).click()
  await inspect('training-choices')
  await page.getByRole('button', { name: /Fun & Enrichment/i }).click()
  await page.getByRole('button', { name: 'Choose this adventure', exact: true }).click()
  await inspect('training-schedule')
  await page.getByRole('button', { name: /Daily/i }).click()
  await page.getByRole('button', { name: 'Schedule my training adventure', exact: true }).click()
  await inspect('training-plan')
  await page.getByRole('button', { name: 'Preview first session', exact: true }).click()
  await inspect('training-session')
  await app()
  await tab('Journey')
  await inspect('journey')
  await page.locator('.journey-memory-card:not([disabled])').first().click()
  await inspect('memory-without-photo')
  assert.equal(await page.locator('.memory-gallery-img').count(), 0)
  await page.getByRole('button', { name: 'Back', exact: true }).click()
  await page.locator('.journey-more').getByRole('button', { name: /^Challenges/ }).click()
  await inspect('challenges')
  await page.getByRole('button', { name: 'Preview', exact: true }).first().click()
  await inspect('challenge-detail')
  await app()
  await tab('Journey')
  await page.locator('.journey-more').getByRole('button', { name: /^Trail patches/ }).click()
  await inspect('achievements')
  await page.locator('.achievements-badge-card').first().click()
  await inspect('achievement-detail')
  await app()
  await tab('Journey')
  await page.locator('.journey-more').getByRole('button', { name: /^Share a story/ }).click()
  await inspect('community-preview')
  await app()
  await tab('Pack')
  await inspect('pack')
  await page.getByRole('button', { name: 'Add person', exact: true }).click()
  await inspect('pack-invite')
  await app()
  await tab('Pack')
  await page.getByRole('button', { name: 'Open settings' }).click()
  await inspect('settings')
  await app()
  await page.getByRole('button', { name: 'Quick Walk', exact: true }).click()
  await page.locator('.cbtn--save-memory').waitFor()
  await inspect('active-adventure')
  await page.locator('.cbtn--save-memory').click()
  await page.locator('.share-preview-shell').waitFor()
  await inspect('completion-share-no-photo')
  await page.locator('.share-preview-close').click()
  await inspect('saved-memory')
  await app()
  await page.evaluate(() => {
    const state = JSON.parse(localStorage.getItem('pawstreak:demo'))
    state.journeyEntries = []
    state.adventureCount = 0
    state.placeCount = 0
    localStorage.setItem('pawstreak:demo', JSON.stringify(state))
  })
  await page.reload({ waitUntil: 'networkidle' })
  await tab('Journey')
  await inspect('journey-empty')
  assert.deepEqual(errors, [], 'Uncaught browser errors')
} catch (error) {
  results.push({ pass: false, error: error.message })
  await page.screenshot({ path: path.join(out, 'failure.png'), fullPage: true })
  throw error
} finally {
  await writeFile(path.join(out, 'report.json'), JSON.stringify({ base, checkedAt: new Date().toISOString(), results, errors }, null, 2))
  await browser.close()
}
