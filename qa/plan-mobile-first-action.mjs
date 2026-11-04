import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { chromium, devices } from 'playwright'

const base = process.env.QA_BASE_URL || 'http://127.0.0.1:4173'
const out = process.env.QA_OUT_DIR || 'artifacts/qa/plan-mobile-first-action'
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
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('button', { name: 'Explore', exact: true })
    .click()

  const startButton = page.locator('.curated-spotlight-start')
  await startButton.waitFor()
  const geometry = await page.evaluate(() => {
    const rect = (selector) => {
      const box = document.querySelector(selector)?.getBoundingClientRect()
      assertBox(box, selector)
      return { top: box.top, bottom: box.bottom, left: box.left, right: box.right, height: box.height }
    }
    const assertBox = (box, selector) => {
      if (!box) throw new Error(`Missing ${selector}`)
    }
    return {
      header: rect('.plan-screen-header'),
      hype: rect('.explore-hype'),
      spotlight: rect('.curated-spotlight'),
      start: rect('.curated-spotlight-start'),
      navigation: rect('.bnav'),
      viewportWidth: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
    }
  })

  assert.ok(
    geometry.start.bottom <= geometry.navigation.top - 8,
    `Start action must clear the fixed navigation by 8px; action bottom ${geometry.start.bottom}, navigation top ${geometry.navigation.top}`,
  )
  assert.ok(
    geometry.header.bottom <= geometry.hype.top && geometry.hype.bottom <= geometry.spotlight.top,
    'Explore introduction and curated pick should not overlap',
  )
  assert.ok(
    geometry.documentWidth <= geometry.viewportWidth + 1,
    `Explore should not overflow horizontally; document ${geometry.documentWidth}px, viewport ${geometry.viewportWidth}px`,
  )

  await page.screenshot({ path: path.join(out, 'plan-first-action.png') })
  report.checks.push({ name: 'first Explore action clears mobile navigation', pass: true, geometry })

  await startButton.click()
  const readyHeading = page.getByText('Adventure ready', { exact: true })
  await readyHeading.waitFor()
  await page.getByRole('button', { name: 'Start adventure', exact: true }).waitFor()
  assert.equal(runtimeErrors.length, 0, `Explore emitted runtime errors: ${runtimeErrors.join('; ')}`)

  await page.screenshot({ path: path.join(out, 'adventure-ready.png') })
  report.checks.push({ name: 'first action opens adventure-ready flow', pass: true })
  console.log('[PASS] Explore keeps its first adventure action visible and opens the ready flow')
} catch (error) {
  report.checks.push({ name: 'mobile first Explore action', pass: false, error: error.message })
  await page.screenshot({ path: path.join(out, 'failure.png'), fullPage: true })
  throw error
} finally {
  report.runtimeErrors = runtimeErrors
  await writeFile(path.join(out, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
}
