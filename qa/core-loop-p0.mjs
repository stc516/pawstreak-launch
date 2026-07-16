import { chromium, devices } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const BASE_URL = process.env.QA_BASE_URL || 'http://127.0.0.1:4173'
const OUT_DIR = process.env.QA_OUT_DIR || path.resolve('qa/evidence/core-loop-p0')
const results = []

function record(id, pass, detail) {
  results.push({ id, pass, detail })
  console.log(`[${pass ? 'PASS' : 'FAIL'}] ${id}: ${detail}`)
}

await mkdir(OUT_DIR, { recursive: true })
const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({
  ...devices['iPhone 13'],
  serviceWorkers: 'block',
  reducedMotion: 'no-preference',
})
await context.addInitScript(() => {
  Object.defineProperty(navigator, 'canShare', {
    configurable: true,
    value: (payload) => Array.isArray(payload?.files) && payload.files.length > 0,
  })
  Object.defineProperty(navigator, 'share', {
    configurable: true,
    value: async (payload) => {
      window.__pawstreakQaShare = {
        fileCount: payload.files?.length ?? 0,
        fileType: payload.files?.[0]?.type ?? null,
        fileName: payload.files?.[0]?.name ?? null,
      }
    },
  })
})

const page = await context.newPage()
const runtimeErrors = []
page.on('pageerror', (error) => runtimeErrors.push(error.message))

try {
  await page.goto(`${BASE_URL}/demo/app`, { waitUntil: 'networkidle' })
  await page.evaluate(() => localStorage.removeItem('pawstreak:demo'))
  await page.reload({ waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Quick Walk', exact: true }).click()
  const startButton = page.getByRole('button', { name: 'Start adventure', exact: true })
  if (await startButton.isVisible()) await startButton.click()
  await page.getByRole('button', { name: 'Finish adventure', exact: true }).waitFor()

  const finishButton = page.getByRole('button', { name: 'Finish adventure', exact: true })
  record(
    'finish-cta',
    (await finishButton.textContent())?.includes('save memory') ?? false,
    `Visible label: ${(await finishButton.textContent())?.trim()}`,
  )
  await page.screenshot({ path: path.join(OUT_DIR, '01-finish-save-mobile.png'), fullPage: true })

  await finishButton.click()
  await page.locator('.share-preview-shell').waitFor({ state: 'visible', timeout: 10000 })
  const savedState = await page.evaluate(() => JSON.parse(localStorage.getItem('pawstreak:demo') || '{}'))
  record(
    'adventure-saved',
    !savedState.activeAdventure && savedState.journeyEntries?.[0]?.place === 'Neighborhood Walk',
    'Active adventure cleared and a real Journey memory was created',
  )
  record(
    'share-payoff-immediate',
    await page.getByRole('button', { name: 'Instagram', exact: true }).isVisible(),
    'Instagram Story card opens immediately after save',
  )
  await page.screenshot({ path: path.join(OUT_DIR, '02-instagram-story-mobile.png'), fullPage: true })

  await page.getByRole('button', { name: 'Instagram', exact: true }).click()
  await page.waitForFunction(() => window.__pawstreakQaShare?.fileCount === 1, null, {
    timeout: 15000,
  })
  const sharePayload = await page.evaluate(() => window.__pawstreakQaShare)
  record(
    'instagram-image-share',
    sharePayload?.fileCount === 1 && sharePayload?.fileType === 'image/png',
    sharePayload ? `${sharePayload.fileName} (${sharePayload.fileType})` : 'No file payload',
  )

  await page.locator('.share-preview-close').click()
  await page.locator('.memory-instagram-cta').waitFor({ state: 'visible' })
  await page.screenshot({ path: path.join(OUT_DIR, '03-saved-memory-payoff.png'), fullPage: true })

  await page.getByRole('button', { name: 'Back', exact: true }).click()
  await page.getByRole('button', { name: 'Explore', exact: true }).click()
  await page.locator('.plan-map-card--adventure').waitFor({ state: 'visible', timeout: 10000 })
  const mapboxPins = page.locator('.plan-map-pin--mapbox')
  const fallbackPins = page.locator('.plan-map-pin--fallback')
  const pinCount = (await mapboxPins.count()) + (await fallbackPins.count())
  record('map-usable', pinCount > 0, `${pinCount} tappable adventure pins rendered`)
  const firstPin = (await mapboxPins.count()) > 0 ? mapboxPins.first() : fallbackPins.first()
  await firstPin.click({ force: true })
  await page.locator('.plan-map-tooltip').waitFor({ state: 'visible' })
  record(
    'map-pin-selection',
    await page.locator('.pcard--map-selected').first().isVisible(),
    'Pin tap synchronizes the map tooltip and adventure card',
  )
  await page.locator('.plan-map-card--adventure').screenshot({ path: path.join(OUT_DIR, '04-working-adventure-map.png') })

  record(
    'runtime-errors',
    runtimeErrors.length === 0,
    runtimeErrors.length ? runtimeErrors.join(' | ') : 'No uncaught page errors',
  )
} finally {
  const report = {
    baseUrl: BASE_URL,
    checkedAt: new Date().toISOString(),
    pass: results.every((result) => result.pass),
    results,
  }
  await writeFile(path.join(OUT_DIR, 'report.json'), `${JSON.stringify(report, null, 2)}\n`)
  await browser.close()
  if (!report.pass) process.exitCode = 1
}
