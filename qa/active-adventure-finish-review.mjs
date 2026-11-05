import { chromium, devices } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const BASE_URL = process.env.QA_BASE_URL || 'http://127.0.0.1:4173'
const OUT_DIR = process.env.QA_OUT_DIR || path.resolve('qa/evidence/active-adventure-finish-review')
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
const page = await context.newPage()
const runtimeErrors = []
page.on('pageerror', (error) => runtimeErrors.push(error.message))

try {
  await page.goto(`${BASE_URL}/demo/app`, { waitUntil: 'networkidle' })
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
  await page.reload({ waitUntil: 'networkidle' })

  await page.getByRole('button', { name: 'Quick Walk', exact: true }).click()
  await page.locator('.active-adventure-minimize').click()
  const banner = page.getByTestId('active-adventure-banner')
  await banner.waitFor({ state: 'visible' })

  const beforeReview = await page.evaluate(() => {
    const state = JSON.parse(localStorage.getItem('pawstreak:demo') || '{}')
    return {
      activeAdventureId: state.activeAdventure?.id ?? null,
      journeyCount: state.journeyEntries?.length ?? 0,
    }
  })

  await banner.getByRole('button', { name: 'Review & finish', exact: true }).click()
  await page.getByTestId('adventure-finish-review').waitFor({ state: 'visible' })
  await page.screenshot({ path: path.join(OUT_DIR, '01-finish-review-mobile.png') })

  const afterReview = await page.evaluate(() => {
    const state = JSON.parse(localStorage.getItem('pawstreak:demo') || '{}')
    return {
      activeAdventureId: state.activeAdventure?.id ?? null,
      journeyCount: state.journeyEntries?.length ?? 0,
    }
  })
  record(
    'review-does-not-complete',
    afterReview.activeAdventureId === beforeReview.activeAdventureId &&
      afterReview.journeyCount === beforeReview.journeyCount,
    `adventure=${afterReview.activeAdventureId}; Journey=${beforeReview.journeyCount}→${afterReview.journeyCount}`,
  )
  record(
    'memory-review-is-visible',
    await page.getByText('What made today worth remembering?', { exact: true }).isVisible() &&
      await page.getByText('Photos from today', { exact: true }).isVisible(),
    'Recap choices and photo review are visible before the final save',
  )

  const recapChips = page.locator('.rchips--memory .rc')
  const firstRecap = recapChips.first()
  const recapOptionsCount = await recapChips.count()
  const initiallyPressed = await page.locator('.rchips--memory .rc[aria-pressed="true"]').count()
  record(
    'recaps-are-optional',
    recapOptionsCount > 0 && initiallyPressed === 0,
    `${recapOptionsCount} options, ${initiallyPressed} preselected; no invented sentiment`,
  )
  if (recapOptionsCount > 0) {
    await firstRecap.click()
    record(
      'recap-toggle-accessible',
      await firstRecap.getAttribute('aria-pressed') === 'true',
      'Selected recap reports pressed state to assistive technologies',
    )
    await firstRecap.click()
    record(
      'recap-can-be-cleared',
      await firstRecap.getAttribute('aria-pressed') === 'false',
      'Deselected recap does not reintroduce a default choice',
    )
  }

  await page.getByRole('button', { name: 'Finish adventure and save memory', exact: true }).click()
  await page.locator('.share-preview-shell').waitFor({ state: 'visible' })
  const afterSave = await page.evaluate(() => {
    const state = JSON.parse(localStorage.getItem('pawstreak:demo') || '{}')
    return {
      hasActiveAdventure: Boolean(state.activeAdventure),
      journeyCount: state.journeyEntries?.length ?? 0,
      newestRecapLabels: state.journeyEntries?.[0]?.recapLabels ?? null,
      newestTags: state.journeyEntries?.[0]?.tags ?? [],
      newestMood: state.journeyEntries?.[0]?.memoryMood ?? null,
    }
  })
  record(
    'no-invented-recap-on-save',
    (afterSave.newestRecapLabels === null ||
      (Array.isArray(afterSave.newestRecapLabels) && afterSave.newestRecapLabels.length === 0)) &&
      !afterSave.newestTags.includes('Loved it') && afterSave.newestMood === null,
    `Saved recap=${JSON.stringify(afterSave.newestRecapLabels)}, tags=${JSON.stringify(afterSave.newestTags)}, mood=${afterSave.newestMood}`, 
  )
  record(
    'explicit-save-completes',
    !afterSave.hasActiveAdventure && afterSave.journeyCount === beforeReview.journeyCount + 1,
    `active=${afterSave.hasActiveAdventure}; Journey=${beforeReview.journeyCount}→${afterSave.journeyCount}`,
  )
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
