import { chromium, devices } from 'playwright'
import { copyFile, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE_URL = process.env.QA_BASE_URL || 'http://localhost:5173'
const OUT_DIR =
  process.env.QA_OUT_DIR || path.join(__dirname, 'evidence', 'demo-onboarding-launcher')

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
  <title>Demo Onboarding Launcher QA</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 24px; }
    table { border-collapse: collapse; width: 100%; margin-top: 16px; }
    th, td { border: 1px solid #ddd; padding: 8px 10px; text-align: left; }
    tr.pass td:nth-child(2) { color: #0a7a32; font-weight: 600; }
    tr.fail td:nth-child(2) { color: #b42318; font-weight: 600; }
  </style>
</head>
<body>
  <h1>Demo Onboarding Launcher QA</h1>
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
    await page.goto(`${BASE_URL}/demo/launch`, { waitUntil: 'networkidle' })
    await page.evaluate(() => localStorage.clear())
    await page.reload({ waitUntil: 'networkidle' })

    await record(
      'demo-launcher',
      await page.locator('.demo-launcher-title').isVisible(),
      '/demo/launch shows launcher screen',
    )
    await screenshot(page, '01-demo-launcher')

    await page.getByRole('button', { name: 'Open full demo' }).click()
    await page.waitForTimeout(500)
    const fullDemoHome = (await page.locator('.home-intro-title').textContent())?.includes(
      'Bailey',
    )
    await record(
      'full-demo-home',
      page.url().includes('/demo/app') && Boolean(fullDemoHome),
      'Open full demo loads Bailey + Omi app',
    )
    await screenshot(page, '02-full-demo-home')

    await page.goto(`${BASE_URL}/demo/launch`, { waitUntil: 'networkidle' })
    await page.getByRole('button', { name: 'Try onboarding' }).click()
    await page.waitForTimeout(500)
    await record(
      'demo-onboarding-start',
      page.url().includes('/demo/onboarding') &&
        (await page.getByRole('button', { name: /Get started/i }).isVisible()),
      'Try onboarding opens demo onboarding flow',
    )
    await screenshot(page, '03-demo-onboarding-start')

    await page.getByRole('button', { name: /Get started/i }).click()
    await page.getByPlaceholder('First name').fill('QA Tester')
    await page.getByPlaceholder('you@email.com').fill('qa@pawstreak.test')
    await page.getByPlaceholder('Min. 8 characters').fill('password123')
    await page.getByRole('button', { name: /Create account/i }).click()
    await page.getByPlaceholder('e.g. Luna').fill('Taco')
    await screenshot(page, '04-demo-onboarding-taco')
    await page.locator('select.field-input').first().selectOption('Mixed / Other')
    await page.locator('select.field-input').nth(1).selectOption('1–3 years')
    await page.getByRole('button', { name: /^Next$/ }).click()
    await page.getByRole('button', { name: 'Slow Sniffer' }).click()
    await page.getByRole('button', { name: 'Explorer' }).click()
    await page.getByRole('button', { name: /^Next$/ }).click()
    await page.getByRole('button', { name: /Create our world/i }).click()
    await page.getByRole('button', { name: /Start your first adventure/i }).click()
    await page.waitForTimeout(600)

    const tacoHeadline =
      (await page.locator('.home-intro-title').textContent())?.trim() || ''
    await record(
      'demo-taco-home',
      page.url().includes('/demo/app') && tacoHeadline.includes('Taco'),
      `Demo app uses Taco ("${tacoHeadline}")`,
    )
    await screenshot(page, '05-demo-taco-home')

    await record(
      'demo-feedback-visible',
      await page.locator('.demo-feedback-trigger').isVisible(),
      'Feedback button visible in demo app',
    )
    await screenshot(page, '06-demo-feedback-visible')

    await page.goto(`${BASE_URL}/demo/launch`, { waitUntil: 'networkidle' })
    await page.getByRole('button', { name: 'Reset demo' }).click()
    await page.waitForTimeout(400)
    const demoCleared = await page.evaluate(() => !localStorage.getItem('pawstreak:demo'))
    await record(
      'reset-demo',
      demoCleared && (await page.locator('.demo-launcher-title').isVisible()),
      'Reset demo clears demo state and returns to launcher',
    )

    await page.goto(`${BASE_URL}/app`, { waitUntil: 'networkidle' })
    await page.evaluate(() => {
      localStorage.setItem('pawstreak:app', JSON.stringify({ marker: 'normal-app-state' }))
    })
    await page.reload({ waitUntil: 'networkidle' })
    await record(
      'normal-root-onboarding',
      await page.getByRole('button', { name: /Get started/i }).isVisible(),
      'Production /app onboarding unaffected',
    )
    await screenshot(page, '07-normal-root-onboarding')

    const normalStateIntact = await page.evaluate(() => {
      const raw = localStorage.getItem('pawstreak:app')
      return raw?.includes('normal-app-state') ?? false
    })
    await record(
      'normal-state-separate',
      normalStateIntact,
      'Normal app state remains in pawstreak:app',
    )
  } catch (error) {
    overallPass = false
    errorMessage = error instanceof Error ? error.message : String(error)
    console.error(errorMessage)
  }

  const video = page.video()
  await page.close()
  await context.close()
  await browser.close()

  const runWebm = path.join(OUT_DIR, 'video', 'run.webm')
  if (video) {
    const videoPath = await video.path()
    await copyFile(videoPath, runWebm)
  }

  const report = {
    commit: COMMIT,
    testedAt: new Date().toISOString(),
    overallPass: overallPass && results.every((item) => item.pass),
    results,
    evidenceDir: OUT_DIR,
    videoPath: runWebm,
    error: errorMessage,
  }

  await writeFile(path.join(OUT_DIR, 'report.json'), JSON.stringify(report, null, 2))
  await writeFile(path.join(OUT_DIR, 'report.html'), buildHtmlReport(report))

  if (!report.overallPass) {
    process.exitCode = 1
  }
}

main()
