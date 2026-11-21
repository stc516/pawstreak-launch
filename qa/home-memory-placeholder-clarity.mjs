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

  assert.equal(await page.locator('.home-adventure-stage').count(), 0, 'Home does not present an old saved memory as today’s launch')
  assert.equal(await page.getByRole('button', { name: 'Start a walk', exact: true }).count(), 1)
  assert.equal(await page.locator('.home-nearby-pick img').count(), 0, 'No stock destination photo is substituted for a missing real image')
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
  await page.screenshot({ path: path.join(out, 'home-memory-placeholder.png') })
  report.checks.push({ name: 'Home keeps launch separate from memories without fabricated artwork', pass: true })
  await page.locator('.bnav').getByRole('button', { name: 'Journey', exact: true }).click()
  const firstMemory = page.locator('.journey-memory-card:not([disabled])').first()
  const place = await firstMemory.locator('.journey-memory-title').innerText()
  await firstMemory.click()
  await page.locator('.field-notes').waitFor()
  assert.equal(await page.locator('.field-notes h1').innerText(), place, 'Journey opens the selected memory')
  assert.equal(await page.locator('.field-gallery img').count(), 0)
  assert.equal(await page.getByText(/no photo|without photos/i).count(), 0, 'No empty-photo warning')
  assert.ok(await page.getByRole('button', { name: 'View in Journey', exact: false }).isVisible())
  assert.equal(runtimeErrors.length, 0)
  await page.screenshot({ path: path.join(out, 'saved-memory.png') })
  report.checks.push({ name: 'No-photo memory remains complete and opens from Journey', pass: true })
} catch (error) {
  report.checks.push({ name: 'Home memory placeholder clarity', pass: false, error: error.message })
  await page.screenshot({ path: path.join(out, 'failure.png'), fullPage: true })
  throw error
} finally {
  report.runtimeErrors = runtimeErrors
  await writeFile(path.join(out, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
}
