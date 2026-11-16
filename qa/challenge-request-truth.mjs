import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { chromium, devices } from 'playwright'

// Demo must never claim that a challenge-city request was sent to production.
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:4173'
const out = process.env.QA_OUT_DIR || 'artifacts/qa/challenge-request-truth'
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
  await page.waitForFunction(() => Boolean(localStorage.getItem('pawstreak:demo')))

  // Simulate an unsupported market in the saved demo profile, not a real request.
  await page.evaluate(() => {
    const key = 'pawstreak:demo'
    const state = JSON.parse(localStorage.getItem(key))
    state.locationSupported = false
    state.locationLabel = 'Uncurated QA market'
    localStorage.setItem(key, JSON.stringify(state))
  })
  await page.reload({ waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Challenges', exact: true }).click()
  await page.getByRole('heading', { name: 'Request a Local Challenge' }).waitFor()
  await page.getByText('Sign in to the live PawStreak app to send a real city request.').waitFor()

  const city = page.getByRole('textbox', { name: 'City or ZIP' })
  const submit = page.getByRole('button', { name: 'Request', exact: true })
  await city.fill('Albuquerque, NM')
  assert.equal(await submit.isDisabled(), true, 'Demo request must be disabled')
  await city.press('Enter')
  assert.equal(await page.getByText('Got it. We').count(), 0, 'Demo must not invent a saved request')
  assert.equal(runtimeErrors.length, 0, `Unexpected runtime errors: ${runtimeErrors.join('; ')}`)

  await page.screenshot({ path: path.join(out, 'unsupported-market-demo.png'), fullPage: true })
  report.checks.push({ name: 'Demo challenge request is transparently unavailable', pass: true })
  console.log('[PASS] Unsupported-market demo cannot report a real city request as sent')
} catch (error) {
  report.checks.push({ name: 'Demo challenge request truth', pass: false, error: error.message })
  await page.screenshot({ path: path.join(out, 'failure.png'), fullPage: true })
  throw error
} finally {
  report.runtimeErrors = runtimeErrors
  await writeFile(path.join(out, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
}
