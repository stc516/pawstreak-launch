import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { chromium, devices } from 'playwright'

const base = process.env.QA_BASE_URL || 'http://127.0.0.1:4173'
const out = process.env.QA_OUT_DIR || 'artifacts/qa/achievements-mobile-disclosure'
const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({
  ...devices['iPhone 13'],
  reducedMotion: 'reduce',
  serviceWorkers: 'block',
})
const page = await context.newPage()
const report = { base, checkedAt: new Date().toISOString(), checks: [] }
const runtimeErrors = []

page.on('pageerror', (error) => runtimeErrors.push(error.message))
await mkdir(out, { recursive: true })

try {
  await page.goto(`${base}/demo/app`, { waitUntil: 'networkidle' })
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
  await page.reload({ waitUntil: 'networkidle' })
  await page.locator('.home-dog-pill').waitFor()
  await page.getByRole('button', { name: 'Challenges', exact: true }).click()
  await page.getByRole('button', { name: 'View rewards', exact: true }).click()
  await page.getByRole('heading', { name: 'Rewards', exact: true }).waitFor()

  const rewardCards = page.locator('.achievements-badge-card')
  const disclosure = page.getByRole('button', { name: 'View all 10 rewards', exact: true })
  await disclosure.waitFor()
  assert.equal(await rewardCards.count(), 4, 'Collapsed rewards should show the four-card preview')
  await page.getByText('4 of 10', { exact: true }).waitFor()

  const collapsedGeometry = await page.evaluate(() => {
    const control = document.querySelector('.achievements-view-all')?.getBoundingClientRect()
    if (!control) throw new Error('Missing rewards disclosure control')
    return {
      control: { top: control.top, bottom: control.bottom, height: control.height },
      viewportWidth: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
    }
  })
  assert.ok(
    collapsedGeometry.control.height >= 44,
    `Rewards disclosure should be at least 44px tall; received ${collapsedGeometry.control.height}px`,
  )
  assert.ok(
    collapsedGeometry.documentWidth <= collapsedGeometry.viewportWidth + 1,
    `Rewards should not overflow horizontally; document ${collapsedGeometry.documentWidth}px, viewport ${collapsedGeometry.viewportWidth}px`,
  )

  await disclosure.scrollIntoViewIfNeeded()
  await page.screenshot({ path: path.join(out, 'rewards-collapsed.png'), fullPage: true })
  await disclosure.click()
  await page.getByRole('button', { name: 'Show fewer rewards', exact: true }).waitFor()
  await page.getByText('10 of 10', { exact: true }).waitFor()
  assert.equal(await rewardCards.count(), 10, 'Expanded rewards should expose every locked achievement')

  const hiddenReward = page.getByRole('button', { name: /Local Explorer/ })
  await hiddenReward.scrollIntoViewIfNeeded()
  await page.screenshot({ path: path.join(out, 'rewards-expanded.png'), fullPage: true })
  await hiddenReward.click()
  await page.locator('.achdetail-title').getByText('Local Explorer', { exact: true }).waitFor()
  await page.locator('.achdetail-meta-value').getByText('Complete 1 day-trip adventure', { exact: true }).waitFor()
  assert.equal(runtimeErrors.length, 0, `Rewards emitted runtime errors: ${runtimeErrors.join('; ')}`)

  report.checks.push({
    name: 'all locked rewards are discoverable and open their real detail',
    pass: true,
    collapsedGeometry,
    collapsedCount: 4,
    expandedCount: 10,
  })
  console.log('[PASS] Rewards exposes all ten achievements and opens a formerly hidden reward')
} catch (error) {
  report.checks.push({ name: 'mobile rewards disclosure', pass: false, error: error.message })
  await page.screenshot({ path: path.join(out, 'failure.png'), fullPage: true })
  throw error
} finally {
  report.runtimeErrors = runtimeErrors
  await writeFile(path.join(out, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
}
