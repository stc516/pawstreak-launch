import { chromium, devices } from 'playwright'
import { copyFile, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE_URL = process.env.QA_BASE_URL || 'http://localhost:5173'
const OUT_DIR =
  process.env.QA_OUT_DIR || path.join(__dirname, 'evidence', 'taco-personalization')
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

function hasGhostNames(text) {
  const lower = (text ?? '').toLowerCase()
  return (
    lower.includes('bailey + omi') ||
    /\bbailey\b/.test(lower) ||
    /\bomi\b/.test(lower)
  )
}

async function assertNoGhostNames(page, flow, label) {
  const text = await page.locator('body').innerText()
  const ghosts = hasGhostNames(text)
  await record(flow, !ghosts, `${label} has no Bailey/Omi ghost names`)
}

async function clickNav(page, label) {
  await page.getByRole('button', { name: label, exact: true }).click()
  await page.waitForTimeout(400)
}

async function completeOnboarding(page) {
  await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  await page.evaluate(() => localStorage.clear())
  await page.reload({ waitUntil: 'networkidle' })

  await page.getByRole('button', { name: /Get started/i }).click()

  await page.getByPlaceholder('First name').fill('QA Tester')
  await page.getByPlaceholder('you@email.com').fill('qa@pawstreak.test')
  await page.getByPlaceholder('Min. 8 characters').fill('password123')
  await page.getByRole('button', { name: /Create account/i }).click()

  await page.getByPlaceholder('e.g. Luna').fill('Taco')
  await page.locator('select.field-input').first().selectOption('Mixed / Other')
  await page.locator('select.field-input').nth(1).selectOption('1–3 years')

  const nextEnabled = await page.getByRole('button', { name: /^Next$/ }).isEnabled()
  await record('onboarding-next-enabled', nextEnabled, 'Next is enabled after Taco name is filled')

  await screenshot(page, '01-onboarding-taco')

  await page.getByRole('button', { name: /^Next$/ }).click()
  await page.getByRole('button', { name: 'Explorer' }).click()
  await page.getByRole('button', { name: 'Slow Sniffer' }).click()
  await page.getByRole('button', { name: /^Next$/ }).click()

  await page
    .getByPlaceholder('ZIP, city, or neighborhood — e.g. 92123 or San Diego')
    .fill('92123')
  await page.getByRole('button', { name: /Create our world/i }).click()
  await page.getByRole('button', { name: /Start your first adventure/i }).click()
  await page.waitForTimeout(600)
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  await mkdir(path.join(OUT_DIR, 'video'), { recursive: true })

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    ...iPhone,
    recordVideo: {
      dir: path.join(OUT_DIR, 'video'),
      size: { width: 390, height: 844 },
    },
  })
  const page = await context.newPage()

  try {
    await completeOnboarding(page)

    const homeIntro = (await page.locator('.home-intro-kicker').textContent())?.trim() || ''
    await record('home-taco-label', homeIntro.includes('Taco'), `Home intro uses Taco ("${homeIntro}")`)
    await assertNoGhostNames(page, 'home-no-ghosts', 'Home')
    await screenshot(page, '02-home-taco')

    await clickNav(page, 'Plan')
    const planCopy = (await page.locator('.plan-title').textContent())?.trim() || ''
    await record('plan-taco-label', planCopy.includes('Taco'), `Plan copy uses Taco ("${planCopy}")`)
    await assertNoGhostNames(page, 'plan-no-ghosts', 'Plan')
    await screenshot(page, '03-plan-taco')

    await page.getByRole('button', { name: /Curated for your dogs/i }).click()
    await page.waitForTimeout(400)
    await page.getByRole('button', { name: 'Burn energy' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.waitForTimeout(300)
    await page.getByRole('button', { name: '30 min daily' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.waitForTimeout(400)

    const curatedTitle = (await page.locator('.curated-step-title').textContent())?.trim() || ''
    await record(
      'curated-step3-taco',
      curatedTitle.includes('Taco'),
      `Curated step 3 title uses Taco ("${curatedTitle}")`,
    )

    const ctaLabel = (await page.locator('.curated-next-btn').textContent())?.trim() || ''
    await record(
      'curated-cta-taco',
      ctaLabel.includes('Taco') && !hasGhostNames(ctaLabel),
      `Curated CTA uses Taco ("${ctaLabel}")`,
    )
    await assertNoGhostNames(page, 'curated-no-ghosts', 'Curated Plan step 3')
    await screenshot(page, '04-curated-plan-taco')

    for (let i = 0; i < 3; i += 1) {
      const back = page.getByRole('button', { name: 'Back', exact: true })
      if (await back.isVisible().catch(() => false)) {
        await back.click()
        await page.waitForTimeout(300)
      }
    }

    await clickNav(page, 'Journey')
    const journeyTitle = (await page.locator('.alogo').textContent())?.trim() || ''
    await record(
      'journey-taco-title',
      journeyTitle.includes("Taco's Journey"),
      `Journey title personalized ("${journeyTitle}")`,
    )
    await assertNoGhostNames(page, 'journey-no-ghosts', 'Journey')
    await screenshot(page, '05-journey-taco')

    await clickNav(page, 'Milestones')
    const bondSub = (await page.locator('.msb-sub').textContent())?.trim() || ''
    await record(
      'milestones-taco-bond',
      bondSub.includes('Taco') && !hasGhostNames(bondSub),
      `Milestones bond subtitle uses Taco ("${bondSub}")`,
    )
    await assertNoGhostNames(page, 'milestones-no-ghosts', 'Milestones')
    await screenshot(page, '06-milestones-taco')

    await clickNav(page, 'Home')
    await page.getByRole('button', { name: 'Taco' }).click()
    await page.waitForTimeout(400)
    const profileHasTaco = await page.getByText('Taco').first().isVisible()
    await record('profile-taco', profileHasTaco, 'Profile shows Taco')
    await assertNoGhostNames(page, 'profile-no-ghosts', 'Profile')
    await screenshot(page, '07-profile-taco')

    await page.locator('.pack-access-section').scrollIntoViewIfNeeded()
    await page.waitForTimeout(300)
    await assertNoGhostNames(page, 'pack-access-no-ghosts', 'Pack Access')
    await screenshot(page, '08-pack-access-taco')

    const report = {
      commit: COMMIT,
      testedAt: new Date().toISOString(),
      overallPass: true,
      evidenceDir: OUT_DIR,
      videoPath: path.join(OUT_DIR, 'video', 'run.webm'),
      results,
    }
    await writeFile(path.join(OUT_DIR, 'report.json'), JSON.stringify(report, null, 2))
    console.log('\n--- TACO PERSONALIZATION QA ---')
    console.log(JSON.stringify(report, null, 2))
  } finally {
    const video = page.video()
    await page.close()
    await context.close()

    const videoPath = video ? await video.path() : null
    if (videoPath) {
      const runWebm = path.join(OUT_DIR, 'video', 'run.webm')
      await copyFile(videoPath, runWebm)
      console.log(`Video saved: ${runWebm}`)
    }

    await browser.close()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
