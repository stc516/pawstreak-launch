import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { chromium, devices } from 'playwright'

const base = process.env.QA_BASE_URL || 'http://127.0.0.1:4173'
const out = process.env.QA_OUT_DIR || 'artifacts/qa/home-memory-placeholder-clarity'
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

  const memoryButton = page.locator('.home-adventure-stage')
  const placeholder = page.locator('.home-adventure-stage-art.card-img--empty > .card-img-placeholder')
  await placeholder.waitFor()
  const geometry = await page.evaluate(() => {
    const rect = (selector) => {
      const box = document.querySelector(selector)?.getBoundingClientRect()
      if (!box) throw new Error(`Missing ${selector}`)
      return { top: box.top, bottom: box.bottom, left: box.left, right: box.right, height: box.height }
    }
    return {
      art: rect('.home-adventure-stage-art'),
      placeholder: rect('.home-adventure-stage-art > .card-img-placeholder'),
      status: rect('.home-adventure-stage-copy span'),
      detail: rect('.home-adventure-stage-copy small'),
      pack: rect('.home-adventure-stage-pack'),
      viewportWidth: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
    }
  })

  assert.ok(
    geometry.placeholder.top >= geometry.detail.bottom + 8,
    `No-photo label should clear the memory copy; label top ${geometry.placeholder.top}, copy bottom ${geometry.detail.bottom}`,
  )
  assert.ok(
    geometry.placeholder.right <= geometry.pack.left - 8,
    `No-photo label should clear Pack status; label right ${geometry.placeholder.right}, pack left ${geometry.pack.left}`,
  )
  assert.ok(
    geometry.placeholder.top >= geometry.art.top && geometry.placeholder.bottom <= geometry.art.bottom,
    'No-photo label should stay inside the memory artwork',
  )
  assert.ok(
    geometry.status.bottom < geometry.placeholder.top,
    'Saved-today status and no-photo label should not overlap',
  )
  assert.ok(
    geometry.documentWidth <= geometry.viewportWidth + 1,
    `Home should not overflow horizontally; document ${geometry.documentWidth}px, viewport ${geometry.viewportWidth}px`,
  )

  await page.screenshot({ path: path.join(out, 'home-memory-placeholder.png') })
  report.checks.push({ name: 'no-photo label clears Home memory content', pass: true, geometry })

  await memoryButton.click()
  await page.getByText('That was a good day.', { exact: true }).waitFor()
  await page.getByText('This adventure is saved even without photos.', { exact: true }).waitFor()
  assert.equal(runtimeErrors.length, 0, `Home memory emitted runtime errors: ${runtimeErrors.join('; ')}`)

  await page.screenshot({ path: path.join(out, 'saved-memory.png') })
  report.checks.push({ name: 'memory hero opens the truthful saved-memory detail', pass: true })
  console.log('[PASS] Home no-photo label is clear and the saved-memory handoff remains truthful')
} catch (error) {
  report.checks.push({ name: 'Home memory placeholder clarity', pass: false, error: error.message })
  await page.screenshot({ path: path.join(out, 'failure.png'), fullPage: true })
  throw error
} finally {
  report.runtimeErrors = runtimeErrors
  await writeFile(path.join(out, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
}
