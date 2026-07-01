import { chromium, devices } from 'playwright'
import { copyFile, mkdir, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE_URL = process.env.QA_BASE_URL || 'http://localhost:5173'
const OUT_DIR = process.env.QA_OUT_DIR || path.join(__dirname, 'evidence', 'landing-page')
const QA_SLOW_MO = Number(process.env.QA_SLOW_MO ?? 250)
const QA_STEP_PAUSE_MS = Number(process.env.QA_STEP_PAUSE_MS ?? 1200)

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

const SCREENSHOTS = [
  { name: '01-home', label: 'Landing hero' },
  { name: '02-profile', label: 'App preview section' },
  { name: '03-invite-flow', label: 'Signup CTA section' },
]

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

async function fileOk(filePath) {
  try {
    const info = await stat(filePath)
    return info.size > 0
  } catch {
    return false
  }
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
  <title>Landing Page QA</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 24px; }
    table { border-collapse: collapse; width: 100%; margin-top: 16px; }
    th, td { border: 1px solid #ddd; padding: 8px 10px; text-align: left; }
    tr.pass td:nth-child(2) { color: #0a7a32; font-weight: 600; }
    tr.fail td:nth-child(2) { color: #b42318; font-weight: 600; }
  </style>
</head>
<body>
  <h1>Landing Page QA</h1>
  <p><strong>Commit:</strong> ${report.commit}</p>
  <p><strong>Verified:</strong> ${report.verifiedPass ? 'PASS' : 'FAIL'}</p>
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

  const browser = await chromium.launch({ headless: true, slowMo: QA_SLOW_MO })
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
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(QA_STEP_PAUSE_MS)

    await record(
      'landing-hero',
      await page.locator('.landing-headline').isVisible(),
      'Landing page hero renders at /',
    )
    const headline = (await page.locator('.landing-headline').textContent())?.trim() || ''
    await record(
      'landing-headline-copy',
      headline.includes('More adventures'),
      `Hero headline present ("${headline.slice(0, 40)}…")`,
    )
    await screenshot(page, '01-home')

    const scrollWorks = await page.evaluate(async () => {
      const root = document.documentElement
      root.scrollTop = 0
      await new Promise((resolve) => setTimeout(resolve, 120))
      const before = root.scrollTop
      root.scrollTop = before + 420
      await new Promise((resolve) => setTimeout(resolve, 120))
      const canScroll = root.scrollHeight > window.innerHeight + 8
      return {
        ok: canScroll && root.scrollTop > before + 100,
        canScroll,
        before,
        after: root.scrollTop,
        scrollHeight: root.scrollHeight,
        innerHeight: window.innerHeight,
      }
    })
    await record(
      'landing-scroll',
      scrollWorks.ok,
      `Landing scroll works (overflow: ${scrollWorks.canScroll}, ${scrollWorks.before} -> ${scrollWorks.after})`,
    )

    await page.evaluate(() => {
      document.querySelector('.landing-features')?.scrollIntoView({ behavior: 'instant', block: 'start' })
    })
    await page.waitForTimeout(QA_STEP_PAUSE_MS)
    await record(
      'landing-preview',
      await page.locator('.landing-features-grid').isVisible(),
      'Core feature section visible',
    )
    await screenshot(page, '02-profile')

    await page.evaluate(() => {
      document.querySelector('#signup')?.scrollIntoView({ behavior: 'instant', block: 'start' })
    })
    await page.waitForTimeout(QA_STEP_PAUSE_MS)
    await record(
      'landing-signup-cta',
      await page.locator('.landing-signup-actions').isVisible(),
      'Live signup CTA section visible',
    )

    await screenshot(page, '03-invite-flow')

    await page.getByRole('button', { name: 'Start Your First Adventure', exact: true }).first().click()
    await page.getByRole('button', { name: /Create Your Free Account/i }).waitFor({ timeout: 8000 })
    await record(
      'start-cta-nav',
      page.url().includes('/app') &&
        (await page.getByRole('button', { name: /Create Your Free Account/i }).isVisible()),
      'Start Your First Adventure navigates to /app onboarding',
    )

    await page.goto(`${BASE_URL}/start`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(QA_STEP_PAUSE_MS)
    await page.getByRole('button', { name: 'Create Your Free Account', exact: true }).first().click()
    await page.getByRole('button', { name: /Create Your Free Account/i }).waitFor({ timeout: 8000 })
    await record(
      'start-continue-app',
      page.url().includes('/app') &&
        (await page.getByRole('button', { name: /Create Your Free Account/i }).isVisible()),
      'Create Your Free Account navigates to /app',
    )
  } catch (error) {
    overallPass = false
    errorMessage = error instanceof Error ? error.message : String(error)
    await screenshot(page, '99-failure').catch(() => {})
    console.error(errorMessage)
  }

  const video = page.video()
  await page.close()
  await context.close()
  await browser.close()

  const runWebm = path.join(OUT_DIR, 'video', 'test-run.webm')
  if (video) {
    const videoPath = await video.path()
    await copyFile(videoPath, runWebm)
  }

  const testsPassed = results.every((row) => row.pass)
  const screenshotsOk = (
    await Promise.all(SCREENSHOTS.map((shot) => fileOk(path.join(OUT_DIR, `${shot.name}.png`))))
  ).every(Boolean)
  const videoOk = await fileOk(runWebm)
  const verifiedPass = overallPass && testsPassed && screenshotsOk && videoOk

  const report = {
    commit: COMMIT,
    testedAt: new Date().toISOString(),
    overallPass,
    verifiedPass,
    errorMessage,
    evidenceDir: OUT_DIR,
    videoPath: runWebm,
    results,
  }

  await writeFile(path.join(OUT_DIR, 'report.json'), JSON.stringify(report, null, 2))
  await writeFile(path.join(OUT_DIR, 'report.html'), buildHtmlReport(report))

  console.log('\n--- LANDING PAGE QA ---')
  console.log(JSON.stringify(report, null, 2))
  process.exit(verifiedPass ? 0 : 1)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
