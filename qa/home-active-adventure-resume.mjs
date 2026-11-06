import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { chromium, devices } from 'playwright'

const base = process.env.QA_BASE_URL || 'http://127.0.0.1:4173'
const out = process.env.QA_OUT_DIR || 'artifacts/qa/home-active-adventure-resume'
const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({
  ...devices['iPhone 13'],
  reducedMotion: 'reduce',
  serviceWorkers: 'block',
})
const page = await context.newPage()
const errors = []
const report = { base, checkedAt: new Date().toISOString(), checks: [] }

page.on('pageerror', (error) => errors.push(error.message))
await mkdir(out, { recursive: true })

async function activeSnapshot() {
  return page.evaluate(() => {
    const raw = localStorage.getItem('pawstreak:demo')
    const state = raw ? JSON.parse(raw) : {}
    return {
      id: state.activeAdventure?.id,
      location: state.activeAdventure?.location,
      started: state.activeAdventure?.started,
      view: state.activeAdventureView,
      memoryCount: state.journeyEntries?.length ?? 0,
    }
  })
}

try {
  await page.goto(`${base}/demo/app`, { waitUntil: 'networkidle' })
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
  await page.reload({ waitUntil: 'networkidle' })
  await page.locator('.home-dog-pill').waitFor()

  await page.getByRole('button', { name: 'Quick Walk', exact: true }).click()
  await page.locator('.clock-bg--active').waitFor()
  await page.getByRole('button', { name: 'Minimize active adventure', exact: true }).click()
  await page.locator('[data-testid="active-adventure-banner"]').waitFor()
  const before = await activeSnapshot()
  assert.ok(before.id, 'A real adventure session must exist before testing resume')
  assert.equal(before.started, true)

  const hero = page.getByRole('button', { name: `Return to your adventure: ${before.location}` })
  await hero.waitFor()
  assert.equal(
    await hero.locator('.home-adventure-stage-copy strong').innerText(),
    before.location,
    'Home must show the actual active location rather than a fresh recommendation',
  )
  await page.screenshot({ path: path.join(out, '01-home-with-active-adventure.png') })
  await hero.click()
  await page.locator('.clock-bg--active').waitFor()
  const afterHero = await activeSnapshot()
  assert.equal(afterHero.id, before.id, 'Hero must resume the existing session, not create a new one')
  assert.equal(afterHero.memoryCount, before.memoryCount, 'Resuming must not save a memory')
  report.checks.push({ name: 'Home hero resumes existing adventure', pass: true })

  await page.getByRole('button', { name: 'Minimize active adventure', exact: true }).click()
  const mainCta = page.locator('.today-primary-action')
  await mainCta.waitFor()
  assert.match(await mainCta.innerText(), new RegExp('Return to', 'i'))
  assert.ok((await mainCta.innerText()).includes(before.location), 'Main CTA must name the active place')
  await page.screenshot({ path: path.join(out, '02-home-return-cta.png') })
  await mainCta.click()
  await page.locator('.clock-bg--active').waitFor()
  const afterCta = await activeSnapshot()
  assert.equal(afterCta.id, before.id, 'Main CTA must resume, not replace the existing session')
  assert.equal(afterCta.memoryCount, before.memoryCount, 'Main CTA must not save a memory')
  assert.equal(errors.length, 0, `Unexpected browser errors: ${errors.join('; ')}`)
  report.checks.push({ name: 'Home main CTA resumes same adventure without side effects', pass: true })
  console.log('[PASS] Home hero and primary action resume the same adventure session')
} catch (error) {
  report.checks.push({ name: 'home active-adventure resume', pass: false, error: error.message })
  await page.screenshot({ path: path.join(out, 'failure.png'), fullPage: true })
  throw error
} finally {
  report.runtimeErrors = errors
  await writeFile(path.join(out, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
}
