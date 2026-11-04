import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { chromium, devices } from 'playwright'

const base = process.env.QA_BASE_URL || 'http://127.0.0.1:4173'
const out = process.env.QA_OUT_DIR || 'artifacts/qa/active-adventure-mobile-banner'
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
  await page.getByRole('button', { name: 'Minimize active adventure', exact: true }).click()

  const banner = page.locator('[data-testid="active-adventure-banner"]')
  await banner.waitFor()
  const geometry = await page.evaluate(() => {
    const rect = (selector) => {
      const box = document.querySelector(selector)?.getBoundingClientRect()
      if (!box) throw new Error(`Missing ${selector}`)
      return { top: box.top, bottom: box.bottom, left: box.left, right: box.right, height: box.height }
    }
    const buttons = [...document.querySelectorAll('.active-adventure-banner-btn')]
    const computed = buttons.map((button) => {
      const box = button.getBoundingClientRect()
      const style = getComputedStyle(button)
      return { height: box.height, color: style.color, backgroundImage: style.backgroundImage }
    })
    const title = document.querySelector('.active-adventure-banner-title')
    if (!title) throw new Error('Missing active adventure banner title')
    return {
      banner: rect('.active-adventure-banner'),
      main: rect('.active-adventure-banner-main'),
      actions: computed,
      titleColor: getComputedStyle(title).color,
      viewportWidth: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
    }
  })

  assert.equal(geometry.actions.length, 3, 'Active adventure banner should expose three explicit actions')
  for (const action of geometry.actions) {
    assert.ok(action.height >= 44, `Each banner action should be at least 44px tall; received ${action.height}px`)
  }
  assert.ok(geometry.main.height >= 52, `Banner summary should be easy to tap; received ${geometry.main.height}px`)
  assert.equal(geometry.titleColor, 'rgb(255, 255, 255)', 'Adventure title should stay readable on the forest banner')
  assert.equal(geometry.actions[0].color, 'rgb(255, 255, 255)', 'Resume should use readable white text')
  assert.equal(geometry.actions[1].color, 'rgb(23, 62, 44)', 'Review & finish should use dark text on lime')
  assert.ok(
    geometry.banner.left >= 0 && geometry.banner.right <= geometry.viewportWidth,
    `Banner should stay within the phone viewport; left ${geometry.banner.left}, right ${geometry.banner.right}`,
  )
  assert.ok(
    geometry.documentWidth <= geometry.viewportWidth + 1,
    `Banner should not overflow horizontally; document ${geometry.documentWidth}px, viewport ${geometry.viewportWidth}px`,
  )

  await page.screenshot({ path: path.join(out, 'active-adventure-banner.png') })
  report.checks.push({ name: 'minimized adventure banner is coherent and touch-safe', pass: true, geometry })

  await page.getByRole('button', { name: 'Resume', exact: true }).click()
  await page.locator('.clock-bg--active').waitFor()
  await page.getByRole('button', { name: 'Minimize active adventure', exact: true }).click()
  const beforeReview = await page.evaluate(() => {
    const state = JSON.parse(localStorage.getItem('pawstreak:demo') || '{}')
    return { active: Boolean(state.activeAdventure), journeyCount: state.journeyEntries?.length ?? 0 }
  })
  await page.getByRole('button', { name: 'Review & finish', exact: true }).click()
  await page.locator('[data-testid="adventure-finish-review"]').waitFor()
  const afterReview = await page.evaluate(() => {
    const state = JSON.parse(localStorage.getItem('pawstreak:demo') || '{}')
    return { active: Boolean(state.activeAdventure), journeyCount: state.journeyEntries?.length ?? 0 }
  })
  assert.equal(afterReview.active, true, 'Review should preserve the active adventure until explicit save')
  assert.equal(
    afterReview.journeyCount,
    beforeReview.journeyCount,
    'Review should not create a Journey memory before explicit save',
  )
  assert.equal(runtimeErrors.length, 0, `Active banner emitted runtime errors: ${runtimeErrors.join('; ')}`)

  report.checks.push({ name: 'Resume and Review preserve the explicit finish flow', pass: true, beforeReview, afterReview })
  console.log('[PASS] Active adventure banner is touch-safe and preserves Resume/Review state')
} catch (error) {
  report.checks.push({ name: 'active adventure mobile banner', pass: false, error: error.message })
  await page.screenshot({ path: path.join(out, 'failure.png') })
  throw error
} finally {
  report.runtimeErrors = runtimeErrors
  await writeFile(path.join(out, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
}
