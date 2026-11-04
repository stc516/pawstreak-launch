import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { chromium, devices } from 'playwright'

const base = process.env.QA_BASE_URL || 'http://127.0.0.1:4173'
const out = process.env.QA_OUT_DIR || 'artifacts/qa/home-core-actions-touch-safety'
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

async function openFreshHome() {
  await page.goto(`${base}/demo/app`, { waitUntil: 'networkidle' })
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
  await page.reload({ waitUntil: 'networkidle' })
  await page.locator('.home-dog-pill').waitFor()
}

try {
  await openFreshHome()
  const moreWays = page.getByRole('region', { name: 'More ways to make today count' })
  await moreWays.scrollIntoViewIfNeeded()

  const geometry = await page.evaluate(() => {
    const box = (element) => {
      const rect = element?.getBoundingClientRect()
      if (!rect) throw new Error('Missing Home core action')
      return {
        top: rect.top,
        bottom: rect.bottom,
        left: rect.left,
        right: rect.right,
        width: rect.width,
        height: rect.height,
      }
    }
    return {
      quickActions: [...document.querySelectorAll('.today-secondary-actions button')].map(box),
      moreWays: [...document.querySelectorAll('.home-plan-action')].map(box),
      viewportWidth: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
    }
  })

  await page.screenshot({ path: path.join(out, 'home-core-actions.png') })
  assert.equal(geometry.quickActions.length, 2, 'Home should expose two immediate adventure actions')
  assert.equal(geometry.moreWays.length, 4, 'Home should expose four more-way actions')
  for (const action of [...geometry.quickActions, ...geometry.moreWays]) {
    assert.ok(action.height >= 44, `Home core actions should be at least 44px tall; received ${action.height}px`)
    assert.ok(action.width >= 44, `Home core actions should be at least 44px wide; received ${action.width}px`)
  }
  assert.ok(
    geometry.documentWidth <= geometry.viewportWidth + 1,
    `Home should not overflow horizontally; document ${geometry.documentWidth}px, viewport ${geometry.viewportWidth}px`,
  )
  report.checks.push({ name: 'Home core actions are touch-safe and contained', pass: true, geometry })

  await page.getByRole('button', { name: 'Quick Walk', exact: true }).click()
  await page.locator('.clock-bg--active').waitFor()

  await openFreshHome()
  await page.getByRole('button', { name: 'Find Spots', exact: true }).click()
  await page.locator('.plan-screen-header').waitFor()

  await openFreshHome()
  await page.getByRole('button', { name: 'Add your own', exact: true }).click()
  await page.getByTestId('add-adventure-flow').waitFor()

  await openFreshHome()
  await page.getByRole('button', { name: 'Build My Month', exact: true }).click()
  await page.locator('.build-month-kicker').getByText('Build My Month', { exact: true }).waitFor()

  await openFreshHome()
  await page.getByRole('button', { name: 'Challenges', exact: true }).click()
  await page.getByRole('heading', { name: 'Active Challenges', exact: true }).waitFor()
  assert.equal(runtimeErrors.length, 0, `Home core actions emitted runtime errors: ${runtimeErrors.join('; ')}`)

  report.checks.push({ name: 'Home core actions open their real destinations', pass: true })
  console.log('[PASS] Home core actions are touch-safe and open their real destinations')
} catch (error) {
  report.checks.push({ name: 'Home core action touch safety', pass: false, error: error.message })
  await page.screenshot({ path: path.join(out, 'failure.png'), fullPage: true })
  throw error
} finally {
  report.runtimeErrors = runtimeErrors
  await writeFile(path.join(out, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
}
