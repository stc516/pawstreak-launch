import { chromium, devices } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE_URL = process.env.QA_BASE_URL || 'http://localhost:5173'
const OUT_DIR =
  process.env.QA_OUT_DIR || path.join(__dirname, 'evidence', 'personalization-pack-access')
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

async function pageHasGhostNames(page) {
  const body = (await page.locator('body').innerText()).toLowerCase()
  return body.includes('bailey + omi') || /\bbailey\b/.test(body) || /\bomi\b/.test(body)
}

async function completeTacoOnboarding(page) {
  await page.getByRole('button', { name: /Get started/i }).click()
  await page.getByPlaceholder('First name').fill('QA Tester')
  await page.getByPlaceholder('you@email.com').fill('qa@pawstreak.test')
  await page.getByPlaceholder('Min. 8 characters').fill('password123')
  await page.getByRole('button', { name: /Create account/i }).click()
  await page.getByPlaceholder('e.g. Luna').fill('Taco')
  await page.getByRole('button', { name: /^Next$/ }).click()
  await page.getByRole('button', { name: 'Beach Dog' }).click()
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
    recordVideo: { dir: path.join(OUT_DIR, 'video'), size: { width: 390, height: 844 } },
  })
  const page = await context.newPage()

  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' })
    await page.evaluate(() => localStorage.clear())
    await page.reload({ waitUntil: 'networkidle' })

    await completeTacoOnboarding(page)
    await screenshot(page, '01-home-taco')

    const homeIntro = (await page.locator('.home-intro-kicker').textContent())?.trim() || ''
    await record('home-taco', homeIntro.includes('Taco'), `Home shows Taco ("${homeIntro}")`)

    const homeGhostFree = !(await pageHasGhostNames(page))
    await record(
      'home-no-ghost-names',
      homeGhostFree,
      'Home has no Bailey/Omi ghost names after onboarding',
    )

    await page.getByRole('button', { name: 'Taco' }).click()
    await page.waitForTimeout(400)
    await screenshot(page, '02-profile-taco')
    await record(
      'profile-taco',
      await page.getByText('Taco').first().isVisible(),
      'Profile shows Taco',
    )

    const packAccessVisible = await page.getByText('Pack Access').isVisible()
    await record(
      'pack-access-section',
      packAccessVisible,
      'Pack Access section appears on Profile',
    )

    await page.getByRole('button', { name: 'Invite someone' }).click()
    await page.waitForTimeout(400)
    await screenshot(page, '03-pack-invite-overlay')
    await record(
      'pack-invite-open',
      await page.getByText('Invite someone to your pack').isVisible(),
      'Pack invite overlay opens',
    )

    await page.getByPlaceholder('e.g. Dog Mom').fill('Dog Mom')
    await page.getByRole('button', { name: 'Save invite locally' }).click()
    await page.waitForTimeout(500)
    await screenshot(page, '04-pack-member-added')

    const toastVisible = await page
      .getByText('Invite saved locally — real invites coming later.')
      .isVisible()
    await record('pack-invite-toast', toastVisible, 'Invite toast appears after submit')

    const memberCards = await page.locator('.pack-access-card').count()
    await record(
      'pack-member-added',
      memberCards >= 4,
      `Pack Access list includes invited member (${memberCards} cards)`,
    )

    await page.reload({ waitUntil: 'networkidle' })
    await page.waitForTimeout(600)
    const persistedMembers = await page.locator('.pack-access-card').count()
    await record(
      'pack-member-persists',
      persistedMembers >= 4,
      `Invited member persists after refresh (${persistedMembers} cards)`,
    )

    await page.getByRole('button', { name: 'Journey', exact: true }).click()
    await page.waitForTimeout(400)
    const journeyTitle = (await page.locator('.alogo').textContent())?.trim() || ''
    await record(
      'journey-taco',
      journeyTitle.includes("Taco's Journey"),
      `Journey title personalized ("${journeyTitle}")`,
    )

    await page.getByRole('button', { name: 'Plan', exact: true }).click()
    await page.waitForTimeout(400)
    const planCopy = await page.locator('.plan-title').textContent()
    await record(
      'plan-taco',
      (planCopy ?? '').includes('Taco'),
      `Plan copy uses Taco ("${planCopy?.trim()}")`,
    )

    await page.getByRole('button', { name: 'Home', exact: true }).click()
    await page.waitForTimeout(300)
    await page.getByRole('button', { name: '15 min' }).first().click()
    await page.waitForTimeout(400)
    await page.getByRole('button', { name: /Start adventure/i }).click()
    await page.waitForTimeout(500)
    await screenshot(page, '05-active-adventure-taco')
    const adventureText = await page.locator('.app-shell').innerText()
    await record(
      'active-adventure-taco',
      adventureText.includes('Taco') && !/Bailey|Omi/.test(adventureText),
      'Active Adventure uses Taco without ghost names',
    )

    const report = {
      commit: COMMIT,
      testedAt: new Date().toISOString(),
      overallPass: true,
      evidenceDir: OUT_DIR,
      results,
    }
    await writeFile(path.join(OUT_DIR, 'report.json'), JSON.stringify(report, null, 2))
    console.log('\n--- PERSONALIZATION + PACK ACCESS QA ---')
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
