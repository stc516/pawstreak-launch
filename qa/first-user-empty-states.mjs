import { chromium, devices } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE_URL = process.env.QA_BASE_URL || 'http://127.0.0.1:5173/demo/onboarding'
const OUT_DIR = path.join(__dirname, 'evidence', 'first-user-empty-states')
const iPhone = devices['iPhone 13']
const results = []

function commit() {
  try {
    return execSync('git rev-parse HEAD', {
      cwd: path.join(__dirname, '..'),
      encoding: 'utf8',
    }).trim()
  } catch {
    return 'unknown'
  }
}

async function screenshot(page, name) {
  const file = path.join(OUT_DIR, `${name}.png`)
  await page.screenshot({ path: file, fullPage: true })
  return file
}

async function record(id, pass, message) {
  results.push({ id, pass, message })
  console.log(`[${pass ? 'PASS' : 'FAIL'}] ${id}: ${message}`)
  if (!pass) throw new Error(`${id}: ${message}`)
}

async function completeOnboarding(page) {
  await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  await page.evaluate(() => localStorage.clear())
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)

  const createAccountEntry = page.getByRole('button', { name: /Create Your Free Account/i })
  if (await createAccountEntry.isVisible().catch(() => false)) {
    await createAccountEntry.click()
  } else {
    await page.getByRole('button', { name: /Get started/i }).click()
  }
  await page.getByPlaceholder('First name').fill('QA Tester')
  await page.getByPlaceholder('you@email.com').fill(`qa-empty-${Date.now()}@example.com`)
  await page.getByPlaceholder('Min. 8 characters').fill('password123')
  await page.getByRole('button', { name: /Create account/i }).click()

  await page.getByPlaceholder('e.g. Luna').fill('Taco')
  await page.locator('select.field-input').first().selectOption('Mixed / Other')
  await page.locator('select.field-input').nth(1).selectOption('1-3 years').catch(async () => {
    await page.locator('select.field-input').nth(1).selectOption({ index: 1 })
  })
  await page.getByRole('button', { name: /^Next$/ }).click()

  await page.getByRole('button', { name: 'Explorer' }).click()
  await page.getByRole('button', { name: 'Slow Sniffer' }).click()
  await page.getByRole('button', { name: /^Next$/ }).click()

  await page
    .getByPlaceholder('ZIP, city, or neighborhood - e.g. 92123 or San Diego')
    .fill('92123')
    .catch(async () => {
      await page
        .getByPlaceholder('ZIP, city, or neighborhood — e.g. 92123 or San Diego')
        .fill('92123')
    })
  await page.getByRole('button', { name: /Create our world/i }).click()
  await screenshot(page, '00-onboarding-done')
  await page.getByRole('button', { name: /See today's pick|Start your first adventure/i }).click()
  await page.waitForSelector('.home-screen', { timeout: 10_000 })
  await page.waitForTimeout(500)
}

async function clickNav(page, label) {
  await page.getByRole('button', { name: label, exact: true }).click()
  await page.waitForTimeout(500)
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ ...iPhone, locale: 'en-US' })

  try {
    await completeOnboarding(page)

    await screenshot(page, '01-new-user-home')
    await record(
      'home-first-pick',
      await page.getByText(/Today's Pick for Taco/i).isVisible(),
      'new user lands on a personalized home with a first pick',
    )

    await clickNav(page, 'Journey')
    await screenshot(page, '02-new-user-journey')
    await record(
      'journey-first-run-card',
      await page.getByText('Start with one real outing').isVisible(),
      'journey has a guided first-run card',
    )

    await clickNav(page, 'Challenges')
    await screenshot(page, '03-new-user-challenges')
    await record(
      'challenge-first-starter',
      await page.getByText('Good first challenge').isVisible(),
      'challenges offers a starter challenge instead of a dead empty state',
    )

    await clickNav(page, 'Community')
    await screenshot(page, '04-new-user-community')
    await record(
      'community-beta-steps',
      await page.getByText('Save real memories').isVisible(),
      'community explains the beta path with real-user steps',
    )

    const report = {
      commit: commit(),
      baseUrl: BASE_URL,
      generatedAt: new Date().toISOString(),
      results,
      screenshots: results.map((result, index) => ({
        id: result.id,
        file: `${String(index + 1).padStart(2, '0')}-see-screenshots-above`,
      })),
    }
    await writeFile(path.join(OUT_DIR, 'report.json'), `${JSON.stringify(report, null, 2)}\n`)
  } finally {
    await browser.close()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
