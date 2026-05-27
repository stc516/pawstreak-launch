import { chromium, devices } from 'playwright'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE_URL = process.env.QA_BASE_URL || 'http://localhost:5173'
const OUT_DIR = process.env.QA_OUT_DIR || path.join(__dirname, 'evidence', 'landing-start-flow')

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  const browser = await chromium.launch({ headless: true })
  const desktop = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const mobile = await browser.newContext({ ...devices['iPhone 13'] })

  const desktopPage = await desktop.newPage()
  await desktopPage.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' })
  await desktopPage.waitForTimeout(800)
  await desktopPage.locator('.landing-hero').screenshot({
    path: path.join(OUT_DIR, '01-landing-hero-desktop.png'),
  })
  await desktopPage.locator('.landing-phone').screenshot({
    path: path.join(OUT_DIR, '02-phone-mockup.png'),
  })

  const mobilePage = await mobile.newPage()
  await mobilePage.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' })
  await mobilePage.waitForTimeout(800)
  await mobilePage.screenshot({
    path: path.join(OUT_DIR, '03-landing-hero-mobile.png'),
    fullPage: false,
  })

  await mobilePage.getByRole('button', { name: 'Get started now', exact: true }).first().click()
  await mobilePage.waitForTimeout(800)
  const onStart = mobilePage.url().includes('/start')
  console.log(`Get started now -> /start: ${onStart ? 'PASS' : 'FAIL'} (${mobilePage.url()})`)
  await mobilePage.screenshot({
    path: path.join(OUT_DIR, '04-start-mobile.png'),
    fullPage: true,
  })

  await desktopPage.goto(`${BASE_URL}/start`, { waitUntil: 'networkidle' })
  await desktopPage.waitForTimeout(800)
  await desktopPage.locator('.start-page-main').screenshot({
    path: path.join(OUT_DIR, '05-start-desktop.png'),
  })

  await desktopPage.getByRole('button', { name: 'Continue in browser', exact: true }).first().click()
  await desktopPage.waitForTimeout(800)
  const onApp = desktopPage.url().includes('/app')
  console.log(`Continue in browser -> /app: ${onApp ? 'PASS' : 'FAIL'} (${desktopPage.url()})`)

  await browser.close()
  console.log(`Saved screenshots to ${OUT_DIR}`)
  if (!onStart || !onApp) process.exit(1)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
