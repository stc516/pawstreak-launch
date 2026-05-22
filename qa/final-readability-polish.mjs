import { chromium, devices } from 'playwright'
import { copyFile, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE_URL = process.env.QA_BASE_URL || 'http://localhost:5173'
const OUT_DIR =
  process.env.QA_OUT_DIR || path.join(__dirname, 'evidence', 'final-readability-polish')

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

async function completeTacoOnboarding(page) {
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
  await page.getByRole('button', { name: /^Next$/ }).click()
  await page.getByRole('button', { name: 'Slow Sniffer' }).click()
  await page.getByRole('button', { name: 'Explorer' }).click()
  await page.getByRole('button', { name: /^Next$/ }).click()
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
  <title>Final Readability Polish QA</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 24px; }
    table { border-collapse: collapse; width: 100%; margin-top: 16px; }
    th, td { border: 1px solid #ddd; padding: 8px 10px; text-align: left; }
    tr.pass td:nth-child(2) { color: #0a7a32; font-weight: 600; }
    tr.fail td:nth-child(2) { color: #b42318; font-weight: 600; }
  </style>
</head>
<body>
  <h1>Final Readability Polish QA</h1>
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

    const introTitleColor = await page.locator('.home-intro-title').evaluate((el) =>
      getComputedStyle(el).color,
    )
    await record(
      'home-intro-readable',
      introTitleColor === 'rgb(28, 20, 16)',
      `Home intro title uses dark readable color (${introTitleColor})`,
    )
    await screenshot(page, '01-demo-home')

    await clickNav(page, 'Plan')
    await page.locator('.plan-box').scrollIntoViewIfNeeded()
    await page.waitForTimeout(250)
    const planOptionColor = await page.locator('.popt').first().evaluate((el) =>
      getComputedStyle(el).color,
    )
    const planSubColor = await page.locator('.popt-sub').first().evaluate((el) =>
      getComputedStyle(el).color,
    )
    await record(
      'plan-options-readable',
      planOptionColor === 'rgb(28, 20, 16)' && planSubColor === 'rgb(87, 83, 78)',
      `Plan options darker text (${planOptionColor}, sub ${planSubColor})`,
    )

    const feedbackBox = await page.locator('.demo-feedback-trigger').boundingBox()
    const planBox = await page.locator('.plan-box').boundingBox()
    const noOverlap =
      feedbackBox && planBox ? feedbackBox.y >= planBox.y + planBox.height - 8 : true
    await record(
      'feedback-pill-clear',
      noOverlap,
      'Feedback pill does not overlap monthly plan cards',
    )
    await screenshot(page, '02-demo-plan')

    await clickNav(page, 'Journey')
    const journeyImages = await page.locator('.mcard-img').evaluateAll((nodes) =>
      nodes.map((node) => getComputedStyle(node).backgroundImage),
    )
    await record(
      'journey-distinct-images',
      journeyImages.length >= 2 &&
        journeyImages[0] !== journeyImages[1] &&
        !journeyImages[0]?.includes('dogs-outdoors'),
      `Journey memories use distinct images (${journeyImages.join(' | ')})`,
    )
    await screenshot(page, '03-demo-journey')

    await clickNav(page, 'Milestones')
    const doneTitleWeight = await page.locator('.ach-item.done .ach-title').evaluate((el) =>
      getComputedStyle(el).fontWeight,
    )
    await record(
      'achievements-readable',
      Number(doneTitleWeight) >= 600,
      `Achievement done title weight (${doneTitleWeight})`,
    )
    await screenshot(page, '04-demo-milestones')

    await completeTacoOnboarding(page)
    const tacoHeadline =
      (await page.locator('.home-intro-title').textContent())?.trim() || ''
    await record(
      'taco-onboarding',
      tacoHeadline.includes('Taco'),
      `Taco onboarding Home readable ("${tacoHeadline}")`,
    )
    await screenshot(page, '05-taco-home')
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
