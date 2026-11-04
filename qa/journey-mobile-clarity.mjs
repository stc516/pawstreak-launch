import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { chromium, devices } from 'playwright'

const base = process.env.QA_BASE_URL || 'http://127.0.0.1:4173'
const out = process.env.QA_OUT_DIR || 'artifacts/qa/journey-mobile-clarity'
const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({
  ...devices['iPhone 13'],
  reducedMotion: 'reduce',
  serviceWorkers: 'block',
})
const page = await context.newPage()
const report = { base, checkedAt: new Date().toISOString(), checks: [] }

await mkdir(out, { recursive: true })

try {
  await page.goto(`${base}/demo/app`, { waitUntil: 'networkidle' })
  await page.evaluate(() => {
    localStorage.removeItem('pawstreak:demo')
  })
  await page.reload({ waitUntil: 'networkidle' })
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('button', { name: 'Journey', exact: true })
    .click()

  const cards = page.locator('.journey-memory-card')
  assert.ok((await cards.count()) >= 3, 'Journey should render at least three demo memory cards')

  const geometry = await cards.evaluateAll(elements =>
    elements.slice(0, 4).map(element => {
      const box = element.getBoundingClientRect()
      return { x: box.x, y: box.y, width: box.width, height: box.height, bottom: box.bottom }
    }),
  )

  const [first, ...rest] = geometry
  assert.ok(first.width >= 280, `Memory cards should use the phone width; received ${first.width}px`)
  for (const card of rest) {
    assert.ok(Math.abs(card.x - first.x) <= 1, 'Memory cards should align to one readable rail')
    assert.ok(Math.abs(card.width - first.width) <= 1, 'Memory cards should share one width')
  }
  for (let index = 1; index < geometry.length; index += 1) {
    assert.ok(
      geometry[index].y >= geometry[index - 1].bottom + 8,
      'Memory cards should not overlap vertically',
    )
  }

  const dotBox = await page.locator('.journey-memory-dot').first().boundingBox()
  assert.ok(dotBox && dotBox.width <= 22, 'Timeline numbers should stay visually secondary')
  assert.ok(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
    'Journey should not overflow horizontally',
  )

  await page.screenshot({ path: path.join(out, 'journey-mobile.png'), fullPage: true })
  report.checks.push({ name: 'single mobile story rail', pass: true, geometry })

  await page.evaluate(() => {
    const state = JSON.parse(localStorage.getItem('pawstreak:demo'))
    state.memorySaveToast = 'Memory saved — worth remembering.'
    localStorage.setItem('pawstreak:demo', JSON.stringify(state))
  })
  await page.reload({ waitUntil: 'networkidle' })
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('button', { name: 'Journey', exact: true })
    .click()

  const confirmation = page.locator('.journey-save-confirmation')
  await confirmation.waitFor()
  assert.equal(
    await confirmation.evaluate(element => getComputedStyle(element).position),
    'relative',
    'Journey confirmation should remain in document flow on phones',
  )
  const confirmationBox = await confirmation.boundingBox()
  const firstCardBox = await page.locator('.journey-memory-card').first().boundingBox()
  assert.ok(
    confirmationBox &&
      firstCardBox &&
      confirmationBox.y + confirmationBox.height < firstCardBox.y,
    'Journey confirmation should not cover a memory card',
  )

  await page.screenshot({ path: path.join(out, 'journey-confirmation.png'), fullPage: true })
  report.checks.push({ name: 'non-obscuring save confirmation', pass: true })
  console.log('[PASS] Journey uses one clear mobile story rail and a non-obscuring confirmation')
} catch (error) {
  report.checks.push({ name: 'journey mobile clarity', pass: false, error: error.message })
  await page.screenshot({ path: path.join(out, 'failure.png'), fullPage: true })
  throw error
} finally {
  await writeFile(path.join(out, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
}
