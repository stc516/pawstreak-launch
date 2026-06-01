/**
 * Final review: screenshots + verification before commit.
 *
 *   npm run build && npm run preview -- --host 127.0.0.1 --port 4183
 *   QA_BASE_URL=http://127.0.0.1:4183 node qa/final-review-pre-commit.mjs
 */
import { chromium, devices } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'
import {
  assertShellLayout,
  collectShellLayoutMetrics,
} from './lib/shellLayoutGuard.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE_URL = process.env.QA_BASE_URL || 'http://127.0.0.1:4183'
const OUT_DIR =
  process.env.QA_OUT_DIR || path.join(__dirname, 'evidence', 'final-review-pre-commit')

const iPhone = devices['iPhone 13']
const NAV_TABS = ['Home', 'Plan', 'Journey', 'Challenges', 'Achievements', 'Community']

function resolveCommit() {
  try {
    return execSync('git rev-parse HEAD', { cwd: path.join(__dirname, '..'), encoding: 'utf8' }).trim()
  } catch {
    return process.env.QA_COMMIT || 'unknown'
  }
}

async function shot(page, name) {
  const file = path.join(OUT_DIR, `${name}.png`)
  await page.screenshot({ path: file, fullPage: false })
  return file
}

async function bodyText(page) {
  return page.locator('body').innerText()
}

async function openDemoApp(page) {
  await page.goto(`${BASE_URL}/demo/app`, { waitUntil: 'networkidle', timeout: 60000 })
  await page.evaluate(() => localStorage.clear())
  await page.reload({ waitUntil: 'networkidle', timeout: 60000 })
  await page.locator('.home-dog-pill').first().waitFor({ state: 'visible', timeout: 15000 })
  await page.waitForTimeout(600)
}

async function goTab(page, label) {
  await page.getByRole('button', { name: label, exact: true }).click()
  await page.waitForTimeout(700)
}

async function clickBuildMyMonth(page) {
  await page.locator('section[aria-label="Build My Month"] button').click()
  await page.waitForTimeout(700)
}

async function clickTrainingProgram(page) {
  await page.locator('section[aria-label="Training Program"] button').click()
  await page.waitForTimeout(700)
}

async function captureDemoScreens(page, shots) {
  await openDemoApp(page)

  shots.push({ id: '01-home', file: await shot(page, '01-home') })

  await clickBuildMyMonth(page)
  shots.push({ id: '02-build-month-step-1-vibe', file: await shot(page, '02-build-month-step-1-vibe') })

  await page.getByRole('button', { name: /Dog Parks/i }).click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.waitForTimeout(500)
  shots.push({ id: '03-build-month-step-2-frequency', file: await shot(page, '03-build-month-step-2-frequency') })

  await page.getByRole('button', { name: /1 adventure per week/i }).click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.waitForTimeout(500)
  shots.push({ id: '04-build-month-step-3-days', file: await shot(page, '04-build-month-step-3-days') })

  await page.getByRole('button', { name: 'Weekends', exact: true }).click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.waitForTimeout(700)
  shots.push({ id: '05-build-month-step-4-result', file: await shot(page, '05-build-month-step-4-result') })

  await page.getByRole('button', { name: 'Save plan', exact: true }).click()
  await page.waitForTimeout(900)
  await page.locator('.home-active-plan').scrollIntoViewIfNeeded()
  await page.waitForTimeout(400)
  shots.push({ id: '06-home-active-monthly-plan', file: await shot(page, '06-home-active-monthly-plan') })

  await goTab(page, 'Plan')
  shots.push({ id: '07-plan', file: await shot(page, '07-plan') })

  await goTab(page, 'Journey')
  shots.push({ id: '08-journey', file: await shot(page, '08-journey') })

  await goTab(page, 'Challenges')
  shots.push({ id: '09-challenges', file: await shot(page, '09-challenges') })

  await goTab(page, 'Achievements')
  shots.push({ id: '10-achievements', file: await shot(page, '10-achievements') })

  const earnedCard = page.locator('.st-enamel-grid button, .st-enamel-grid > *').first()
  if ((await earnedCard.count()) > 0) {
    await earnedCard.click()
    await page.waitForTimeout(900)
    shots.push({ id: '11-achievement-detail', file: await shot(page, '11-achievement-detail') })
    await page.getByRole('button', { name: 'Back', exact: true }).click()
    await page.waitForTimeout(600)
  } else {
    const lockedRow = page.locator('.achievements-locked-row').first()
    await lockedRow.click()
    await page.waitForTimeout(900)
    shots.push({ id: '11-achievement-detail', file: await shot(page, '11-achievement-detail') })
    await page.getByRole('button', { name: 'Back', exact: true }).click()
    await page.waitForTimeout(600)
  }

  await goTab(page, 'Community')
  shots.push({ id: '12-community', file: await shot(page, '12-community') })

  await goTab(page, 'Home')
  await page.locator('.home-dog-pill').first().click()
  await page.waitForTimeout(900)
  shots.push({ id: '13-profile', file: await shot(page, '13-profile') })

  await page.getByRole('button', { name: 'Open settings', exact: true }).click()
  await page.waitForTimeout(900)
  shots.push({ id: '14-settings', file: await shot(page, '14-settings') })
}

async function countEarnedAchievements(page) {
  return page.evaluate(() => {
    const sections = [...document.querySelectorAll('.achievements-section')]
    const earnedSection = sections.find((section) => {
      const heading = section.querySelector('.st-headline-md, h2')
      return heading?.textContent?.trim() === 'Earned'
    })
    if (!earnedSection) return 0
    return earnedSection.querySelectorAll('.st-enamel-grid > *').length
  })
}

async function runVerifications(page, checks) {
  await openDemoApp(page)

  await goTab(page, 'Achievements')
  const demoEarnedCount = await countEarnedAchievements(page)
  checks.push({
    id: 'demo-few-earned-achievements',
    pass: demoEarnedCount > 0 && demoEarnedCount <= 5,
    detail: `Demo shows ${demoEarnedCount} earned badge(s) (allowlist caps at 5)`,
  })

  if (demoEarnedCount > 0) {
    await page.locator('.st-enamel-grid > *').first().click()
    await page.waitForTimeout(800)
    const detailText = await bodyText(page)
    const detailLower = detailText.toLowerCase()
    checks.push({
      id: 'achievement-detail-required-fields',
      pass:
        detailLower.includes('how to earn') &&
        detailLower.includes('progress') &&
        detailLower.includes('current') &&
        detailLower.includes('target'),
      detail: 'Achievement detail includes How to earn, Progress, Current, and Target',
    })
    await page.getByRole('button', { name: 'Back', exact: true }).click()
    await page.waitForTimeout(500)
  }

  await goTab(page, 'Home')
  const quickWalkClicks = []
  await page.locator('.home-quick-walk-btn').click()
  await page.waitForTimeout(800)
  const onActiveWalk = await page.evaluate(() => {
    return (
      document.querySelector('.clock-bg--active') !== null ||
      document.body.innerText.includes('Active adventure')
    )
  })
  const onReadyScreen = await page.evaluate(() =>
    document.body.innerText.includes('Adventure ready'),
  )
  checks.push({
    id: 'quick-walk-one-tap-active',
    pass: onActiveWalk && !onReadyScreen,
    detail: onActiveWalk
      ? 'Quick Walk opens active adventure (no Adventure ready interstitial)'
      : `Expected active walk screen; ready=${onReadyScreen}`,
  })
  quickWalkClicks.push('quick-walk')

  if (onActiveWalk) {
    await page.getByRole('button', { name: 'Cancel adventure', exact: true }).first().click()
    await page.waitForTimeout(700)
  }

  await clickBuildMyMonth(page)
  await page.getByRole('button', { name: /Dog Parks/i }).click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.getByRole('button', { name: /1 adventure per week/i }).click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.getByRole('button', { name: 'Weekends', exact: true }).click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.waitForTimeout(500)

  const week1Place = await page.evaluate(() => {
    const row = document.querySelector('.build-month-week-row')
    return row?.querySelector('.build-month-week-place')?.textContent?.trim() ?? null
  })

  await page.getByRole('button', { name: 'Save plan', exact: true }).click()
  await page.waitForTimeout(800)

  const weekBefore = await page.evaluate(() => {
    const title = document.querySelector('.home-active-plan-title')?.textContent ?? ''
    const progress = document.querySelector('.home-active-plan-sub')?.textContent ?? ''
    return { title, progress }
  })

  const goBtn = page.locator('.home-active-plan .st-btn--forest').first()
  await goBtn.click()
  await page.waitForTimeout(700)

  const needsStart = await page.evaluate(() =>
    document.body.innerText.includes('Start adventure'),
  )
  if (needsStart) {
    await page.getByRole('button', { name: 'Start adventure', exact: true }).click()
    await page.waitForTimeout(500)
  }

  await page.getByRole('button', { name: 'Finish adventure', exact: true }).click()
  await page.waitForTimeout(1200)

  await goTab(page, 'Home')
  await page.waitForTimeout(600)

  const weekAfter = await page.evaluate(() => {
    const title = document.querySelector('.home-active-plan-title')?.textContent ?? ''
    const progress = document.querySelector('.home-active-plan-sub')?.textContent ?? ''
    return { title, progress }
  })

  checks.push({
    id: 'monthly-plan-advances-after-adventure',
    pass:
      weekBefore.progress !== weekAfter.progress ||
      weekBefore.title !== weekAfter.title,
    detail: `Before: "${weekBefore.title}" / ${weekBefore.progress} → After: "${weekAfter.title}" / ${weekAfter.progress} (week1=${week1Place})`,
  })

  await goTab(page, 'Community')
  const communityText = await bodyText(page)
  checks.push({
    id: 'community-no-fake-content',
    pass:
      communityText.includes('Coming soon') &&
      !/\d[\d,]* packs joined/.test(communityText) &&
      !communityText.includes('Bailey & Omi') &&
      !communityText.includes('Shared with the pack'),
    detail: 'Community is Coming Soon only — no fake users/posts/counts',
  })

  await goTab(page, 'Challenges')
  const challengesText = await bodyText(page)
  checks.push({
    id: 'training-not-in-challenges',
    pass:
      !challengesText.includes('Training Skills') &&
      !challengesText.includes('Training Program'),
    detail: 'Challenges tab has no Training section',
  })

  await goTab(page, 'Home')
  await page.locator('.home-dog-pill').first().click()
  await page.waitForTimeout(700)
  const profileText = await bodyText(page)
  checks.push({
    id: 'achievements-not-in-profile',
    pass: !profileText.includes('Earned Tags'),
    detail: 'Profile has no Earned Tags / achievements section',
  })

  const navLabels = await page.evaluate(() =>
    [...document.querySelectorAll('.bnav .ni span')].map((el) => el.textContent?.trim()),
  )
  checks.push({
    id: 'profile-not-in-bottom-nav',
    pass: !navLabels.includes('Profile'),
    detail: `Bottom nav tabs: ${navLabels.join(', ')}`,
  })

  const gearOpensProfile = await page.evaluate(() => {
    const gear = document.querySelector('[aria-label="Open settings"]')
    return gear !== null
  })
  checks.push({
    id: 'profile-via-gear-or-dog-pill',
    pass: gearOpensProfile && profileText.includes('Training'),
    detail: 'Profile reachable from dog pill; settings gear present',
  })

  await page.getByRole('button', { name: 'Open settings', exact: true }).click()
  await page.waitForTimeout(600)
  const settingsVisible = await page.evaluate(() =>
    document.body.innerText.includes('Settings') ||
      document.body.innerText.includes('Location') ||
      document.querySelector('.settings-screen') !== null,
  )
  checks.push({
    id: 'settings-from-gear',
    pass: settingsVisible,
    detail: 'Settings opens from profile gear',
  })

  for (const tab of NAV_TABS) {
    if (tab !== 'Home') {
      await goTab(page, tab)
    } else {
      await page.getByRole('button', { name: 'Home', exact: true }).click()
      await page.waitForTimeout(500)
    }
    const metrics = await page.evaluate(collectShellLayoutMetrics)
    const result = assertShellLayout(metrics, { requireNav: true })
    checks.push({
      id: `six-tab-nav-${tab.toLowerCase()}`,
      pass: result.ok && navLabels.length === 6,
      detail: result.ok
        ? `${tab}: shell ok, nav pinned (centerY=${metrics.layout.navCenterY}, gapBelow=${metrics.layout.gapBelowNav})`
        : `${tab}: ${result.code} — ${result.detail}`,
    })
  }

  await page.goto(`${BASE_URL}/app`, { waitUntil: 'networkidle', timeout: 60000 })
  await page.evaluate(() => localStorage.clear())
  await page.goto(`${BASE_URL}/demo/app`, { waitUntil: 'networkidle', timeout: 60000 })
  await page.evaluate(() => {
    const key = 'pawstreak:demo'
    const raw = localStorage.getItem(key)
    if (!raw) return
    const state = JSON.parse(raw)
    state.journeyEntries = []
    state.adventureCount = 0
    state.placeCount = 0
    state.streak = 0
    state.joinedChallenges = []
    state.trainingLessonCompletions = []
    state.monthlyPlanResult = null
    state.activeTrainingSchedule = null
    state.buildMyMonthFlowStep = 0
    state.trainingProgramFlowStep = 0
    localStorage.setItem(key, JSON.stringify(state))
  })
  await page.reload({ waitUntil: 'networkidle', timeout: 60000 })
  await page.waitForTimeout(1000)
  await goTab(page, 'Achievements')
  const freshEarnedCount = await countEarnedAchievements(page)
  const freshText = await bodyText(page)
  checks.push({
    id: 'app-user-zero-earned',
    pass:
      freshEarnedCount === 0 &&
      freshText.includes('Your first achievements unlock'),
    detail: `/app requires auth locally; empty-journey proxy on demo/app shows ${freshEarnedCount} earned with honest empty state`,
  })
}

function buildHtml(report) {
  const checkRows = report.checks
    .map(
      (c) =>
        `<tr class="${c.pass ? 'pass' : 'fail'}"><td>${c.id}</td><td>${c.pass ? 'PASS' : 'FAIL'}</td><td>${c.detail}</td></tr>`,
    )
    .join('')
  const shotRows = report.screenshots
    .map((s) => `<tr><td>${s.id}</td><td><a href="${path.basename(s.file)}">${path.basename(s.file)}</a></td></tr>`)
    .join('')

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Final Review Pre-Commit</title>
<style>body{font-family:system-ui,sans-serif;padding:16px;max-width:960px;margin:0 auto}
table{border-collapse:collapse;width:100%;margin:12px 0}th,td{border:1px solid #ddd;padding:8px;text-align:left}
.pass{color:#0a7a32}.fail{color:#b42318}
img{max-width:100%;border:1px solid #eee;border-radius:8px;margin:8px 0}
.grid{display:grid;grid-template-columns:1fr;gap:16px}
@media(min-width:700px){.grid{grid-template-columns:1fr 1fr}}</style></head>
<body>
<h1>Final Review Pre-Commit</h1>
<p><strong>${report.pass ? 'PASS' : 'FAIL'}</strong> · ${report.baseUrl} · ${report.commit.slice(0, 7)}</p>
<h2>Verification</h2>
<table><tr><th>Check</th><th>Result</th><th>Detail</th></tr>${checkRows}</table>
<h2>Screenshots</h2>
<table><tr><th>Screen</th><th>File</th></tr>${shotRows}</table>
<div class="grid">
${report.screenshots.map((s) => `<figure><figcaption>${s.id}</figcaption><img src="${path.basename(s.file)}" alt="${s.id}"></figure>`).join('')}
</div>
</body></html>`
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    ...iPhone,
    isMobile: true,
    hasTouch: true,
    serviceWorkers: 'block',
  })
  const page = await context.newPage()

  const screenshots = []
  const checks = []

  try {
    await captureDemoScreens(page, screenshots)
    await runVerifications(page, checks)
  } finally {
    await browser.close()
  }

  const report = {
    commit: resolveCommit(),
    baseUrl: BASE_URL,
    device: 'iPhone 13',
    capturedAt: new Date().toISOString(),
    pass: checks.every((c) => c.pass),
    checks,
    screenshots,
  }

  await writeFile(path.join(OUT_DIR, 'report.json'), JSON.stringify(report, null, 2))
  await writeFile(path.join(OUT_DIR, 'report.html'), buildHtml(report))

  for (const check of checks) {
    console.log(`[${check.pass ? 'PASS' : 'FAIL'}] ${check.id} — ${check.detail}`)
  }
  console.log(`\nScreenshots: ${OUT_DIR}`)
  console.log(`Report: ${path.join(OUT_DIR, 'report.html')}`)
  if (!report.pass) process.exit(1)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
