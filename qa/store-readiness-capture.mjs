import { chromium, devices } from 'playwright'
import { copyFile, mkdir, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const BASE_URL = process.env.QA_BASE_URL || 'http://127.0.0.1:4173'
const OUT_DIR = process.env.STORE_CAPTURE_DIR || path.resolve('launch/native-store/2026-11-03/captures')
const VIEWPORT = { width: 390, height: 844 }

function commitSha() {
  return execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
}

async function screenshot(page, name) {
  const file = path.join(OUT_DIR, `${name}.png`)
  await page.screenshot({ path: file, animations: 'disabled' })
  return path.basename(file)
}

await mkdir(OUT_DIR, { recursive: true })
const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({
  ...devices['iPhone 13'],
  viewport: VIEWPORT,
  serviceWorkers: 'block',
  recordVideo: { dir: OUT_DIR, size: VIEWPORT },
})
const page = await context.newPage()
const files = []

try {
  await page.goto(`${BASE_URL}/demo/app`, { waitUntil: 'networkidle' })
  await page.evaluate(() => localStorage.removeItem('pawstreak:demo'))
  await page.reload({ waitUntil: 'networkidle' })
  await page.locator('.home-adventure-launch-hero').waitFor({ state: 'visible' })
  files.push(await screenshot(page, '01-today-home'))

  await page.getByRole('button', { name: 'Explore', exact: true }).click()
  await page.locator('.plan-map-card--adventure').waitFor({ state: 'visible' })
  files.push(await screenshot(page, '02-explore'))

  await page.getByRole('button', { name: 'Today', exact: true }).click()
  await page.getByRole('button', { name: 'Quick Walk', exact: true }).click()
  const startButton = page.getByRole('button', { name: 'Start adventure', exact: true })
  if (await startButton.isVisible()) await startButton.click()
  await page.locator('.cbtn--save-memory').waitFor({ state: 'visible' })
  files.push(await screenshot(page, '03-active-adventure'))

  await page.locator('.cbtn--save-memory').click()
  await page.locator('.share-preview-shell').waitFor({ state: 'visible' })
  files.push(await screenshot(page, '04-share-card'))

  await page.locator('.share-preview-close').click()
  await page.locator('.memory-hero').waitFor({ state: 'visible' })
  files.push(await screenshot(page, '05-saved-memory'))

  await page.getByRole('button', { name: 'Back', exact: true }).click()
  await page.getByRole('button', { name: 'Today', exact: true }).click()
  await page.locator('.home-dog-pill').click()
  await page.getByRole('button', { name: 'Open settings' }).click()
  await page.getByText('Daily reminders', { exact: true }).waitFor({ state: 'visible' })
  files.push(await screenshot(page, '06-reminders-settings'))
} finally {
  const video = page.video()
  await page.close()
  await context.close()
  if (video) {
    const source = await video.path()
    const destination = path.join(OUT_DIR, 'pawstreak-current-demo-flow.webm')
    await copyFile(source, destination)
    await unlink(source).catch(() => {})
    files.push(path.basename(destination))
  }
  await browser.close()
}

await writeFile(path.join(OUT_DIR, 'manifest.json'), `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  commit: commitSha(),
  source: `${BASE_URL}/demo/app`,
  disclosure: 'Authentic current PawStreak demo UI. Demo dog and activity data are not customer claims.',
  files,
}, null, 2)}\n`)

console.log(`Captured ${files.length} store-readiness assets in ${OUT_DIR}`)
