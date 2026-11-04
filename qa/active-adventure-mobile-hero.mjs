import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { chromium, devices } from 'playwright'

const base = process.env.QA_BASE_URL || 'http://127.0.0.1:4173'
const out = process.env.QA_OUT_DIR || 'artifacts/qa/active-adventure-mobile-hero'
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
  await page.getByRole('button', { name: 'Quick Walk', exact: true }).click()
  await page.locator('.clock-bg--active').waitFor()

  const geometry = await page.evaluate(() => {
    const rect = (selector) => {
      const box = document.querySelector(selector)?.getBoundingClientRect()
      if (!box) throw new Error(`Missing ${selector}`)
      return { top: box.top, bottom: box.bottom, left: box.left, right: box.right, height: box.height }
    }
    const color = (selector) => {
      const element = document.querySelector(selector)
      if (!element) throw new Error(`Missing ${selector}`)
      return getComputedStyle(element).color
    }
    return {
      hero: rect('.clock-bg--active'),
      minimize: rect('.active-adventure-minimize'),
      content: rect('.scroll--active'),
      minimizeColor: color('.active-adventure-minimize'),
      locationColor: color('.clk-sub'),
      timerColor: color('.clk-time'),
      dogsColor: color('.clk-dogs'),
      viewportWidth: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
    }
  })

  assert.ok(
    geometry.minimize.height >= 44,
    `Browse app should be at least 44px tall; received ${geometry.minimize.height}px`,
  )
  assert.equal(geometry.timerColor, 'rgb(255, 255, 255)', 'The active timer should use high-contrast white')
  assert.equal(geometry.locationColor, 'rgb(223, 255, 151)', 'The active location should use high-contrast lime')
  assert.equal(geometry.dogsColor, 'rgb(239, 255, 230)', 'The active dog status should stay legible on forest green')
  assert.ok(
    geometry.hero.bottom <= geometry.content.top + 1,
    `Active hero should not overlap the adventure content; hero bottom ${geometry.hero.bottom}, content top ${geometry.content.top}`,
  )
  assert.ok(
    geometry.documentWidth <= geometry.viewportWidth + 1,
    `Active adventure should not overflow horizontally; document ${geometry.documentWidth}px, viewport ${geometry.viewportWidth}px`,
  )

  await page.screenshot({ path: path.join(out, 'active-adventure-hero.png') })
  report.checks.push({ name: 'active adventure hero is readable and touch-safe', pass: true, geometry })

  await page.getByRole('button', { name: 'Minimize active adventure', exact: true }).click()
  await page.locator('[data-testid="active-adventure-banner"]').waitFor()
  await page.getByRole('button', { name: 'Resume', exact: true }).click()
  await page.locator('.clock-bg--active').waitFor()
  assert.equal(runtimeErrors.length, 0, `Active adventure emitted runtime errors: ${runtimeErrors.join('; ')}`)

  report.checks.push({ name: 'Browse app and Resume preserve the active adventure', pass: true })
  console.log('[PASS] Active adventure hero is high-contrast, touch-safe, and resumes correctly')
} catch (error) {
  report.checks.push({ name: 'active adventure mobile hero', pass: false, error: error.message })
  await page.screenshot({ path: path.join(out, 'failure.png') })
  throw error
} finally {
  report.runtimeErrors = runtimeErrors
  await writeFile(path.join(out, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
}
