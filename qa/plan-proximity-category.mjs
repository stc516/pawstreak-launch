import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { chromium, devices } from 'playwright'

const base = process.env.QA_BASE_URL || 'http://127.0.0.1:4173'
const out = process.env.QA_OUT_DIR || 'artifacts/qa/plan-proximity-category'
await mkdir(out, { recursive: true })

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({
  ...devices['iPhone 13'],
  reducedMotion: 'reduce',
  serviceWorkers: 'block',
})
const page = await context.newPage()
const errors = []
const checks = []
page.on('pageerror', (error) => errors.push(error.message))

async function selectRadius(label) {
  const chip = page.locator('.plan-proximity-chip').filter({ hasText: label })
  await chip.click()
  assert.equal(await chip.getAttribute('aria-pressed'), 'true', `${label} should report selected`)
}

async function visibleCategoryCards() {
  return page.locator('.plan-card-list .pcard[data-plan-category]').evaluateAll((cards) =>
    cards.map((node) => ({
      title: node.querySelector('.pname')?.textContent?.trim() || '',
      category: node.getAttribute('data-plan-category'),
    })),
  )
}

async function assertBeachRadius(label) {
  await selectRadius(label)
  const cards = await visibleCategoryCards()
  assert.ok(cards.every((card) => card.category === 'Beach'),
    `${label} showed non-beach cards: ${JSON.stringify(cards)}`)
  if (!cards.length) {
    assert.equal(await page.getByTestId('plan-no-matching-places').count(), 1)
    assert.equal(await page.locator('.curated-spotlight').count(), 0,
      'No-match filters must not show an unrelated spotlight')
  }
  checks.push({ label, categories: cards.map((card) => card.category), titles: cards.map((card) => card.title) })
  return cards
}

try {
  await page.goto(`${base}/demo/app`, { waitUntil: 'networkidle' })
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
  await page.reload({ waitUntil: 'networkidle' })
  await page.locator('.home-dog-pill').first().waitFor()
  await page.getByRole('navigation', { name: 'Main navigation' })
    .getByRole('button', { name: 'Explore', exact: true }).click()

  const beach = page.locator('.chips--plan .chip').filter({ hasText: /^Beach$/ })
  await beach.click()
  assert.equal(await beach.getAttribute('aria-pressed'), 'true')

  const far = await assertBeachRadius('14 mi')
  assert.ok(far.length > 0, 'Demo San Diego should include a beach within 14 miles')
  const farNames = new Set(far.map((card) => card.title))
  for (const label of ['6 mi', '2.5 mi']) {
    const nearer = await assertBeachRadius(label)
    assert.ok(nearer.every((card) => farNames.has(card.title)),
      `${label} should not add places outside the 14 mi Beach filter`)
  }

  await selectRadius('Road trip')
  const tripCards = await visibleCategoryCards()
  assert.ok(tripCards.every((card) => card.category === 'Beach'),
    'Road-trip distance must not silently clear the Beach category')
  checks.push({ label: 'Road trip + Beach', titles: tripCards.map((card) => card.title) })

  await page.screenshot({ path: path.join(out, 'explore-filtered-mobile.png'), fullPage: true })
  assert.equal(errors.length, 0, `Explore runtime errors: ${errors.join('; ')}`)
  console.log('[PASS] Explore keeps category + honest distance filters consistent')
} catch (error) {
  checks.push({ label: 'error', message: error.message })
  await page.screenshot({ path: path.join(out, 'failure.png'), fullPage: true })
  throw error
} finally {
  await writeFile(path.join(out, 'report.json'), JSON.stringify({ base, checks, errors }, null, 2))
  await browser.close()
}
