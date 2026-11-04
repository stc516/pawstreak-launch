import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { chromium, devices } from 'playwright'

const base = process.env.QA_BASE_URL || 'http://127.0.0.1:4173'
const out = process.env.QA_OUT_DIR || 'artifacts/qa/mobile-navigation-touch-safety'
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

  const geometry = await page.evaluate(() => {
    const rect = (element) => {
      const box = element?.getBoundingClientRect()
      if (!box) throw new Error('Missing mobile navigation element')
      return {
        top: box.top,
        bottom: box.bottom,
        left: box.left,
        right: box.right,
        width: box.width,
        height: box.height,
      }
    }
    const navigation = document.querySelector('.bnav')
    return {
      navigation: rect(navigation),
      actions: [...document.querySelectorAll('.bnav .ni')].map((action) => ({
        label: action.textContent?.trim() ?? '',
        ...rect(action),
      })),
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      documentWidth: document.documentElement.scrollWidth,
    }
  })

  await page.screenshot({ path: path.join(out, 'mobile-navigation.png') })
  assert.deepEqual(
    geometry.actions.map((action) => action.label),
    ['Today', 'Explore', 'Journey', 'Pack'],
    'The mobile navigation should expose the four approved destinations',
  )
  for (const action of geometry.actions) {
    assert.ok(action.height >= 44, `${action.label} should be at least 44px tall; received ${action.height}px`)
    assert.ok(action.width >= 44, `${action.label} should be at least 44px wide; received ${action.width}px`)
  }
  assert.ok(
    Math.abs(geometry.navigation.bottom - geometry.viewportHeight) <= 1,
    `Navigation should remain fixed to the viewport bottom; received ${geometry.navigation.bottom}/${geometry.viewportHeight}`,
  )
  assert.ok(
    geometry.documentWidth <= geometry.viewportWidth + 1,
    `Navigation should not overflow horizontally; document ${geometry.documentWidth}px, viewport ${geometry.viewportWidth}px`,
  )
  report.checks.push({ name: 'Mobile navigation is touch-safe and contained', pass: true, geometry })

  const navigation = page.getByRole('navigation', { name: 'Main navigation' })
  for (const label of ['Explore', 'Journey', 'Pack', 'Today']) {
    await page.locator('.scroll').evaluate((element) => element.scrollTo({ top: 400, behavior: 'auto' }))
    await navigation.getByRole('button', { name: label, exact: true }).click()
    await page.waitForTimeout(100)
    await assert.doesNotReject(async () => {
      await navigation.getByRole('button', { name: label, exact: true }).waitFor()
    })
    assert.equal(
      await navigation.getByRole('button', { name: label, exact: true }).getAttribute('aria-current'),
      'page',
      `${label} should become the active destination`,
    )
    assert.equal(await page.locator('.scroll').evaluate((element) => element.scrollTop), 0, `${label} should reset scroll position`)
  }
  assert.equal(runtimeErrors.length, 0, `Navigation emitted runtime errors: ${runtimeErrors.join('; ')}`)
  report.checks.push({ name: 'Every mobile destination activates and resets scroll', pass: true })
  console.log('[PASS] Mobile navigation is touch-safe and preserves all four destination handoffs')
} catch (error) {
  report.checks.push({ name: 'Mobile navigation touch safety', pass: false, error: error.message })
  await page.screenshot({ path: path.join(out, 'failure.png'), fullPage: true })
  throw error
} finally {
  report.runtimeErrors = runtimeErrors
  await writeFile(path.join(out, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
}
