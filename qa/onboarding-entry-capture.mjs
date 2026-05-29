import { chromium, devices } from 'playwright'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE_URL = process.env.QA_BASE_URL || 'http://localhost:5173'
const OUT_DIR = process.env.QA_OUT_DIR || path.join(__dirname, 'evidence', 'onboarding-entry')

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  const browser = await chromium.launch({ headless: true })
  const mobile = await browser.newContext({ ...devices['iPhone 13'] })
  const page = await mobile.newPage()

  await page.goto(`${BASE_URL}/app`, { waitUntil: 'networkidle' })
  await page.evaluate(() => localStorage.removeItem('pawstreak:app'))
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(800)

  const titleVisible = await page.getByRole('heading', { name: 'Start using PawStreak today' }).isVisible()
  const ctaVisible = await page.getByRole('button', { name: 'Log in or sign up' }).isVisible()
  console.log(`Entry title visible: ${titleVisible ? 'PASS' : 'FAIL'}`)
  console.log(`Entry CTA visible: ${ctaVisible ? 'PASS' : 'FAIL'}`)

  await page.screenshot({
    path: path.join(OUT_DIR, '01-app-entry-mobile.png'),
    fullPage: false,
  })

  await page.getByRole('button', { name: 'Log in or sign up' }).click()
  await page.waitForTimeout(600)
  const onAuthStep = await page.getByRole('heading', { name: /Create your account|Welcome back/ }).isVisible()
  console.log(`CTA enters auth step: ${onAuthStep ? 'PASS' : 'FAIL'}`)

  await page.screenshot({
    path: path.join(OUT_DIR, '02-app-entry-after-cta.png'),
    fullPage: false,
  })

  await browser.close()
  console.log(`Saved screenshots to ${OUT_DIR}`)

  if (!titleVisible || !ctaVisible || !onAuthStep) process.exit(1)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
