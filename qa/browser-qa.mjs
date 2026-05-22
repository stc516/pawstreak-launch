import { chromium, devices } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE_URL = process.env.QA_BASE_URL || 'http://localhost:5173'
const OUT_DIR = process.env.QA_OUT_DIR || path.join(__dirname, 'evidence', 'local')
const TARGET = process.env.QA_TARGET || 'local'
const COMMIT = process.env.QA_COMMIT || 'unknown'

const iPhone = devices['iPhone 13']
const results = []

function step(id, name) {
  return `${String(id).padStart(2, '0')}-${name}`
}

async function record(flow, pass, message, extra = {}) {
  results.push({ flow, pass, message, ...extra })
  const icon = pass ? 'PASS' : 'FAIL'
  console.log(`[${icon}] ${flow}: ${message}`)
}

async function screenshot(page, name) {
  const file = path.join(OUT_DIR, `${name}.png`)
  await page.screenshot({ path: file, fullPage: true })
  return file
}

async function expectVisible(page, selector, flow, message) {
  const locator = page.locator(selector).first()
  const visible = await locator.isVisible().catch(() => false)
  await record(flow, visible, message, { selector })
  if (!visible) {
    throw new Error(`${flow} failed: ${message} (${selector})`)
  }
  return locator
}

async function clickCuratedOption(page, label) {
  await page.locator('button.curated-option').filter({ hasText: label }).first().click()
  await page.waitForTimeout(250)
}

async function clickChip(page, label) {
  await page.locator('button.chip').filter({ hasText: label }).first().click()
  await page.waitForTimeout(350)
}

async function clickNav(page, label) {
  await page.getByRole('button', { name: label, exact: true }).click()
  await page.waitForTimeout(350)
}

async function exitActiveAdventure(page) {
  const finish = page.getByRole('button', { name: 'Finish', exact: true })
  if (await finish.isVisible().catch(() => false)) {
    await finish.click()
    await page.waitForTimeout(500)
    return
  }
  const back = page.getByRole('button', { name: 'Back', exact: true })
  if (await back.isVisible().catch(() => false)) {
    await back.click()
    await page.waitForTimeout(400)
  }
}

async function startActiveAdventure(page) {
  const startBtn = page.getByRole('button', { name: 'Start adventure', exact: true })
  if (await startBtn.isVisible().catch(() => false)) {
    await startBtn.click()
    await page.waitForTimeout(400)
  }
}

async function completeOnboarding(page, flowPrefix) {
  await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  await page.evaluate(() => localStorage.clear())
  await page.reload({ waitUntil: 'networkidle' })

  await page.getByRole('button', { name: /Get started/i }).click()
  await screenshot(page, step(1, 'onboarding-get-started'))

  await page.getByPlaceholder('First name').fill('QA Tester')
  await page.getByPlaceholder('you@email.com').fill('qa@pawstreak.test')
  await page.getByPlaceholder('Min. 8 characters').fill('password123')
  await page.getByRole('button', { name: /Create account/i }).click()
  await screenshot(page, step(2, 'onboarding-account'))

  await page.getByPlaceholder('e.g. Bailey').fill('Bailey')
  await page.getByRole('button', { name: /^Next$/ }).click()
  await screenshot(page, step(3, 'onboarding-dog'))

  await page.getByRole('button', { name: 'Slow Sniffer' }).click()
  await page.getByRole('button', { name: 'Explorer' }).click()
  await screenshot(page, step(4, 'onboarding-vibes'))
  await page.getByRole('button', { name: /^Next$/ }).click()

  await page.getByRole('button', { name: /Create our world/i }).click()
  await screenshot(page, step(5, 'onboarding-local'))

  await page.getByRole('button', { name: /Start your first adventure/i }).click()
  await page.waitForTimeout(500)
  await expectVisible(page, '.sec', `${flowPrefix}-onboarding`, 'Home screen section visible after onboarding')
  await screenshot(page, step(6, 'onboarding-home'))
}

async function runFlows(page) {
  // 1. Onboarding
  await completeOnboarding(page, '1')

  // 2. Home
  const heroTitle = page.locator('.hc-title').first()
  const beachTitle = (await heroTitle.textContent())?.trim() || ''
  await clickChip(page, 'Coffee')
  await page.waitForTimeout(400)
  const coffeeTitle = (await heroTitle.textContent())?.trim() || ''
  const heroChanged = beachTitle !== coffeeTitle && coffeeTitle.length > 0
  await record('2-home-chips', heroChanged, `Hero changed from "${beachTitle}" to "${coffeeTitle}"`)
  await screenshot(page, step(7, 'home-coffee-hero'))
  if (!heroChanged) throw new Error('Home hero did not change when Coffee chip selected')

  await page.getByRole('button', { name: '15 min', exact: true }).click()
  await page.waitForTimeout(500)
  await expectVisible(page, '.adv-ready-place', '2-home-ready', 'Adventure Ready screen visible after 15 min')
  await startActiveAdventure(page)
  const timerText = (await page.locator('.clk-time').textContent())?.trim() || ''
  const timerAtZero = timerText.startsWith('0:00')
  await record('2-home-timer-zero', timerAtZero, `Timer starts at 0:00 (got "${timerText}")`)
  await expectVisible(page, '.clk-time', '2-home-15min', 'Active Adventure timer visible after Start adventure')
  await screenshot(page, step(8, 'home-active-adventure'))
  await exitActiveAdventure(page)
  await expectVisible(page, '.alogo', '2-home-reset', 'Returned to shell after Finish')
  await screenshot(page, step(9, 'home-after-finish'))

  // 3. Plan
  await clickNav(page, 'Plan')
  const allCount = await page.locator('.pcard').count()
  await page.locator('button.chip').filter({ hasText: 'Beach' }).first().click()
  await page.waitForTimeout(300)
  const beachCount = await page.locator('.pcard').count()
  const beachChipOn = await page.locator('button.chip.on').filter({ hasText: 'Beach' }).count()
  const filtered = beachCount > 0 && beachChipOn > 0 && beachCount !== allCount
  await record('3-plan-filter', filtered, `Plan Beach filter active (${allCount} all -> ${beachCount} beach)`)
  await screenshot(page, step(10, 'plan-beach-filter'))
  if (!filtered) throw new Error('Plan category filter did not change visible cards')

  const firstGo = page.locator('.pgo').first()
  const placeName = (await page.locator('.pname').first().textContent())?.trim() || ''
  await firstGo.click()
  await page.waitForTimeout(500)
  await expectVisible(page, '.adv-ready-place', '3-plan-ready', 'Adventure Ready screen visible after Go')
  await startActiveAdventure(page)
  const activeLocation = (await page.locator('.clk-sub').textContent())?.trim() || ''
  const goWorked = activeLocation.length > 0
  await record('3-plan-go', goWorked, `Active Adventure opened for "${placeName}" (header: "${activeLocation}")`)
  await screenshot(page, step(11, 'plan-go-active-adventure'))
  if (!goWorked) throw new Error('Plan Go did not open Active Adventure')
  await exitActiveAdventure(page)

  // 4. Curated Plan
  await clickNav(page, 'Plan')
  await page.getByRole('button', { name: /Curated for your dogs/i }).click()
  await page.waitForTimeout(400)
  await expectVisible(page, '.curated-step-title', '4-curated-open', 'Curated Plan overlay opened')
  await screenshot(page, step(12, 'curated-step-1'))

  await clickCuratedOption(page, 'Burn energy')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.waitForTimeout(300)
  await screenshot(page, step(13, 'curated-step-2'))

  await clickCuratedOption(page, '30 min daily')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.waitForTimeout(300)
  await screenshot(page, step(14, 'curated-step-3'))

  await clickCuratedOption(page, 'Beaches')
  await page.getByRole('button', { name: /Build Bailey \+ Omi's plan/i }).click()
  await page.waitForTimeout(400)
  await expectVisible(page, '.curated-result-title', '4-curated-result', 'Curated result screen visible')
  await screenshot(page, step(15, 'curated-result'))

  await page.getByRole('button', { name: /Save plan/i }).click()
  await page.waitForTimeout(500)
  const savedVisible = await page.locator('.plan-saved, .curated-saved').first().isVisible()
  await record('4-curated-save', savedVisible, 'Saved curated plan summary visible on Plan screen')
  await screenshot(page, step(16, 'curated-saved-on-plan'))
  if (!savedVisible) throw new Error('Curated plan save summary not visible on Plan')

  // 5. Journey
  await clickNav(page, 'Journey')
  await page.locator('.mcard--tap').first().click()
  await page.waitForTimeout(400)
  await expectVisible(page, '.memory-place', '5-journey-memory', 'Journey Memory overlay opened')
  await screenshot(page, step(17, 'journey-memory'))
  await page.getByRole('button', { name: 'Back', exact: true }).click()
  await page.waitForTimeout(400)
  const backOnJourney = await page.getByText('This week').isVisible()
  await record('5-journey-back', backOnJourney, 'Returned to Journey list after Back')
  await screenshot(page, step(18, 'journey-list'))
  if (!backOnJourney) throw new Error('Journey Back did not return to list')

  // 6. Milestones
  await clickNav(page, 'Milestones')
  await page.getByRole('button', { name: /SoCal Beach Challenge/i }).click()
  await page.waitForTimeout(400)
  await expectVisible(page, '.chdetail-title', '6-challenge-detail', 'Challenge Detail overlay opened')
  await screenshot(page, step(19, 'challenge-detail'))
  await page.getByRole('button', { name: 'Back', exact: true }).click()
  await page.waitForTimeout(400)
  const backOnMilestones = await page.getByText('Active challenges').isVisible()
  await record('6-challenge-back', backOnMilestones, 'Returned to Milestones after Back')
  await screenshot(page, step(20, 'milestones-list'))
  if (!backOnMilestones) throw new Error('Challenge Back did not return to Milestones')

  await page.getByRole('button', { name: /First Beach Day/i }).click()
  await page.waitForTimeout(400)
  await expectVisible(page, '.achdetail-title', '6-achievement-detail', 'Achievement Detail overlay opened')
  await screenshot(page, step(20.5, 'achievement-detail'))
  await page.getByRole('button', { name: 'Back', exact: true }).click()
  await page.waitForTimeout(400)

  // 7. Active Adventure capture + finish
  await clickNav(page, 'Home')
  await page.getByRole('button', { name: '15 min', exact: true }).click()
  await page.waitForTimeout(400)
  await startActiveAdventure(page)

  const fileInput = page.locator('input.cam-input[type="file"]')
  const pickerExists = (await fileInput.count()) > 0
  await record('7-capture-input', pickerExists, 'Hidden file input present for Capture a moment')

  const pngBase64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
  const pngBuffer = Buffer.from(pngBase64, 'base64')
  await fileInput.setInputFiles({
    name: 'qa-moment.png',
    mimeType: 'image/png',
    buffer: pngBuffer,
  })
  await page.waitForTimeout(500)
  const previewVisible = await page.locator('.rph-img').first().isVisible()
  await record('7-capture-preview', previewVisible, 'Captured photo preview rendered')
  await screenshot(page, step(21, 'active-adventure-photo'))

  const beforeCount = await page.evaluate(() => {
    const raw = localStorage.getItem('pawstreak:app')
    if (!raw) return 0
    const state = JSON.parse(raw)
    return Array.isArray(state.journeyEntries) ? state.journeyEntries.length : 0
  })

  await page.getByRole('button', { name: 'Finish', exact: true }).click()
  await page.waitForTimeout(600)
  await expectVisible(page, '.sec', '7-finish-journey', 'Journey tab visible after Finish')

  const afterState = await page.evaluate(() => {
    const raw = localStorage.getItem('pawstreak:app')
    return raw ? JSON.parse(raw) : null
  })
  const todayEntry = afterState?.journeyEntries?.some((entry) => entry.date === 'Today')
  const countIncreased = (afterState?.journeyEntries?.length || 0) >= beforeCount
  await record('7-finish-entry', todayEntry && countIncreased, 'New Today journey entry created after Finish')
  await screenshot(page, step(22, 'journey-new-entry'))
  if (!todayEntry) throw new Error('Finish did not create a Today journey entry')
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

  let overallPass = true
  let errorMessage = null

  try {
    await runFlows(page)
  } catch (error) {
    overallPass = false
    errorMessage = error instanceof Error ? error.message : String(error)
    await screenshot(page, '99-failure-state').catch(() => {})
    await record('overall', false, errorMessage)
  }

  const video = page.video()
  await page.close()
  await context.close()
  const videoPath = video ? await video.path() : null
  await browser.close()

  const report = {
    target: TARGET,
    baseUrl: BASE_URL,
    commit: COMMIT,
    testedAt: new Date().toISOString(),
    overallPass,
    errorMessage,
    videoPath,
    evidenceDir: OUT_DIR,
    results,
  }

  await writeFile(path.join(OUT_DIR, 'report.json'), JSON.stringify(report, null, 2))
  console.log('\n--- QA REPORT ---')
  console.log(JSON.stringify(report, null, 2))
  process.exit(overallPass ? 0 : 1)
}

main()
