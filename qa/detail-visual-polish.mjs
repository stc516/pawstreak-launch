import { chromium, devices } from 'playwright'
import { copyFile, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE_URL = process.env.QA_BASE_URL || 'http://localhost:5173'
const OUT_DIR = process.env.QA_OUT_DIR || path.join(__dirname, 'evidence', 'detail-visual-polish')

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

async function countWarmSurfaces(page) {
  return page.evaluate(() => {
    const warm = document.querySelectorAll(
      '.detail-card-warm, .detail-tint--warm, .detail-quote-block',
    ).length
    return warm
  })
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
  <title>Detail Visual Polish QA</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 24px; }
    table { border-collapse: collapse; width: 100%; margin-top: 16px; }
    th, td { border: 1px solid #ddd; padding: 8px 10px; text-align: left; }
    tr.pass td:nth-child(2) { color: #0a7a32; font-weight: 600; }
    tr.fail td:nth-child(2) { color: #b42318; font-weight: 600; }
  </style>
</head>
<body>
  <h1>Detail Visual Polish QA</h1>
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
    await page.goto(`${BASE_URL}/demo`, { waitUntil: 'networkidle' })
    await page.evaluate(() => localStorage.removeItem('pawstreak:demo'))
    await page.reload({ waitUntil: 'networkidle' })

    // Journey memory detail
    await clickNav(page, 'Journey')
    await page.locator('.mcard').first().click()
    await page.waitForTimeout(500)
    const memoryWarm = await countWarmSurfaces(page)
    await record(
      'journey-memory-detail',
      (await page.locator('.memory-place').isVisible()) && memoryWarm >= 3,
      `Journey memory detail opens with warm surfaces (${memoryWarm})`,
    )
    await screenshot(page, 'journey-memory-detail')
    await page.getByRole('button', { name: 'Back', exact: true }).click()
    await page.waitForTimeout(400)

    // Challenge detail
    await clickNav(page, 'Milestones')
    await page.locator('.challenge').first().click()
    await page.waitForTimeout(500)
    const challengeWarm = await countWarmSurfaces(page)
    await record(
      'challenge-detail',
      (await page.locator('.chdetail-title').isVisible()) && challengeWarm >= 3,
      `Challenge detail opens with warm surfaces (${challengeWarm})`,
    )
    await screenshot(page, 'challenge-detail')
    await page.getByRole('button', { name: 'Back', exact: true }).click()
    await page.waitForTimeout(400)

    // Achievement detail
    await page.locator('.ach-item').first().click()
    await page.waitForTimeout(500)
    const achievementWarm = await countWarmSurfaces(page)
    await record(
      'achievement-detail',
      (await page.locator('.achdetail-title').isVisible()) && achievementWarm >= 3,
      `Achievement detail opens with warm surfaces (${achievementWarm})`,
    )
    await screenshot(page, 'achievement-detail')
    await page.getByRole('button', { name: 'Back', exact: true }).click()
    await page.waitForTimeout(400)

    // Curated plan step
    await clickNav(page, 'Plan')
    await page.getByRole('button', { name: /Curated for your dogs/i }).click()
    await page.waitForTimeout(500)
    const stepWarm = await page.locator('.curated-step-header.detail-tint--warm').isVisible()
    await record(
      'curated-plan-step',
      stepWarm && (await page.locator('.curated-step-title').isVisible()),
      'Curated plan step shows warm guided header',
    )
    await screenshot(page, 'curated-plan-step')

    await page.locator('button.curated-option').filter({ hasText: 'Burn energy' }).click()
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Continue', exact: true }).click()
    await page.waitForTimeout(400)
    await page.locator('button.curated-option').filter({ hasText: '30 min daily' }).click()
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Continue', exact: true }).click()
    await page.waitForTimeout(400)
    await page.locator('button.curated-option').filter({ hasText: 'Beaches' }).click()
    await page.waitForTimeout(200)
    await page.locator('.curated-next-btn').click()
    await page.waitForTimeout(600)

    const resultWarm = await countWarmSurfaces(page)
    await record(
      'curated-plan-result',
      (await page.locator('.curated-result-title').isVisible()) && resultWarm >= 5,
      `Curated plan result shows rich warm blocks (${resultWarm})`,
    )
    await screenshot(page, 'curated-plan-result')
    await page.getByRole('button', { name: 'Done', exact: true }).click()
    await page.waitForTimeout(400)

    // Active adventure ready + live
    await clickNav(page, 'Home')
    await page.getByRole('button', { name: '15 min', exact: true }).click()
    await page.waitForTimeout(500)
    const readyWarm = await countWarmSurfaces(page)
    await record(
      'active-adventure-ready',
      (await page.locator('.adv-ready-place').isVisible()) && readyWarm >= 2,
      `Active adventure ready shows styled pre-start state (${readyWarm})`,
    )
    await screenshot(page, 'active-adventure-ready')

    await page.getByRole('button', { name: 'Start adventure', exact: true }).click()
    await page.waitForTimeout(500)
    const liveWarm = await countWarmSurfaces(page)
    await record(
      'active-adventure-live',
      (await page.locator('.clk-time').isVisible()) && liveWarm >= 2,
      `Active adventure live screen keeps warm integration (${liveWarm})`,
    )
    await screenshot(page, 'active-adventure-live')

    const scrollWorks = await page.evaluate(() => {
      const scroll = document.querySelector('.scroll--active')
      if (!scroll) return false
      scroll.scrollTop = 120
      return scroll.scrollTop > 0
    })
    await record('active-adventure-scroll', scrollWorks, 'Active adventure scroll still works')

    await page.getByRole('button', { name: 'Finish', exact: true }).click()
    await page.waitForTimeout(800)
    const backOnShell =
      (await page.locator('.home-intro, .bnav, .plan-title').first().isVisible().catch(() => false))
    await record(
      'return-to-shell',
      backOnShell,
      'Main flow returns to app shell after finishing adventure',
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

  console.log('\n--- DETAIL VISUAL POLISH QA ---')
  console.log(JSON.stringify(report, null, 2))
  process.exit(overallPass ? 0 : 1)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
