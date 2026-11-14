import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { chromium, devices } from 'playwright'

const base = process.env.QA_BASE_URL || 'http://127.0.0.1:4173'
const out = process.env.QA_OUT_DIR || 'artifacts/qa/monthly-recap-mobile'
const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({
  ...devices['iPhone 13'],
  reducedMotion: 'reduce',
  serviceWorkers: 'block',
})
const page = await context.newPage()
const errors = []
const checks = []
page.on('pageerror', error => errors.push(error.message))
await mkdir(out, { recursive: true })

async function openMonthlyCard() {
  await page.getByRole('navigation', { name: 'Main navigation' })
    .getByRole('button', { name: 'Journey', exact: true }).click()
  await page.getByText(/Adventures With/).first().waitFor()
  assert.equal(await page.getByText(/This Month With/).count(), 0, 'Lifetime Journey must not claim to be only this month')
  await page.getByRole('button', { name: 'Create Story', exact: true }).click()
  const card = page.locator('.share-card--monthly-recap')
  await card.waitFor({ state: 'visible' })
  return card
}

async function seedMonthlyMemories(includeCurrent) {
  await page.evaluate(withCurrent => {
    const state = JSON.parse(localStorage.getItem('pawstreak:demo') || '{}')
    const template = state.journeyEntries?.[0]
    if (!template) throw new Error('Demo memory fixture is missing')
    const now = new Date()
    const currentDate = new Date(now.getFullYear(), now.getMonth(), 14, 12)
    const priorDate = new Date(now.getFullYear(), now.getMonth() - 1, 14, 12)
    const lastMonth = {
      ...template, id: 'qa-prior-month', place: 'Earlier park',
      date: 'Today', occurredAt: priorDate.toISOString(),
      photoUrls: ['https://example.com/not-current.jpg'], tags: ['Trail'],
    }
    const currentMonth = {
      ...template, id: 'qa-current-month', place: 'Current park',
      date: 'Today', occurredAt: currentDate.toISOString(),
      photoUrls: [], tags: ['Park'],
    }
    state.journeyEntries = withCurrent ? [lastMonth, currentMonth] : [lastMonth]
    state.adventureCount = 99
    state.placeCount = 88
    localStorage.setItem('pawstreak:demo', JSON.stringify(state))
  }, includeCurrent)
  await page.reload({ waitUntil: 'networkidle' })
}

try {
  await page.goto(`${base}/demo/app`, { waitUntil: 'networkidle' })
  await page.evaluate(() => localStorage.removeItem('pawstreak:demo'))
  await page.reload({ waitUntil: 'networkidle' })

  await seedMonthlyMemories(true)
  let card = await openMonthlyCard()
  assert.equal(await card.locator('h1').innerText(), '1 adventure this month')
  assert.deepEqual(
    await card.locator('.share-card-metric').evaluateAll(elements => elements.map(element => ({
      label: element.querySelector('span')?.textContent?.trim(),
      value: element.querySelector('strong')?.textContent?.trim(),
    }))),
    [
      { label: 'Adventures', value: '1' },
      { label: 'Places visited', value: '1' },
      { label: 'Photos saved', value: '0' },
    ],
    'Current-month card must show actual entries, distinct places and photos — never all-time counters',
  )
  assert.equal(await card.locator('.share-card-photo--empty').count(), 1, 'Do not borrow a previous-month photo')
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), 'Monthly share overlay must not overflow phone width')
  await page.screenshot({ path: path.join(out, '01-current-month-mobile.png'), fullPage: true })
  checks.push('current-month share overlay: one outing, one place, zero photos, no borrowed image')

  await page.getByRole('button', { name: 'Close share preview' }).click()
  await seedMonthlyMemories(false)
  card = await openMonthlyCard()
  assert.equal(await card.locator('h1').innerText(), '0 adventures this month')
  assert.equal(await card.locator('.share-card-photo--empty').count(), 1, 'Zero-month card cannot use last month photo')
  assert.ok((await card.innerText()).includes('No adventures saved this month yet.'))
  await page.screenshot({ path: path.join(out, '02-zero-month-mobile.png'), fullPage: true })
  checks.push('empty calendar-month share overlay is truthful and encouraging')

  assert.deepEqual(errors, [], 'No uncaught JavaScript errors')
  console.log('[PASS] Monthly Journey recap on iPhone-sized running DEMO app: honest dates, metrics, fallback images and layout')
} catch (error) {
  await page.screenshot({ path: path.join(out, 'failure.png'), fullPage: true })
  throw error
} finally {
  await writeFile(path.join(out, 'report.json'), JSON.stringify({ base, checkedAt: new Date().toISOString(), checks, errors }, null, 2))
  await browser.close()
}
