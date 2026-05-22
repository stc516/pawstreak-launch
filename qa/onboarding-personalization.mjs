import { chromium, devices } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE_URL = process.env.QA_BASE_URL || 'http://localhost:5173'
const OUT_DIR =
  process.env.QA_OUT_DIR || path.join(__dirname, 'evidence', 'onboarding-personalization')
const COMMIT = process.env.QA_COMMIT || 'unknown'

const iPhone = devices['iPhone 13']
const results = []

async function record(flow, pass, message) {
  results.push({ flow, pass, message })
  console.log(`[${pass ? 'PASS' : 'FAIL'}] ${flow}: ${message}`)
  if (!pass) throw new Error(`${flow}: ${message}`)
}

async function screenshot(page, name) {
  const file = path.join(OUT_DIR, `${name}.png`)
  await page.screenshot({ path: file, fullPage: true })
  return file
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  await mkdir(path.join(OUT_DIR, 'video'), { recursive: true })

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    ...iPhone,
    recordVideo: { dir: path.join(OUT_DIR, 'video'), size: { width: 390, height: 844 } },
  })
  const page = await context.newPage()

  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' })
    await page.evaluate(() => localStorage.clear())
    await page.reload({ waitUntil: 'networkidle' })

    await page.getByRole('button', { name: /Get started/i }).click()
    await page.getByPlaceholder('First name').fill('QA Tester')
    await page.getByPlaceholder('you@email.com').fill('qa@pawstreak.test')
    await page.getByPlaceholder('Min. 8 characters').fill('password123')
    await page.getByRole('button', { name: /Create account/i }).click()

    const breedOptions = await page.locator('select.field-input option').allTextContents()
    const hasGolden = breedOptions.some((text) => text.includes('Golden Retriever'))
    const hasPitBull = breedOptions.some((text) => text.includes('Pit Bull / Staffy'))
    await record(
      'breed-dropdown',
      hasGolden && hasPitBull,
      `Expanded breed list includes Golden Retriever and Pit Bull / Staffy`,
    )

    await page.getByPlaceholder('e.g. Luna').fill('Taco')
    await page.locator('select.field-input').first().selectOption('Mixed / Other')
    await page.locator('select.field-input').nth(1).selectOption('1–3 years')
    await page.getByRole('button', { name: /^Next$/ }).click()
    await screenshot(page, '01-dog-taco')

    await page.getByRole('button', { name: 'Beach Dog' }).click()
    await page.getByRole('button', { name: /^Next$/ }).click()

    await page
      .getByPlaceholder('ZIP, city, or neighborhood — e.g. 92123 or San Diego')
      .fill('92123')
    await page.getByRole('button', { name: /Create our world/i }).click()
    await page.getByRole('button', { name: /Start your first adventure/i }).click()
    await page.waitForTimeout(600)
    await screenshot(page, '02-home-taco')

    const homeIntro = (await page.locator('.home-intro-kicker').textContent())?.trim() || ''
    const homeHasTaco = homeIntro.includes('Taco')
    await record('home-taco', homeHasTaco, `Home intro shows Taco ("${homeIntro}")`)

    const homeHasBaileyOmi = await page.getByText('Bailey + Omi').count()
    await record(
      'home-no-bailey-omi',
      homeHasBaileyOmi === 0,
      'Home does not show Bailey + Omi for single-dog Taco profile',
    )

    await page.getByRole('button', { name: 'Taco' }).click()
    await page.waitForTimeout(400)
    await screenshot(page, '03-profile-taco')
    const profileHasTaco = await page.getByText('Taco').first().isVisible()
    await record('profile-taco', profileHasTaco, 'Profile shows Taco')

    await page.getByRole('button', { name: 'Home', exact: true }).click()
    await page.waitForTimeout(300)
    await page.getByRole('button', { name: 'Journey', exact: true }).click()
    await page.waitForTimeout(400)
    const journeyTitle = (await page.locator('.alogo').textContent())?.trim() || ''
    await record(
      'journey-title',
      journeyTitle.includes("Taco's Journey"),
      `Journey title is personalized ("${journeyTitle}")`,
    )

    await page.getByRole('button', { name: 'Plan', exact: true }).click()
    await page.waitForTimeout(400)
    const planCopy = await page.locator('.plan-title').textContent()
    await record(
      'plan-copy',
      (planCopy ?? '').includes('Taco'),
      `Plan monthly copy uses Taco ("${planCopy?.trim()}")`,
    )

    await page.getByRole('button', { name: /Curated for your dogs/i }).click()
    await page.waitForTimeout(400)
    const curatedSubtitle = await page.locator('.curated-intro').textContent()
    await record(
      'curated-intro',
      Boolean(curatedSubtitle?.includes('Curated')),
      'Curated plan flow opens after onboarding personalization',
    )

    await page.getByRole('button', { name: 'Burn energy' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.waitForTimeout(300)
    await page.getByRole('button', { name: '30 min daily' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.waitForTimeout(300)
    const curatedStepTitle = (await page.locator('.curated-step-title').textContent())?.trim() || ''
    await record(
      'curated-taco',
      curatedStepTitle.includes('Taco'),
      `Curated plan step 3 uses Taco ("${curatedStepTitle}")`,
    )

    await page.evaluate(() => localStorage.clear())
    await page.reload({ waitUntil: 'networkidle' })
    await page.getByRole('button', { name: /Get started/i }).click()
    await page.getByPlaceholder('First name').fill('QA Tester')
    await page.getByPlaceholder('you@email.com').fill('qa@pawstreak.test')
    await page.getByPlaceholder('Min. 8 characters').fill('password123')
    await page.getByRole('button', { name: /Create account/i }).click()
    await page.getByPlaceholder('e.g. Luna').fill('Taco')
    await page.getByRole('button', { name: /^Next$/ }).click()
    await page.getByRole('button', { name: 'Explorer' }).click()
    await page.getByRole('button', { name: /^Next$/ }).click()
    await page
      .getByPlaceholder('ZIP, city, or neighborhood — e.g. 92123 or San Diego')
      .fill('Portland, OR')
    await page.getByRole('button', { name: /Create our world/i }).click()
    await page.getByRole('button', { name: /Start your first adventure/i }).click()
    await page.waitForTimeout(600)
    const fallbackVisible = await page.locator('.home-area-fallback').isVisible()
    await record(
      'unsupported-location-fallback',
      fallbackVisible,
      'Unsupported location shows friendly fallback on Home',
    )

    const report = {
      commit: COMMIT,
      testedAt: new Date().toISOString(),
      overallPass: true,
      evidenceDir: OUT_DIR,
      results,
    }
    await writeFile(path.join(OUT_DIR, 'report.json'), JSON.stringify(report, null, 2))
    console.log('\n--- ONBOARDING QA REPORT ---')
    console.log(JSON.stringify(report, null, 2))
  } finally {
    await page.close()
    await context.close()
    await browser.close()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
