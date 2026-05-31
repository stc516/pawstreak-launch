import { chromium, devices } from 'playwright'
import { mkdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE_URL = process.env.QA_BASE_URL || 'http://127.0.0.1:4177'
const OUT_DIR = process.env.QA_OUT_DIR || path.join(__dirname, 'evidence', 'stitch-parity', 'after')

const SCREENS = [
  {
    id: '01-home',
    setup: async (page) => {
      await page.goto(`${BASE_URL}/demo/app`, { waitUntil: 'networkidle' })
      await page.evaluate(() => localStorage.clear())
      await page.reload({ waitUntil: 'networkidle' })
      await page.locator('.home-dog-pill').first().waitFor({ state: 'visible' })
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
    id: '03-journey',
    setup: async (page) => {
      await page.getByRole('button', { name: 'Journey', exact: true }).click()
      await page.locator('.journey-story-track').first().waitFor({ state: 'visible' })
      await page.waitForTimeout(900)
    },
  },
  {
    id: '04-challenges',
    setup: async (page) => {
      await page.getByRole('button', { name: 'Challenges', exact: true }).click()
      await page.waitForTimeout(900)
    },
  },
  {
    id: '05-profile',
    setup: async (page) => {
      await page.getByRole('button', { name: 'Home', exact: true }).click()
      await page.waitForTimeout(500)
      await page.locator('.home-dog-pill').first().click()
      await page.waitForTimeout(800)
    },
  },
  {
    id: '06-settings',
    setup: async (page) => {
      await page.locator('.profile-settings-btn').click()
      await page.waitForTimeout(800)
    },
  },
]

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    ...devices['iPhone 13'],
    serviceWorkers: process.env.QA_BLOCK_SERVICE_WORKERS === '1' ? 'block' : undefined,
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
