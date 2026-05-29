import { chromium, devices } from 'playwright'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE_URL = process.env.QA_BASE_URL || 'http://127.0.0.1:5199'
const OUT_DIR = process.env.QA_OUT_DIR || path.join(__dirname, 'evidence', 'landing-full-story')

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  const browser = await chromium.launch({ headless: true })
  const desktop = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const mobile = await browser.newContext({ ...devices['iPhone 13'] })

  const desktopPage = await desktop.newPage()
  await desktopPage.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' })
  await desktopPage.waitForSelector('.landing-hero', { timeout: 10000 })
  await desktopPage.waitForTimeout(600)
  await desktopPage.screenshot({
    path: path.join(OUT_DIR, '01-landing-desktop-full.png'),
    fullPage: true,
  })

  const sections = [
    ['hero', '.landing-hero'],
    ['features', '.landing-features'],
    ['story', '.landing-story'],
    ['how', '.landing-how'],
    ['screens', '.landing-screens'],
    ['different', '.landing-different'],
    ['founder', '.landing-founder'],
    ['signup', '.landing-signup'],
  ]

  for (const [name, selector] of sections) {
    const visible = await desktopPage.locator(selector).isVisible()
    console.log(`Section ${name}: ${visible ? 'PASS' : 'FAIL'}`)
    if (!visible) process.exitCode = 1
  }

  const mobilePage = await mobile.newPage()
  await mobilePage.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' })
  await mobilePage.waitForSelector('.landing-hero', { timeout: 10000 })
  await mobilePage.waitForTimeout(600)
  await mobilePage.screenshot({
    path: path.join(OUT_DIR, '02-landing-mobile-viewport.png'),
    fullPage: false,
  })
  await mobilePage.screenshot({
    path: path.join(OUT_DIR, '03-landing-mobile-full.png'),
    fullPage: true,
  })

  await browser.close()
  console.log(`Saved screenshots to ${OUT_DIR}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
