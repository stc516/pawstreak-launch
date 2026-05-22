import { chromium, devices } from 'playwright'
import { copyFile, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DEMO_URL = process.env.QA_DEMO_URL || 'https://pawstreak-launch.vercel.app/demo'
const APP_URL = process.env.QA_APP_URL || 'https://pawstreak-launch.vercel.app'
const OUT_DIR =
  process.env.QA_OUT_DIR || path.join(__dirname, 'evidence', 'final-production-smoke')

const iPhone = devices['iPhone 13']
const results = []
let overallPass = true

async function resolveProductionCommit() {
  if (process.env.QA_COMMIT) return process.env.QA_COMMIT
  try {
    const res = await fetch(
      'https://api.github.com/repos/stc516/pawstreak-launch/commits/main',
      { headers: { Accept: 'application/vnd.github+json' } },
    )
    if (res.ok) {
      const data = await res.json()
      if (data.sha) return data.sha
    }
  } catch {
    // fall through
  }
  try {
    return execSync('git rev-parse HEAD', {
      cwd: path.join(__dirname, '..'),
      encoding: 'utf8',
    }).trim()
  } catch {
    return 'unknown'
  }
}

async function record(id, pass, message, screenshot = null) {
  results.push({ id, pass, message, screenshot })
  if (!pass) overallPass = false
  console.log(`[${pass ? 'PASS' : 'FAIL'}] ${id}: ${message}`)
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

async function clickNav(page, label) {
  await page.getByRole('button', { name: label, exact: true }).click()
  await page.waitForTimeout(450)
}

async function clickChip(page, label) {
  await page.locator('button.chip').filter({ hasText: label }).first().click()
  await page.waitForTimeout(450)
}

async function clickCuratedOption(page, label) {
  await page.locator('button.curated-option').filter({ hasText: label }).first().click()
  await page.waitForTimeout(300)
}

async function exitOverlayBack(page) {
  const back = page.locator('.overlay-back').first()
  if (await back.isVisible().catch(() => false)) {
    await back.click()
    await page.waitForTimeout(400)
  }
}

function buildHtmlReport(report) {
  const rows = report.results
    .map(
      (item) =>
        `<tr class="${item.pass ? 'pass' : 'fail'}"><td>${item.id}</td><td>${item.pass ? 'PASS' : 'FAIL'}</td><td>${item.message}</td><td>${item.screenshot ?? ''}</td></tr>`,
    )
    .join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Final Production Smoke Test</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 24px; max-width: 960px; }
    table { border-collapse: collapse; width: 100%; margin-top: 16px; font-size: 14px; }
    th, td { border: 1px solid #ddd; padding: 8px 10px; text-align: left; vertical-align: top; }
    tr.pass td:nth-child(2) { color: #0a7a32; font-weight: 600; }
    tr.fail td:nth-child(2) { color: #b42318; font-weight: 600; }
    .meta { line-height: 1.7; margin-bottom: 16px; }
    .ready { font-weight: 600; }
    .ready.pass { color: #0a7a32; }
    .ready.fail { color: #b42318; }
  </style>
</head>
<body>
  <h1>Final Production Smoke Test</h1>
  <div class="meta">
    <div><strong>Production commit:</strong> ${report.productionCommit}</div>
    <div><strong>Tested at:</strong> ${report.testedAt}</div>
    <div><strong>Demo URL:</strong> ${report.demoUrl}</div>
    <div><strong>App URL:</strong> ${report.appUrl}</div>
    <div><strong>Video:</strong> ${report.videoPath}</div>
    <div><strong>Screenshots:</strong> ${report.evidenceDir}</div>
    <div class="ready ${report.readyToShare ? 'pass' : 'fail'}">
      Ready to share: ${report.readyToShare ? 'YES' : 'NO'}
    </div>
    ${report.blockers.length ? `<div><strong>Blockers:</strong><ul>${report.blockers.map((b) => `<li>${b}</li>`).join('')}</ul></div>` : ''}
  </div>
  <table>
    <thead><tr><th>ID</th><th>Result</th><th>Message</th><th>Screenshot</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`
}

async function runDemoFullApp(page) {
  await page.goto(DEMO_URL, { waitUntil: 'networkidle', timeout: 60000 })
  await page.evaluate(() => localStorage.removeItem('pawstreak:demo'))
  await page.reload({ waitUntil: 'networkidle', timeout: 60000 })

  const homeVisible = await page.locator('.home-intro-title').isVisible()
  await record(
    'A01-home-loads',
    homeVisible,
    'Demo Home loads immediately',
    'a01-demo-home.png',
  )
  await screenshot(page, 'a01-demo-home')

  const heroBefore = (await page.locator('.hc-title').textContent())?.trim() || ''
  await clickChip(page, 'Coffee')
  const heroAfter = (await page.locator('.hc-title').textContent())?.trim() || ''
  await record(
    'A02-chips-change-hero',
    heroBefore !== heroAfter && heroAfter.length > 0,
    `Activity chips change recommendation ("${heroBefore}" -> "${heroAfter}")`,
    'a02-demo-chip-change.png',
  )
  await screenshot(page, 'a02-demo-chip-change')

  await page.getByRole('button', { name: '15 min', exact: true }).click()
  await page.waitForTimeout(500)
  const readyVisible = await page.locator('.adv-ready-label').isVisible()
  await record(
    'A03-adventure-ready',
    readyVisible,
    'Duration button opens Adventure Ready screen',
    'a03-demo-adventure-ready.png',
  )
  await screenshot(page, 'a03-demo-adventure-ready')

  await page.getByRole('button', { name: 'Start adventure', exact: true }).click()
  await page.waitForTimeout(600)
  const timerText = (await page.locator('.clk-time').textContent())?.trim() || ''
  await record(
    'A04-timer-zero',
    timerText.startsWith('0:00'),
    `Start Adventure timer at 0:00 (got "${timerText}")`,
    'a04-demo-active-timer.png',
  )
  await screenshot(page, 'a04-demo-active-timer')

  const beforeCount = await page.evaluate(() => {
    const raw = localStorage.getItem('pawstreak:demo')
    if (!raw) return 0
    const state = JSON.parse(raw)
    return Array.isArray(state.journeyEntries) ? state.journeyEntries.length : 0
  })

  await page.getByRole('button', { name: 'Finish', exact: true }).click()
  await page.waitForTimeout(800)

  const afterState = await page.evaluate(() => {
    const raw = localStorage.getItem('pawstreak:demo')
    return raw ? JSON.parse(raw) : null
  })
  const todayEntry = afterState?.journeyEntries?.some((entry) => entry.date === 'Today')
  const onJourney = await page.locator('.alogo').filter({ hasText: /Journey/i }).isVisible()
  await record(
    'A05-finish-journey-memory',
    todayEntry && onJourney,
    `Finish creates Journey memory (Today entry: ${Boolean(todayEntry)})`,
    'a05-demo-journey-after-finish.png',
  )
  await screenshot(page, 'a05-demo-journey-after-finish')

  await clickNav(page, 'Plan')
  await record(
    'A06-plan-tab',
    await page.locator('.plan-title').isVisible(),
    'Plan tab opens',
    'a06-demo-plan.png',
  )
  await screenshot(page, 'a06-demo-plan')

  await page.getByRole('button', { name: /Curated for your dogs/i }).click()
  await page.waitForTimeout(400)
  await clickCuratedOption(page, 'Burn energy')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.waitForTimeout(300)
  await clickCuratedOption(page, '30 min daily')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.waitForTimeout(300)
  await clickCuratedOption(page, 'Beaches')
  await page.locator('.curated-next-btn').click()
  await page.waitForTimeout(500)
  const curatedResult = await page.locator('.curated-result-title').isVisible()
  await record(
    'A07-curated-plan',
    curatedResult,
    'Curated Plan opens and progresses to result',
    'a07-demo-curated-result.png',
  )
  await screenshot(page, 'a07-demo-curated-result')
  await exitOverlayBack(page)

  await clickNav(page, 'Journey')
  await record(
    'A08-journey-tab',
    await page.locator('.alogo').filter({ hasText: /Journey/i }).isVisible(),
    'Journey tab opens',
    'a08-demo-journey.png',
  )
  await screenshot(page, 'a08-demo-journey')

  await page.locator('.mcard').first().click()
  await page.waitForTimeout(500)
  await record(
    'A09-journey-memory-detail',
    await page.locator('.memory-place').isVisible(),
    'Journey memory detail opens',
    'a09-demo-memory-detail.png',
  )
  await screenshot(page, 'a09-demo-memory-detail')
  await exitOverlayBack(page)

  await clickNav(page, 'Community')
  await record(
    'A10-community-tab',
    await page.locator('.comm-participate').isVisible(),
    'Community tab opens',
    'a10-demo-community.png',
  )
  await screenshot(page, 'a10-demo-community')

  const firstPost = page.locator('.comm-post').first()
  const likeBefore = Number((await firstPost.locator('.cpa').first().textContent())?.trim() || '0')
  await firstPost.locator('.cpa').first().click()
  await page.waitForTimeout(400)
  const liked = await firstPost.locator('.cpa--liked').isVisible()
  await record(
    'A11-like',
    liked,
    `Like interaction works (liked state: ${liked}, before count ${likeBefore})`,
  )

  await firstPost.locator('.cpa').nth(1).click()
  await page.waitForTimeout(300)
  await page.locator('.comm-comments-panel').scrollIntoViewIfNeeded()
  const commentsBefore = Number(
    (await firstPost.locator('.cpa').nth(1).textContent())?.trim() || '0',
  )
  await page.locator('.comm-comments-input').fill('Great outing!')
  await page.locator('.comm-comments-send').evaluate((button) => {
    button.click()
  })
  await page.waitForTimeout(500)
  const commentVisible = await page
    .locator('.comm-comment-text')
    .filter({ hasText: 'Great outing!' })
    .isVisible()
  const commentsAfter = Number(
    (await firstPost.locator('.cpa').nth(1).textContent())?.trim() || '0',
  )
  await record(
    'A12-comment',
    commentVisible || commentsAfter > commentsBefore,
    `Comment interaction works (visible: ${commentVisible}, ${commentsBefore} -> ${commentsAfter})`,
  )
  if (await page.getByRole('button', { name: 'Done', exact: true }).isVisible()) {
    await page.getByRole('button', { name: 'Done', exact: true }).click({ force: true })
    await page.waitForTimeout(300)
  }

  await page.getByRole('button', { name: 'Post to community' }).click()
  await page.waitForTimeout(400)
  await page.locator('.comm-compose-caption').fill('Production smoke test post')
  await page.getByRole('button', { name: 'Share with the pack' }).click()
  await page.waitForTimeout(500)
  const userPost = await page.locator('.comm-post').filter({ hasText: 'Production smoke test post' }).isVisible()
  await record(
    'A13-post',
    userPost,
    'Post to community works',
    'a11-demo-community-post.png',
  )
  await screenshot(page, 'a11-demo-community-post')

  await clickNav(page, 'Milestones')
  await record(
    'A14-milestones-tab',
    await page.locator('.msb-sub').isVisible(),
    'Milestones tab opens',
    'a12-demo-milestones.png',
  )
  await screenshot(page, 'a12-demo-milestones')

  await page.locator('.challenge').first().click()
  await page.waitForTimeout(500)
  await record(
    'A15-challenge-detail',
    await page.locator('.chdetail-title').isVisible(),
    'Challenge detail opens',
    'a13-demo-challenge-detail.png',
  )
  await screenshot(page, 'a13-demo-challenge-detail')
  await exitOverlayBack(page)

  await page.locator('.ach-item').first().click()
  await page.waitForTimeout(500)
  await record(
    'A16-achievement-detail',
    await page.locator('.achdetail-title').isVisible(),
    'Achievement detail opens',
    'a14-demo-achievement-detail.png',
  )
  await screenshot(page, 'a14-demo-achievement-detail')
  await exitOverlayBack(page)

  await clickNav(page, 'Home')
  const navWorks = await page.locator('.home-intro-title').isVisible()
  await record('A17-bottom-nav', navWorks, 'Bottom nav works throughout (returned to Home)')
}

async function runNormalOnboarding(page) {
  await page.goto(APP_URL, { waitUntil: 'networkidle', timeout: 60000 })
  await page.evaluate(() => {
    localStorage.removeItem('pawstreak:app')
    localStorage.removeItem('pawstreak:demo')
  })
  await page.reload({ waitUntil: 'networkidle', timeout: 60000 })

  const onboardingVisible = await page.getByRole('button', { name: /Get started/i }).isVisible()
  await record(
    'B01-onboarding',
    onboardingVisible,
    'Onboarding appears on root URL',
    'b01-onboarding.png',
  )
  await screenshot(page, 'b01-onboarding')

  await page.getByRole('button', { name: /Get started/i }).click()
  await page.getByPlaceholder('First name').fill('QA Tester')
  await page.getByPlaceholder('you@email.com').fill('qa@pawstreak.test')
  await page.getByPlaceholder('Min. 8 characters').fill('password123')
  await page.getByRole('button', { name: /Create account/i }).click()

  await page.getByPlaceholder('e.g. Luna').fill('Taco')
  await page.locator('select.field-input').first().selectOption('Mixed / Other')
  await page.locator('select.field-input').nth(1).selectOption('1–3 years')
  await record(
    'B02-taco-created',
    (await page.getByPlaceholder('e.g. Luna').inputValue()) === 'Taco',
    'Dog named Taco entered during onboarding',
    'b02-onboarding-taco.png',
  )
  await screenshot(page, 'b02-onboarding-taco')

  await page.getByRole('button', { name: /^Next$/ }).click()
  await page.getByRole('button', { name: 'Explorer' }).click()
  await page.getByRole('button', { name: /^Next$/ }).click()
  await page
    .getByPlaceholder('ZIP, city, or neighborhood — e.g. 92123 or San Diego')
    .fill('92123')
  await page.getByRole('button', { name: /Create our world/i }).click()
  await page.getByRole('button', { name: /Start your first adventure/i }).click()
  await page.waitForTimeout(700)

  const homeHeadline = (await page.locator('.home-intro-title').textContent())?.trim() || ''
  await record(
    'B03-home-taco',
    homeHeadline.includes('Taco'),
    `Home says Taco ("${homeHeadline}")`,
    'b03-taco-home.png',
  )
  await screenshot(page, 'b03-taco-home')

  await clickNav(page, 'Plan')
  const planCopy = (await page.locator('.plan-title').textContent())?.trim() || ''
  await clickNav(page, 'Journey')
  const journeyTitle = (await page.locator('.alogo').textContent())?.trim() || ''
  await clickNav(page, 'Home')
  await page.locator('button.two-dogs').click()
  await page.waitForTimeout(400)
  const profileTaco = await page.getByText('Taco').first().isVisible()
  await record(
    'B04-screens-personalized',
    planCopy.includes('Taco') &&
      journeyTitle.includes("Taco's Journey") &&
      profileTaco,
    `Plan/Journey/Profile use Taco (plan: "${planCopy}", journey: "${journeyTitle}")`,
    'b04-taco-profile.png',
  )
  await screenshot(page, 'b04-taco-profile')

  const bodyText = await page.locator('body').innerText()
  await record(
    'B05-no-ghost-names',
    !hasGhostNames(bodyText),
    'No Bailey/Omi ghost names after onboarding',
  )

  const packAccessVisible = await page.getByText('Pack Access').isVisible()
  await record(
    'B06-pack-access',
    packAccessVisible,
    'Pack Access appears on Profile',
    'b05-pack-access.png',
  )
  await screenshot(page, 'b05-pack-access')

  await page.getByRole('button', { name: 'Invite someone' }).click()
  await page.waitForTimeout(400)
  await page.getByPlaceholder('e.g. Dog Mom').fill('Dog Mom')
  await page.locator('.pack-invite-field select.field-input').selectOption('Family')
  await page.getByRole('button', { name: 'Save invite locally' }).click()
  await page.waitForTimeout(500)
  const memberCount = await page.locator('.pack-access-card').count()
  await record(
    'B07-invite-dog-mom',
    memberCount >= 4,
    `Invite Dog Mom / Family member saved (${memberCount} pack cards)`,
    'b06-pack-invite-saved.png',
  )
  await screenshot(page, 'b06-pack-invite-saved')

  await page.reload({ waitUntil: 'networkidle', timeout: 60000 })
  await page.waitForTimeout(600)
  await clickNav(page, 'Home')
  await page.locator('button.two-dogs').click()
  await page.waitForTimeout(400)

  const tacoAfterRefresh = await page.getByText('Taco').first().isVisible()
  const membersAfterRefresh = await page.locator('.pack-access-card').count()
  await record(
    'B08-persist-after-refresh',
    tacoAfterRefresh && membersAfterRefresh >= 4,
    `Taco and Pack Access persist after refresh (${membersAfterRefresh} cards)`,
    'b07-taco-persist.png',
  )
  await screenshot(page, 'b07-taco-persist')
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  await mkdir(path.join(OUT_DIR, 'video'), { recursive: true })

  const productionCommit = await resolveProductionCommit()
  const testedAt = new Date().toISOString()

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    ...iPhone,
    recordVideo: {
      dir: path.join(OUT_DIR, 'video'),
      size: { width: 390, height: 844 },
    },
  })

  let blockers = []
  const runWebm = path.join(OUT_DIR, 'video', 'run.webm')

  const page = await context.newPage()
  const video = page.video()

  try {
    await runDemoFullApp(page)
  } catch (error) {
    overallPass = false
    blockers.push(`Demo: ${error instanceof Error ? error.message : String(error)}`)
    await screenshot(page, 'a99-demo-failure').catch(() => {})
  }

  try {
    await runNormalOnboarding(page)
  } catch (error) {
    overallPass = false
    blockers.push(`Onboarding: ${error instanceof Error ? error.message : String(error)}`)
    await screenshot(page, 'b99-onboarding-failure').catch(() => {})
  } finally {
    await page.close()
    await context.close()

    const videoPath = video ? await video.path() : null
    const runWebm = path.join(OUT_DIR, 'video', 'run.webm')
    if (videoPath) {
      await copyFile(videoPath, runWebm).catch(() => {})
    }

    await browser.close()
  }

  const failed = results.filter((r) => !r.pass)
  if (failed.length) {
    blockers = [
      ...blockers,
      ...failed.map((f) => `${f.id}: ${f.message}`),
    ]
  }

  const report = {
    productionCommit,
    testedAt,
    demoUrl: DEMO_URL,
    appUrl: APP_URL,
    overallPass,
    readyToShare: overallPass,
    blockers: [...new Set(blockers)],
    evidenceDir: OUT_DIR,
    videoPath: runWebm,
    screenshotDir: OUT_DIR,
    results,
  }

  await writeFile(path.join(OUT_DIR, 'report.json'), JSON.stringify(report, null, 2))
  await writeFile(path.join(OUT_DIR, 'report.html'), buildHtmlReport(report))

  console.log('\n--- FINAL PRODUCTION SMOKE TEST ---')
  console.log(JSON.stringify(report, null, 2))
  process.exit(overallPass ? 0 : 1)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
