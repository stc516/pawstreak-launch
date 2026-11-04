import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { chromium, devices } from 'playwright'

const base = process.env.QA_BASE_URL || 'http://127.0.0.1:4173'
const out = process.env.QA_OUT_DIR || 'artifacts/qa/share-flow-touch-safety'
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

const rect = async (locator) => {
  const box = await locator.boundingBox()
  if (!box) throw new Error('Missing share flow control')
  return { top: box.y, bottom: box.y + box.height, left: box.x, right: box.x + box.width, width: box.width, height: box.height }
}

try {
  await page.goto(`${base}/demo/app`, { waitUntil: 'networkidle' })
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
  await page.reload({ waitUntil: 'networkidle' })
  await page.locator('.home-dog-pill').waitFor()

  const navigation = page.getByRole('navigation', { name: 'Main navigation' })
  await navigation.getByRole('button', { name: 'Explore', exact: true }).click()
  const exploreEntry = page.locator('.share-inline-btn')
  await exploreEntry.waitFor()
  const explore = await rect(exploreEntry)
  await page.screenshot({ path: path.join(out, 'explore-story-entry.png') })

  await exploreEntry.click()
  const dialog = page.getByRole('dialog')
  await dialog.waitFor()
  const overlay = {
    close: await rect(dialog.getByRole('button', { name: 'Close share preview', exact: true })),
    share: await rect(dialog.getByRole('button', { name: 'Share image', exact: true })),
    story: await rect(dialog.getByRole('button', { name: 'Story 9:16', exact: true })),
    feed: await rect(dialog.getByRole('button', { name: 'Feed 4:5', exact: true })),
    save: await rect(dialog.getByRole('button', { name: 'Save to Photos', exact: true })),
  }
  await page.screenshot({ path: path.join(out, 'share-preview.png') })
  await dialog.getByRole('button', { name: 'Feed 4:5', exact: true }).click()
  assert.ok(await dialog.getByRole('button', { name: 'Feed 4:5', exact: true }).evaluate((button) => button.classList.contains('on')), 'Feed format should activate')
  await dialog.getByRole('button', { name: 'Story 9:16', exact: true }).click()
  assert.ok(await dialog.getByRole('button', { name: 'Story 9:16', exact: true }).evaluate((button) => button.classList.contains('on')), 'Story format should reactivate')
  await dialog.getByRole('button', { name: 'Close share preview', exact: true }).click()
  await dialog.waitFor({ state: 'hidden' })

  await navigation.getByRole('button', { name: 'Journey', exact: true }).click()
  const journeyEntry = page.locator('.share-inline-btn')
  await journeyEntry.waitFor()
  const journey = await rect(journeyEntry)
  await page.screenshot({ path: path.join(out, 'journey-story-entry.png') })
  await journeyEntry.click()
  await dialog.waitFor()
  await dialog.getByRole('button', { name: 'Close share preview', exact: true }).click()

  await navigation.getByRole('button', { name: 'Today', exact: true }).click()
  await page.getByRole('button', { name: 'Challenges', exact: true }).click()
  await page.getByRole('button', { name: 'View rewards', exact: true }).click()
  const rewardsEntry = page.locator('.share-inline-btn')
  await rewardsEntry.waitFor()
  const rewards = await rect(rewardsEntry)
  await page.screenshot({ path: path.join(out, 'rewards-story-entry.png') })
  await rewardsEntry.click()
  await dialog.waitFor()
  await dialog.getByRole('button', { name: 'Close share preview', exact: true }).click()

  const geometry = {
    entries: { explore, journey, rewards },
    overlay,
    viewportWidth: await page.evaluate(() => window.innerWidth),
    documentWidth: await page.evaluate(() => document.documentElement.scrollWidth),
  }
  for (const [name, action] of Object.entries(geometry.entries)) {
    assert.ok(action.height >= 44, `${name} story action should be at least 44px tall; received ${action.height}px`)
    assert.ok(action.width >= 44, `${name} story action should be at least 44px wide; received ${action.width}px`)
  }
  for (const [name, action] of Object.entries(geometry.overlay)) {
    assert.ok(action.height >= 44, `${name} share control should be at least 44px tall; received ${action.height}px`)
    assert.ok(action.width >= 44, `${name} share control should be at least 44px wide; received ${action.width}px`)
  }
  assert.ok(
    geometry.documentWidth <= geometry.viewportWidth + 1,
    `Share flow should not overflow horizontally; document ${geometry.documentWidth}px, viewport ${geometry.viewportWidth}px`,
  )
  assert.equal(runtimeErrors.length, 0, `Share flow emitted runtime errors: ${runtimeErrors.join('; ')}`)
  report.checks.push({ name: 'Story entry and share-preview controls are touch-safe', pass: true, geometry })
  report.checks.push({ name: 'Explore, Journey, and Rewards open the real share preview', pass: true })
  console.log('[PASS] Story actions and the share preview are touch-safe across Explore, Journey, and Rewards')
} catch (error) {
  report.checks.push({ name: 'Story share flow touch safety', pass: false, error: error.message })
  await page.screenshot({ path: path.join(out, 'failure.png'), fullPage: true })
  throw error
} finally {
  report.runtimeErrors = runtimeErrors
  await writeFile(path.join(out, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
}
