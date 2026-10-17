import assert from 'node:assert/strict'
import { chromium, devices } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

// Run against a preview/dev build with VITE_MAPBOX_TOKEN configured.
// No auth or production writes: this exercises the isolated demo route only.
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:4185'
const out = process.env.QA_OUT_DIR || 'artifacts/qa/geographic-map'
await mkdir(out, { recursive: true })
const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ ...devices['iPhone 13'], serviceWorkers: 'block' })
const page = await context.newPage()
const responses = []
page.on('response', response => { if (/api\.mapbox\.com/.test(response.url())) responses.push({ status: response.status(), path: new URL(response.url()).pathname }) })
async function explore() {
  await page.goto(`${base}/demo/app`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Explore', exact: true }).click()
}
try {
  await explore()
  await page.locator('.geographic-map-marker').first().waitFor({ timeout: 20000 })
  assert.ok(responses.some(r => r.status === 200 && r.path.includes('/styles/')), 'Mapbox style must actually respond')
  assert.ok(await page.locator('.mapboxgl-canvas').isVisible())
  const card = await page.locator('.plan-map-card--adventure').boundingBox()
  const canvas = await page.locator('.mapboxgl-canvas').boundingBox()
  assert.ok(canvas.width <= card.width && canvas.x + canvas.width <= card.x + card.width, 'Basemap must fit inside the mobile card, not be clipped')
  await page.locator('.geographic-map-marker').first().click()
  await page.locator('.plan-selected-place').waitFor()
  await page.locator('.plan-map-card--adventure').screenshot({ path: path.join(out, '01-real-mapbox.png') })
  console.log('[PASS] Real Mapbox basemap loaded and real-place marker selection works')
  await page.route('**://api.mapbox.com/**', route => route.abort())
  await explore()
  await page.getByTestId('map-unavailable').waitFor({ timeout: 20000 })
  assert.equal(await page.locator('.geographic-map-marker, .plan-map-pin--fallback, .plan-map-terrain').count(), 0)
  await page.locator('.geographic-place-row').first().click()
  await page.locator('.plan-selected-place').waitFor()
  await page.locator('.plan-map-card--adventure').screenshot({ path: path.join(out, '02-map-failure-honest-list.png') })
  console.log('[PASS] Failed Mapbox requests show a useful labeled place list with zero fabricated map pins')
  await page.unroute('**://api.mapbox.com/**')
  await page.getByRole('button', { name: 'Retry map', exact: true }).click()
  await page.locator('.geographic-map-marker').first().waitFor({ timeout: 20000 })
  console.log('[PASS] Retry recovers to a real basemap')
  await writeFile(path.join(out, 'report.json'), JSON.stringify({ pass: true, base, checkedAt: new Date().toISOString(), responses }, null, 2))
} catch (error) {
  await page.screenshot({ path: path.join(out, 'failure.png'), fullPage: true })
  await writeFile(path.join(out, 'report.json'), JSON.stringify({ pass: false, error: error.message, responses }, null, 2))
  throw error
} finally { await browser.close() }
