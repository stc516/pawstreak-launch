import { chromium, devices } from 'playwright'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE_URL = process.env.QA_BASE_URL || 'http://127.0.0.1:5173'
const OUT_DIR = process.env.QA_OUT_DIR || path.join(__dirname, 'evidence', 'founder-feedback')

const SCREENS = [
  {
    id: '01-home',
    setup: async (page) => {
      await page.goto(`${BASE_URL}/demo/app`, { waitUntil: 'networkidle' })
      await page.evaluate(() => localStorage.clear())
      await page.reload({ waitUntil: 'networkidle' })
      await page.locator('.home-quick-primary-btn').first().waitFor({ state: 'visible' })
      await page.waitForTimeout(800)
    },
  },
  {
    id: '02-plan',
    setup: async (page) => {
      await page.getByRole('button', { name: 'Plan', exact: true }).click()
      await page.waitForTimeout(900)
    },
  },
  {
    id: '03-curated-plan',
    setup: async (page) => {
      await page.getByRole('button', { name: 'Build a curated plan' }).click()
      await page.waitForTimeout(600)
      await page.locator('.curated-option').first().click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.waitForTimeout(400)
      await page.locator('.curated-option').first().click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.waitForTimeout(400)
      await page.locator('.curated-option').first().click()
      await page.getByRole('button', { name: /Build .* plan/ }).click()
      await page.waitForTimeout(800)
    },
  },
  {
    id: '04-journey',
    setup: async (page) => {
      await page.goto(`${BASE_URL}/demo/app`, { waitUntil: 'networkidle' })
      await page.getByRole('button', { name: 'Journey', exact: true }).click()
      await page.waitForTimeout(700)
      await page.locator('.jmap').scrollIntoViewIfNeeded()
      await page.waitForTimeout(500)
    },
  },
  {
    id: '05-challenges-clean',
    setup: async (page) => {
      await page.goto(`${BASE_URL}/demo/app`, { waitUntil: 'networkidle' })
      await page.evaluate(() => {
        localStorage.clear()
        const raw = localStorage.getItem('pawstreak-app-state')
        void raw
      })
      await page.reload({ waitUntil: 'networkidle' })
      await page.getByRole('button', { name: 'Challenges', exact: true }).click()
      await page.waitForTimeout(900)
    },
  },
]

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    ...devices['iPhone 13'],
    serviceWorkers: 'block',
  })
  const page = await context.newPage()

  for (const screen of SCREENS) {
    await screen.setup(page)
    await page.screenshot({
      path: path.join(OUT_DIR, `${screen.id}.png`),
      fullPage: true,
    })
    console.log(`Captured ${screen.id}.png`)
  }

  await browser.close()
  console.log(`Screenshots saved to ${OUT_DIR}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
