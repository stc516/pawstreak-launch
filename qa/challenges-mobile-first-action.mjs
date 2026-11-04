import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { chromium, devices } from 'playwright'

const base = process.env.QA_BASE_URL || 'http://127.0.0.1:4173'
const out = process.env.QA_OUT_DIR || 'artifacts/qa/challenges-mobile-first-action'
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
  await page.getByRole('button', { name: 'Challenges', exact: true }).click()

  const joinButton = page.getByRole('button', { name: 'Join', exact: true })
  await joinButton.waitFor()
  const geometry = await page.evaluate(() => {
    const rect = (selector) => {
      const box = document.querySelector(selector)?.getBoundingClientRect()
      if (!box) throw new Error(`Missing ${selector}`)
      return { top: box.top, bottom: box.bottom, height: box.height }
    }
    const join = document.querySelector('.ms-first-challenge .ms-challenge-card-cta')
    if (!join) throw new Error('Missing first challenge join action')
    const joinStyle = getComputedStyle(join)
    return {
      header: rect('.ms-screen-header'),
      section: rect('.ms-challenge-sec'),
      lead: rect('.ms-challenge-lead'),
      starter: rect('.ms-first-challenge'),
      join: rect('.ms-first-challenge .ms-challenge-card-cta'),
      localHeading: rect('.ms-discover-sec'),
      navigation: rect('.bnav'),
      joinColor: joinStyle.color,
      joinBackground: joinStyle.backgroundImage,
      viewportWidth: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
    }
  })

  assert.ok(geometry.join.height >= 44, `Join action should be at least 44px tall; received ${geometry.join.height}px`)
  assert.equal(geometry.joinColor, 'rgb(255, 255, 255)', 'Join action should use high-contrast white text')
  assert.notEqual(geometry.joinBackground, 'none', 'Join action should retain a distinct primary background')
  assert.ok(
    geometry.join.bottom <= geometry.navigation.top - 8,
    `Join action must clear fixed navigation; action bottom ${geometry.join.bottom}, navigation top ${geometry.navigation.top}`,
  )
  assert.ok(
    geometry.localHeading.top < geometry.navigation.top,
    'The next challenge section should be discoverable in the first phone viewport',
  )
  assert.ok(
    geometry.documentWidth <= geometry.viewportWidth + 1,
    `Challenges should not overflow horizontally; document ${geometry.documentWidth}px, viewport ${geometry.viewportWidth}px`,
  )

  await page.screenshot({ path: path.join(out, 'challenges-first-action.png') })
  report.checks.push({ name: 'mobile starter challenge is visible and actionable', pass: true, geometry })

  await joinButton.click()
  await page.getByRole('heading', { name: 'First Adventure Month', exact: true }).first().waitFor()
  await page.getByText('You joined this challenge', { exact: true }).waitFor()
  assert.equal(runtimeErrors.length, 0, `Challenges emitted runtime errors: ${runtimeErrors.join('; ')}`)

  await page.screenshot({ path: path.join(out, 'challenge-joined.png') })
  report.checks.push({ name: 'Join opens the active challenge path', pass: true })
  console.log('[PASS] Challenges exposes a high-contrast mobile Join action and opens the active path')
} catch (error) {
  report.checks.push({ name: 'mobile first challenge action', pass: false, error: error.message })
  await page.screenshot({ path: path.join(out, 'failure.png'), fullPage: true })
  throw error
} finally {
  report.runtimeErrors = runtimeErrors
  await writeFile(path.join(out, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
}
