import { chromium, devices } from 'playwright'
import { copyFile, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE_URL = process.env.QA_BASE_URL || 'http://localhost:5173'
const OUT_DIR = process.env.QA_OUT_DIR || path.join(__dirname, 'evidence', 'demo-feedback')
const FEEDBACK_KEY = 'pawstreak:demo-feedback'

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
  <title>Demo Feedback QA</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 24px; }
    table { border-collapse: collapse; width: 100%; margin-top: 16px; }
    th, td { border: 1px solid #ddd; padding: 8px 10px; text-align: left; }
    tr.pass td:nth-child(2) { color: #0a7a32; font-weight: 600; }
    tr.fail td:nth-child(2) { color: #b42318; font-weight: 600; }
  </style>
</head>
<body>
  <h1>Demo Feedback QA</h1>
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
    permissions: ['clipboard-read', 'clipboard-write'],
  })
  const page = await context.newPage()

  let overallPass = true
  let errorMessage = null

  try {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' })
    await clearStorage(page, ['pawstreak:app', 'pawstreak:demo', FEEDBACK_KEY])
    await page.reload({ waitUntil: 'networkidle' })

    const rootFeedbackHidden = !(await page
      .getByRole('button', { name: 'Leave quick feedback', exact: true })
      .isVisible()
      .catch(() => false))
    await record(
      'root-no-feedback-button',
      rootFeedbackHidden,
      'Root onboarding route does not show demo feedback button',
    )
    await screenshot(page, '01-root-no-feedback')

    await page.goto(`${BASE_URL}/demo`, { waitUntil: 'networkidle' })
    await clearStorage(page, ['pawstreak:demo', FEEDBACK_KEY])
    await page.reload({ waitUntil: 'networkidle' })

    const demoFeedbackVisible = await page
      .getByRole('button', { name: 'Leave quick feedback', exact: true })
      .isVisible()
    await record(
      'demo-feedback-button-visible',
      demoFeedbackVisible,
      'Demo route shows feedback button',
    )
    await screenshot(page, '02-demo-feedback-button')

    await page.getByRole('button', { name: 'Leave quick feedback', exact: true }).click()
    await page.waitForTimeout(300)

    const overlayOpen = await page.locator('.demo-feedback-overlay.open').isVisible()
    await record('demo-feedback-overlay', overlayOpen, 'Feedback overlay opens from demo button')
    await screenshot(page, '03-demo-feedback-overlay')

    await page.locator('.demo-feedback-field textarea').nth(0).fill('Dog adventure planning')
    await page.locator('.demo-feedback-field textarea').nth(1).fill('Yes, weekly walks')
    await page.locator('.demo-feedback-field textarea').nth(2).fill('Curated plan steps')
    await page.locator('.demo-feedback-field textarea').nth(3).fill('Warm home screen copy')

    await page.getByRole('button', { name: 'Save feedback', exact: true }).click()
    await page.waitForTimeout(400)

    const savedCount = await page.evaluate((key) => {
      const raw = localStorage.getItem(key)
      if (!raw) return 0
      return JSON.parse(raw).length
    }, FEEDBACK_KEY)
    await record(
      'demo-feedback-saved-locally',
      savedCount === 1,
      `Submit saves feedback locally (${savedCount} entry)`,
    )
    await screenshot(page, '04-demo-feedback-saved')

    await page.getByRole('button', { name: 'Copy JSON', exact: true }).click()
    await page.waitForTimeout(200)

    const clipboardText = await page.evaluate(async () => {
      return navigator.clipboard.readText()
    })
    const clipboardParsed = JSON.parse(clipboardText)
    await record(
      'demo-feedback-copy-json',
      Array.isArray(clipboardParsed) &&
        clipboardParsed.length === 1 &&
        clipboardParsed[0].whatLikedMost === 'Warm home screen copy',
      'Copy JSON puts saved feedback on clipboard',
    )

    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Export JSON', exact: true }).click()
    const download = await downloadPromise
    const downloadPath = path.join(OUT_DIR, await download.suggestedFilename())
    await download.saveAs(downloadPath)

    const exported = JSON.parse(await (await import('node:fs/promises')).readFile(downloadPath, 'utf8'))
    await record(
      'demo-feedback-export-json',
      Array.isArray(exported) &&
        exported.length === 1 &&
        exported[0].whatIsItFor === 'Dog adventure planning',
      'Export JSON downloads saved feedback',
    )
    await screenshot(page, '05-demo-feedback-export')
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

  console.log('\n--- DEMO FEEDBACK QA ---')
  console.log(JSON.stringify(report, null, 2))
  process.exit(overallPass ? 0 : 1)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
