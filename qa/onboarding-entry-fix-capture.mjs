import { chromium, devices } from 'playwright'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE_URL = process.env.QA_BASE_URL || 'http://localhost:4173'
const OUT_DIR = process.env.QA_OUT_DIR || path.join(__dirname, 'evidence', 'onboarding-entry-fix')

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  const browser = await chromium.launch({ headless: true })
  const desktop = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const mobile = await browser.newContext({ ...devices['iPhone 13'] })

  const desktopPage = await desktop.newPage()
  await desktopPage.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' })
  await desktopPage.waitForSelector('.landing-hero', { timeout: 10000 })
  await desktopPage.waitForTimeout(800)
  await desktopPage.screenshot({
    path: path.join(OUT_DIR, '01-landing-desktop.png'),
    fullPage: true,
  })

  const startDesktop = await desktop.newPage()
  await startDesktop.goto(`${BASE_URL}/start`, { waitUntil: 'networkidle' })
  await startDesktop.waitForSelector('.start-page', { timeout: 10000 })
  await startDesktop.waitForTimeout(800)
  await startDesktop.screenshot({
    path: path.join(OUT_DIR, '02-start-desktop.png'),
    fullPage: true,
  })

  const startMobilePage = await mobile.newPage()
  await startMobilePage.goto(`${BASE_URL}/start`, { waitUntil: 'networkidle' })
  await startMobilePage.waitForTimeout(800)
  await startMobilePage.screenshot({
    path: path.join(OUT_DIR, '03-start-mobile.png'),
    fullPage: false,
  })

  const appMobilePage = await mobile.newPage()
  await appMobilePage.goto(`${BASE_URL}/app`, { waitUntil: 'networkidle' })
  await appMobilePage.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
  await appMobilePage.reload({ waitUntil: 'networkidle' })
  await appMobilePage.waitForTimeout(800)

  const titleVisible = await appMobilePage
    .getByRole('heading', { name: 'Start using PawStreak today' })
    .isVisible()
  const ctaVisible = await appMobilePage
    .getByRole('button', { name: 'Log in or sign up' })
    .isVisible()
  const hillsVisible = await appMobilePage.locator('.welcome-hero-svg').count()
  console.log(`Entry title visible: ${titleVisible ? 'PASS' : 'FAIL'}`)
  console.log(`Entry CTA visible: ${ctaVisible ? 'PASS' : 'FAIL'}`)
  console.log(`Green hills removed: ${hillsVisible === 0 ? 'PASS' : 'FAIL'}`)

  await appMobilePage.screenshot({
    path: path.join(OUT_DIR, '04-app-entry-mobile.png'),
    fullPage: false,
  })

  await appMobilePage.getByRole('button', { name: 'Log in or sign up' }).click()
  await appMobilePage.waitForTimeout(600)
  const onAuthStep = await appMobilePage
    .getByRole('heading', { name: /Create your account|Welcome back/ })
    .isVisible()
  console.log(`CTA enters auth step: ${onAuthStep ? 'PASS' : 'FAIL'}`)

  await appMobilePage.screenshot({
    path: path.join(OUT_DIR, '05-app-after-cta-mobile.png'),
    fullPage: false,
  })

  await browser.close()
  console.log(`Saved screenshots to ${OUT_DIR}`)

  if (!titleVisible || !ctaVisible || hillsVisible !== 0 || !onAuthStep) process.exit(1)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
