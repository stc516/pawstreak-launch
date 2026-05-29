import { chromium, devices } from 'playwright'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE_URL = process.env.QA_BASE_URL || 'http://localhost:5173'
const OUT_DIR = process.env.QA_OUT_DIR || path.join(__dirname, 'evidence', 'landing-branding')

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  const browser = await chromium.launch({ headless: true })
  const desktop = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const mobile = await browser.newContext({ ...devices['iPhone 13'] })

  const desktopPage = await desktop.newPage()
  await desktopPage.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' })
  await desktopPage.waitForTimeout(800)

  await desktopPage.locator('.landing-hero').screenshot({
    path: path.join(OUT_DIR, '01-landing-hero.png'),
  })
  await desktopPage.locator('.landing-phone').screenshot({
    path: path.join(OUT_DIR, '02-phone-mockup.png'),
  })

  const mobilePage = await mobile.newPage()
  await mobilePage.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' })
  await mobilePage.waitForTimeout(800)
  await mobilePage.screenshot({
    path: path.join(OUT_DIR, '03-mobile-viewport.png'),
    fullPage: false,
  })

  await browser.close()
  console.log(`Saved branding screenshots to ${OUT_DIR}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
