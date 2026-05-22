import { chromium, devices } from 'playwright'
import { copyFile, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE_URL = process.env.QA_BASE_URL || 'http://localhost:5173'
const OUT_DIR = process.env.QA_OUT_DIR || path.join(__dirname, 'evidence', 'demo-route')

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

async function clickNav(page, label) {
  await page.getByRole('button', { name: label, exact: true }).click()
  await page.waitForTimeout(400)
}

async function clearStorage(page, keys) {
  await page.evaluate((storageKeys) => {
    storageKeys.forEach((key) => localStorage.removeItem(key))
  }, keys)
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
  <title>Demo Route QA</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 24px; }
    table { border-collapse: collapse; width: 100%; margin-top: 16px; }
    th, td { border: 1px solid #ddd; padding: 8px 10px; text-align: left; }
    tr.pass td:nth-child(2) { color: #0a7a32; font-weight: 600; }
    tr.fail td:nth-child(2) { color: #b42318; font-weight: 600; }
  </style>
</head>
<body>
  <h1>Demo Route QA</h1>
  <p><strong>Commit:</strong> ${report.commit}</p>
  <p><strong>Overall:</strong> ${report.overallPass ? 'PASS' : 'FAIL'}</p>
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
    // Test 1: root shows onboarding when app storage is empty
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' })
    await clearStorage(page, ['pawstreak:app', 'pawstreak:demo'])
    await page.reload({ waitUntil: 'networkidle' })

    const onboardingVisible = await page
      .getByRole('button', { name: /Get started/i })
      .isVisible()
    await record('root-onboarding', onboardingVisible, 'Root route shows onboarding for new users')
    await screenshot(page, '01-root-onboarding')

    // Test 2: demo route loads full app with Bailey + Omi
    await page.goto(`${BASE_URL}/demo`, { waitUntil: 'networkidle' })
    await clearStorage(page, ['pawstreak:demo'])
    await page.reload({ waitUntil: 'networkidle' })

    const appStorageBeforeDemo = await page.evaluate(() =>
      localStorage.getItem('pawstreak:app'),
    )

    const demoHomeVisible = await page.locator('.home-intro-kicker').isVisible()
    await record('demo-home-visible', demoHomeVisible, 'Demo route shows Home immediately')

    const demoDogs = (await page.locator('.dog-names').textContent())?.trim() || ''
    await record(
      'demo-bailey-omi',
      demoDogs.includes('Bailey + Omi'),
      `Demo home shows Bailey + Omi ("${demoDogs}")`,
    )

    const demoPill = await page.locator('.demo-pill').isVisible()
    await record('demo-pill-visible', demoPill, 'Demo pill indicator is visible')

    await screenshot(page, '02-demo-home')

    await clickNav(page, 'Plan')
    await record(
      'demo-plan',
      await page.locator('.plan-title').isVisible(),
      'Demo Plan screen loads',
    )
    await screenshot(page, '03-demo-plan')

    await clickNav(page, 'Journey')
    const journeyTitle = (await page.locator('.alogo').textContent())?.trim() || ''
    await record(
      'demo-journey',
      journeyTitle.includes("Bailey + Omi's Journey"),
      `Demo Journey title shows seeded demo ("${journeyTitle}")`,
    )
    await screenshot(page, '04-demo-journey')

    await clickNav(page, 'Community')
    await record(
      'demo-community',
      await page.locator('.comm-participate').isVisible(),
      'Demo Community screen loads',
    )
    await screenshot(page, '05-demo-community')

    await clickNav(page, 'Milestones')
    const bondSub = (await page.locator('.msb-sub').textContent())?.trim() || ''
    await record(
      'demo-milestones',
      bondSub.includes('Bailey + Omi'),
      `Demo Milestones bond subtitle uses Bailey + Omi ("${bondSub}")`,
    )
    await screenshot(page, '06-demo-milestones')

    await page.locator('.challenge').first().click()
    await page.waitForTimeout(500)
    await record(
      'demo-challenge-detail',
      await page.locator('.chdetail-title').isVisible(),
      'Demo Challenge detail opens',
    )
    await page.getByRole('button', { name: 'Back', exact: true }).click()
    await page.waitForTimeout(400)

    await clickNav(page, 'Journey')
    await page.locator('.mcard').first().click()
    await page.waitForTimeout(500)
    await record(
      'demo-memory-detail',
      await page.locator('.memory-place').isVisible(),
      'Demo Journey memory detail opens',
    )
    await screenshot(page, '07-demo-memory-detail')
    await page.getByRole('button', { name: 'Back', exact: true }).click()
    await page.waitForTimeout(400)

    await clickNav(page, 'Home')
    await page.getByRole('button', { name: '15 min', exact: true }).click()
    await page.waitForTimeout(500)
    await record(
      'demo-active-ready',
      await page.locator('.adv-ready-label').isVisible(),
      'Demo Active Adventure ready screen opens',
    )
    const readyDogs = (await page.locator('.adv-ready-row').filter({ hasText: 'Dogs' }).textContent()) ?? ''
    await record(
      'demo-active-ready-dogs',
      readyDogs.includes('Bailey + Omi'),
      `Active Adventure ready shows Bailey + Omi ("${readyDogs.trim()}")`,
    )
    await screenshot(page, '08-demo-active-adventure-ready')

    const demoStorageMode = await page.evaluate(() => {
      const raw = localStorage.getItem('pawstreak:demo')
      if (!raw) return null
      return JSON.parse(raw).mode
    })
    await record(
      'demo-storage-mode',
      demoStorageMode === 'demo',
      `Demo interactions persist under pawstreak:demo with mode "${demoStorageMode}"`,
    )

    const appStorageAfterDemo = await page.evaluate(() =>
      localStorage.getItem('pawstreak:app'),
    )
    await record(
      'demo-does-not-touch-app-storage',
      appStorageBeforeDemo === appStorageAfterDemo,
      'Demo route does not modify pawstreak:app while browsing /demo',
    )

    // Test 3: root still shows onboarding after demo session
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' })
    await clearStorage(page, ['pawstreak:app'])
    await page.reload({ waitUntil: 'networkidle' })

    const rootOnboardingAgain = await page
      .getByRole('button', { name: /Get started/i })
      .isVisible()
    await record(
      'root-onboarding-after-demo',
      rootOnboardingAgain,
      'Root route still shows onboarding when app storage is cleared',
    )

    const demoStorageStillExists = await page.evaluate(() =>
      Boolean(localStorage.getItem('pawstreak:demo')),
    )
    await record(
      'demo-storage-separate',
      demoStorageStillExists,
      'Demo localStorage remains separate from normal app storage',
    )
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

  console.log('\n--- DEMO ROUTE QA ---')
  console.log(JSON.stringify(report, null, 2))
  process.exit(overallPass ? 0 : 1)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
