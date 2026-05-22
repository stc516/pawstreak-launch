import { chromium, devices } from 'playwright'
import { copyFile, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE_URL = process.env.QA_BASE_URL || 'http://localhost:5173'
const OUT_DIR =
  process.env.QA_OUT_DIR || path.join(__dirname, 'evidence', 'taco-personalization')

function resolveCommit() {
  if (process.env.QA_COMMIT) return process.env.QA_COMMIT
  try {
    return execSync('git rev-parse HEAD', { cwd: path.join(__dirname, '..'), encoding: 'utf8' }).trim()
  } catch {
    return 'unknown'
  }
}

const COMMIT = resolveCommit()
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
  await record(flow, !hasGhostNames(text), `${label} has no Bailey/Omi ghost names`)
}

async function clickNav(page, label) {
  await page.getByRole('button', { name: label, exact: true }).click()
  await page.waitForTimeout(400)
}

async function exitCuratedFlow(page) {
  const done = page.getByRole('button', { name: 'Done', exact: true })
  if (await done.isVisible().catch(() => false)) {
    await done.click()
    await page.waitForTimeout(300)
    return
  }
  for (let i = 0; i < 3; i += 1) {
    const back = page.getByRole('button', { name: 'Back', exact: true })
    if (await back.isVisible().catch(() => false)) {
      await back.click()
      await page.waitForTimeout(300)
    }
  }
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

  const dogNameValue = await page.getByPlaceholder('e.g. Luna').inputValue()
  await record(
    'onboarding-dog-name-filled',
    dogNameValue === 'Taco',
    `Onboarding dog name field shows Taco (got "${dogNameValue}")`,
  )

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

function buildHtmlReport(report) {
  const rows = report.results
    .map(
      (item) =>
        `<tr class="${item.pass ? 'pass' : 'fail'}"><td>${item.flow}</td><td>${item.pass ? 'PASS' : 'FAIL'}</td><td>${item.message}</td></tr>`,
    )
    .join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Taco Personalization QA</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 24px; color: #1a1a1a; }
    h1 { font-size: 1.25rem; }
    table { border-collapse: collapse; width: 100%; margin-top: 16px; }
    th, td { border: 1px solid #ddd; padding: 8px 10px; text-align: left; vertical-align: top; }
    th { background: #f5f5f5; }
    tr.pass td:nth-child(2) { color: #0a7a32; font-weight: 600; }
    tr.fail td:nth-child(2) { color: #b42318; font-weight: 600; }
    .meta { margin-top: 12px; line-height: 1.6; }
  </style>
</head>
<body>
  <h1>Taco Personalization QA</h1>
  <div class="meta">
    <div><strong>Commit:</strong> ${report.commit}</div>
    <div><strong>Tested:</strong> ${report.testedAt}</div>
    <div><strong>Overall:</strong> ${report.overallPass ? 'PASS' : 'FAIL'}</div>
    <div><strong>Video:</strong> ${report.videoPath}</div>
  </div>
  <table>
    <thead><tr><th>Flow</th><th>Result</th><th>Message</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`
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
    await completeOnboarding(page)

    const homeIntro = (await page.locator('.home-intro-kicker').textContent())?.trim() || ''
    await record('home-taco-label', homeIntro.includes('Taco'), `Home intro uses Taco ("${homeIntro}")`)
    await assertNoGhostNames(page, 'home-no-ghosts', 'Home')
    await screenshot(page, '02-home-taco')

    await page.getByRole('button', { name: '15 min', exact: true }).click()
    await page.waitForTimeout(500)
    const readyDogs = (await page.locator('.adv-ready-row').filter({ hasText: 'Dogs' }).textContent()) ?? ''
    await record(
      'active-ready-taco',
      readyDogs.includes('Taco') && !hasGhostNames(readyDogs),
      `Active Adventure ready screen uses Taco ("${readyDogs.trim()}")`,
    )
    await page.getByRole('button', { name: 'Start adventure', exact: true }).click()
    await page.waitForTimeout(500)
    const activeDogs = (await page.locator('.clk-dogs').textContent())?.trim() || ''
    await record(
      'active-state-taco',
      activeDogs.includes('Taco') && !hasGhostNames(activeDogs),
      `Active Adventure state uses Taco ("${activeDogs}")`,
    )
    await assertNoGhostNames(page, 'active-no-ghosts', 'Active Adventure')
    await screenshot(page, '09-active-adventure-taco')

    const finish = page.getByRole('button', { name: 'Finish', exact: true })
    if (await finish.isVisible().catch(() => false)) {
      await finish.click()
      await page.waitForTimeout(500)
    } else {
      await page.getByRole('button', { name: 'Back', exact: true }).click()
      await page.waitForTimeout(400)
    }

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

    await page.locator('.curated-option').first().click()
    await page.waitForTimeout(250)
    await page.locator('.curated-next-btn').click()
    await page.waitForTimeout(500)

    const resultTitle = (await page.locator('.curated-result-title').textContent())?.trim() || ''
    await record(
      'curated-result-taco',
      resultTitle.includes('Taco') && !hasGhostNames(resultTitle),
      `Curated result uses Taco ("${resultTitle}")`,
    )
    await assertNoGhostNames(page, 'curated-result-no-ghosts', 'Curated Plan result')

    await exitCuratedFlow(page)

    await clickNav(page, 'Journey')
    const journeyTitle = (await page.locator('.alogo').textContent())?.trim() || ''
    await record(
      'journey-taco-title',
      journeyTitle.includes("Taco's Journey"),
      `Journey title personalized ("${journeyTitle}")`,
    )
    const flashSub = (await page.locator('.flash-sub').textContent())?.trim() || ''
    await record(
      'journey-flashback-taco',
      flashSub.includes('Taco') && !hasGhostNames(flashSub),
      `Journey flashback uses Taco ("${flashSub}")`,
    )
    await assertNoGhostNames(page, 'journey-no-ghosts', 'Journey')
    await screenshot(page, '05-journey-taco')

    await page.locator('.mcard').first().click()
    await page.waitForTimeout(500)
    await assertNoGhostNames(page, 'journey-memory-no-ghosts', 'Journey memory detail')
    await page.getByRole('button', { name: 'Back', exact: true }).click()
    await page.waitForTimeout(400)

    await clickNav(page, 'Milestones')
    const bondSub = (await page.locator('.msb-sub').textContent())?.trim() || ''
    await record(
      'milestones-taco-bond',
      bondSub.includes('Taco') && !hasGhostNames(bondSub),
      `Milestones bond subtitle uses Taco ("${bondSub}")`,
    )
    await assertNoGhostNames(page, 'milestones-no-ghosts', 'Milestones')
    await screenshot(page, '06-milestones-taco')

    await page.locator('.challenge').first().click()
    await page.waitForTimeout(500)
    await assertNoGhostNames(page, 'challenge-detail-no-ghosts', 'Challenge detail')
    await page.getByRole('button', { name: 'Back', exact: true }).click()
    await page.waitForTimeout(400)

    await page.locator('.ach-item').first().click()
    await page.waitForTimeout(500)
    await assertNoGhostNames(page, 'achievement-detail-no-ghosts', 'Achievement detail')
    await page.getByRole('button', { name: 'Back', exact: true }).click()
    await page.waitForTimeout(400)

    await clickNav(page, 'Community')
    await assertNoGhostNames(page, 'community-no-ghosts', 'Community')
    const packAccessPersisted = await page.evaluate(() => {
      const raw = localStorage.getItem('pawstreak:app')
      if (!raw) return false
      const state = JSON.parse(raw)
      return Array.isArray(state.packAccessMembers) && state.packAccessMembers.length > 0
    })
    await record(
      'pack-access-persisted',
      packAccessPersisted,
      'Pack Access members persist in localStorage after onboarding',
    )

    await clickNav(page, 'Home')
    await page.getByRole('button', { name: 'Taco' }).click()
    await page.waitForTimeout(400)
    await record('profile-taco', await page.getByText('Taco').first().isVisible(), 'Profile shows Taco')
    await assertNoGhostNames(page, 'profile-no-ghosts', 'Profile')
    await screenshot(page, '07-profile-taco')

    await page.locator('.pack-access-section').scrollIntoViewIfNeeded()
    await page.waitForTimeout(300)
    await assertNoGhostNames(page, 'pack-access-no-ghosts', 'Pack Access')
    await screenshot(page, '08-pack-access-taco')
  } catch (error) {
    overallPass = false
    errorMessage = error instanceof Error ? error.message : String(error)
    await screenshot(page, '99-failure-state').catch(() => {})
    console.error(errorMessage)
  }

  const video = page.video()
  await page.close()
  await context.close()

  const videoPath = video ? await video.path() : null
  const runWebm = path.join(OUT_DIR, 'video', 'run.webm')
  if (videoPath) {
    await copyFile(videoPath, runWebm)
    console.log(`Video saved: ${runWebm}`)
  }

  await browser.close()

  const report = {
    commit: COMMIT,
    testedAt: new Date().toISOString(),
    overallPass,
    errorMessage,
    evidenceDir: OUT_DIR,
    videoPath: runWebm,
    results,
  }

  await writeFile(path.join(OUT_DIR, 'report.json'), JSON.stringify(report, null, 2))
  await writeFile(path.join(OUT_DIR, 'report.html'), buildHtmlReport(report))

  console.log('\n--- TACO PERSONALIZATION QA ---')
  console.log(JSON.stringify(report, null, 2))
  process.exit(overallPass ? 0 : 1)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
