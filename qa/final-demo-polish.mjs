import { chromium, devices } from 'playwright'
import { copyFile, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DEMO_URL = process.env.QA_DEMO_URL || 'https://pawstreak-launch.vercel.app/demo'
const APP_URL = process.env.QA_APP_URL || 'https://pawstreak-launch.vercel.app'
const OUT_DIR = process.env.QA_OUT_DIR || path.join(__dirname, 'evidence', 'final-demo-polish')

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
  await page.waitForTimeout(450)
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
  <title>Final Demo Polish QA</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 24px; }
    table { border-collapse: collapse; width: 100%; margin-top: 16px; }
    th, td { border: 1px solid #ddd; padding: 8px 10px; text-align: left; }
    tr.pass td:nth-child(2) { color: #0a7a32; font-weight: 600; }
    tr.fail td:nth-child(2) { color: #b42318; font-weight: 600; }
  </style>
</head>
<body>
  <h1>Final Demo Polish QA</h1>
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
    await page.goto(DEMO_URL, { waitUntil: 'networkidle', timeout: 60000 })
    await page.evaluate(() => localStorage.removeItem('pawstreak:demo'))
    await page.reload({ waitUntil: 'networkidle', timeout: 60000 })

    const demoBarVisible = await page.locator('.demo-mode-bar .demo-pill').isVisible()
    const demoPillBox = await page.locator('.demo-mode-bar .demo-pill').boundingBox()
    const dogPillBox = await page.locator('.two-dogs').boundingBox()
    const pillsOverlap =
      demoPillBox &&
      dogPillBox &&
      demoPillBox.y < dogPillBox.y + dogPillBox.height &&
      demoPillBox.y + demoPillBox.height > dogPillBox.y
    await record(
      'demo-badge-placement',
      demoBarVisible && !pillsOverlap,
      'Demo badge sits under status bar without overlapping dog pill',
    )

    const feedback = page.locator('.demo-feedback-trigger')
    const feedbackBox = await feedback.boundingBox()
    const navBox = await page.locator('.bnav').boundingBox()
    const feedbackCompact =
      feedbackBox && navBox && feedbackBox.width < 120 && feedbackBox.y + feedbackBox.height <= navBox.y + 4
    await record(
      'demo-feedback-subtle',
      (await feedback.isVisible()) && Boolean(feedbackCompact),
      'Feedback appears as compact pill above bottom nav',
    )

    const introSub = (await page.locator('.home-intro-sub').textContent())?.trim() || ''
    const packNote = (await page.locator('.home-pack-note').textContent())?.trim() || ''
    const cityCount = (introSub.match(/your city is out there/gi) || []).length +
      (packNote.match(/your city is out there/gi) || []).length
    await record(
      'demo-home-copy',
      introSub.includes('San Diego') &&
        introSub.includes("Pick today's adventure") &&
        cityCount === 0,
      `Home copy de-duplicated ("${introSub}")`,
    )

    const vibePanel = await page.locator('.home-vibe-panel').isVisible()
    const startLabel = await page.locator('.hc-start-label').isVisible()
    await record(
      'demo-home-above-fold',
      vibePanel && startLabel,
      'Home vibe panel and primary action label are visible',
    )
    await screenshot(page, '01-demo-home')

    await clickNav(page, 'Journey')
    await record(
      'demo-journey',
      await page.locator('.mcard').first().isVisible(),
      'Demo Journey list loads',
    )
    await screenshot(page, '02-demo-journey')

    await clickNav(page, 'Community')
    await record(
      'demo-community',
      await page.locator('.comm-post').first().isVisible(),
      'Demo Community feed loads',
    )
    await screenshot(page, '03-demo-community')

    await page.goto(APP_URL, { waitUntil: 'networkidle', timeout: 60000 })
    await page.evaluate(() => localStorage.removeItem('pawstreak:app'))
    await page.reload({ waitUntil: 'networkidle', timeout: 60000 })

    const noDemoFeedback = !(await page.locator('.demo-feedback-trigger').isVisible().catch(() => false))
    await record(
      'root-no-demo-feedback',
      noDemoFeedback && (await page.getByRole('button', { name: /Get started/i }).isVisible()),
      'Root onboarding has no demo feedback button',
    )

    await page.getByRole('button', { name: /Get started/i }).click()
    await page.getByPlaceholder('First name').fill('QA Tester')
    await page.getByPlaceholder('you@email.com').fill('qa@pawstreak.test')
    await page.getByPlaceholder('Min. 8 characters').fill('password123')
    await page.getByRole('button', { name: /Create account/i }).click()
    await page.getByPlaceholder('e.g. Luna').fill('Taco')
    await page.locator('select.field-input').first().selectOption('Mixed / Other')
    await page.locator('select.field-input').nth(1).selectOption('1–3 years')
    await page.getByRole('button', { name: /^Next$/ }).click()
    await page.getByRole('button', { name: 'Slow Sniffer' }).click()
    await page.getByRole('button', { name: 'Explorer' }).click()
    await page.getByRole('button', { name: /^Next$/ }).click()
    await page.getByRole('button', { name: /Create our world/i }).click()
    await page.getByRole('button', { name: /Start your first adventure/i }).click()
    await page.waitForTimeout(600)

    const tacoHome = (await page.locator('.home-intro-title').textContent())?.includes('Taco')
    await record('taco-onboarding-home', Boolean(tacoHome), 'Taco onboarding reaches personalized Home')
    await screenshot(page, '04-taco-home')

    await clickNav(page, 'Milestones')
    await clickNav(page, 'Home')
    await page.locator('.two-dogs').click()
    await page.waitForTimeout(400)
    await record(
      'profile-pack-access',
      await page.locator('.pack-access-section').isVisible(),
      'Profile Pack Access section visible',
    )
    await screenshot(page, '05-profile-pack-access')
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

  console.log('\n--- FINAL DEMO POLISH QA ---')
  console.log(JSON.stringify(report, null, 2))
  process.exit(overallPass ? 0 : 1)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
