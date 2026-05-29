import { chromium, devices } from 'playwright'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE_URL = process.env.QA_BASE_URL || 'http://127.0.0.1:5173'
const OUT_DIR = process.env.QA_OUT_DIR || path.join(__dirname, 'evidence', 'layout-fix')

const SCREENS = [
  { name: '01-landing', url: '/', waitMs: 800 },
  { name: '02-start', url: '/start', waitMs: 800 },
  {
    name: '03-onboarding-welcome',
    url: '/demo/onboarding',
    setup: async (page) => {
      await page.evaluate(() => localStorage.clear())
    },
    waitMs: 1500,
  },
  {
    name: '04-signup',
    url: '/demo/onboarding',
    setup: async (page) => {
      await page.evaluate(() => localStorage.clear())
      await page.reload({ waitUntil: 'networkidle' })
      await page.waitForTimeout(1200)
      await page.getByRole('button', { name: 'Create Your Free Account' }).click()
      await page.waitForTimeout(400)
    },
    waitMs: 400,
  },
  {
    name: '05-login',
    url: '/app',
    setup: async (page) => {
      await page.evaluate(() => localStorage.clear())
      await page.reload({ waitUntil: 'networkidle' })
      await page.waitForTimeout(1200)
      await page.getByRole('button', { name: 'Already have an account? Sign in' }).click()
      await page.waitForTimeout(400)
    },
    waitMs: 400,
  },
  {
    name: '06-home',
    url: '/demo/app',
    setup: async (page) => {
      await page.evaluate(() => localStorage.clear())
    },
    waitMs: 1500,
  },
  { name: '07-plan', url: '/demo/app', tab: 'Plan', waitMs: 1500 },
  { name: '08-journey', url: '/demo/app', tab: 'Journey', waitMs: 1500 },
  {
    name: '09-profile',
    url: '/demo/app',
    setup: async (page) => {
      await page.evaluate(() => localStorage.clear())
      await page.reload({ waitUntil: 'networkidle' })
      await page.waitForTimeout(1500)
      await page.locator('.home-dog-pill').click()
      await page.waitForTimeout(500)
    },
    waitMs: 400,
  },
]

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ ...devices['iPhone 13'] })
  const page = await context.newPage()

  for (const screen of SCREENS) {
    if (screen.setup) {
      await page.goto(`${BASE_URL}${screen.url}`, { waitUntil: 'networkidle' })
      await screen.setup(page)
    } else {
      await page.goto(`${BASE_URL}${screen.url}`, { waitUntil: 'networkidle' })
    }

    if (screen.tab) {
      await page.getByRole('button', { name: screen.tab, exact: true }).click()
      await page.waitForTimeout(500)
    }

    await page.waitForTimeout(screen.waitMs ?? 800)

    const navVisible = await page.locator('.bnav').isVisible().catch(() => false)
    console.log(`${screen.name}: nav=${navVisible} url=${screen.url}`)

    await page.screenshot({
      path: path.join(OUT_DIR, `${screen.name}.png`),
      fullPage: false,
    })
  }

  await browser.close()
  console.log(`Saved to ${OUT_DIR}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
