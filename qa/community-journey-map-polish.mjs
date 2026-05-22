import { chromium, devices } from 'playwright'
import { copyFile, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE_URL = process.env.QA_BASE_URL || 'http://localhost:5173'
const DEMO_APP_URL = `${BASE_URL}/demo/app`
const OUT_DIR =
  process.env.QA_OUT_DIR || path.join(__dirname, 'evidence', 'community-journey-map-polish')

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
  <title>Community Journey Map Polish QA</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 24px; }
    table { border-collapse: collapse; width: 100%; margin-top: 16px; }
    th, td { border: 1px solid #ddd; padding: 8px 10px; text-align: left; }
    tr.pass td:nth-child(2) { color: #0a7a32; font-weight: 600; }
    tr.fail td:nth-child(2) { color: #b42318; font-weight: 600; }
  </style>
</head>
<body>
  <h1>Community Journey Map Polish QA</h1>
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
    await page.goto(DEMO_APP_URL, { waitUntil: 'networkidle', timeout: 60000 })
    await page.evaluate(() => localStorage.removeItem('pawstreak:demo'))
    await page.reload({ waitUntil: 'networkidle', timeout: 60000 })

    await clickNav(page, 'Community')

    const firstPostCaption = await page.locator('.comm-post .cp-caption').first().textContent()
    const firstPostAuthor = await page.locator('.comm-post .cp-name').first().textContent()
    const compactTiles = await page.locator('.comm-live-tiles .comm-live-tile').count()
    await record(
      'community-feed-visible',
      Boolean(firstPostCaption?.trim()) &&
        Boolean(firstPostAuthor?.trim()) &&
        compactTiles === 2,
      'Community feed shows author, caption, and compact live tiles',
    )
    await screenshot(page, '01-community-feed-visible')

    const quickShareVisible = await page.locator('.comm-quick-share-input').isVisible()
    await record(
      'community-quick-share',
      quickShareVisible,
      'Quick share composer is visible under Community header',
    )
    await screenshot(page, '02-community-quick-share')

    await page.locator('.comm-quick-share-input').fill('Sunset walk at Dog Beach — best evening yet.')
    await page.locator('.comm-quick-share-btn').click()
    await page.waitForTimeout(500)

    const newPostCaption = await page.locator('.comm-post .cp-caption').first().textContent()
    await record(
      'community-new-post',
      newPostCaption?.includes('Sunset walk at Dog Beach'),
      'Quick share adds a new post at the top of the feed',
    )
    await screenshot(page, '03-community-new-post')

    await page.waitForTimeout(3500)

    await page
      .locator('.comm-post')
      .first()
      .locator('button.cpa')
      .first()
      .dispatchEvent('click')
    await page.waitForTimeout(300)
    await record(
      'community-like',
      await page.locator('.comm-post').first().locator('.cpa--liked').isVisible(),
      'Like interaction still works on community posts',
    )

    await clickNav(page, 'Journey')

    const allCards = await page.locator('.mcard').count()
    await record(
      'journey-all-filled',
      allCards >= 3,
      `Journey All shows ${allCards} memory cards`,
    )
    await screenshot(page, '04-journey-all-filled')

    await page.getByRole('button', { name: 'Beach', exact: true }).click()
    await page.waitForTimeout(400)
    const beachCards = await page.locator('.mcard').count()
    await record(
      'journey-filter-beach',
      beachCards >= 1,
      `Beach filter shows ${beachCards} beach memories`,
    )
    await screenshot(page, '05-journey-filter-beach')

    await page.getByRole('button', { name: 'Road trips', exact: true }).click()
    await page.waitForTimeout(400)
    const roadCards = await page.locator('.mcard').count()
    const emptyState = await page.locator('.journey-empty').isVisible()
    await record(
      'journey-filter-roadtrip-or-empty',
      roadCards >= 1 || emptyState,
      roadCards >= 1
        ? `Road trips filter shows ${roadCards} memories`
        : 'Road trips filter shows warm empty state',
    )
    await screenshot(page, '06-journey-filter-roadtrip-or-empty')

    await page.locator('.jmap--tap').click()
    await page.waitForTimeout(500)

    const statValues = await page.locator('.jmap-overlay-stat-value').allTextContents()
    await record(
      'journey-map-stats',
      statValues.includes('47') && statValues.includes('22'),
      `Map overlay stats show ${statValues.join(' / ')} (expected 47 / 22)`,
    )
    await screenshot(page, '07-journey-map-fixed-stats')

    await page.locator('#pin-torrey').click()
    await page.waitForTimeout(600)

    const memoryOpen = await page.locator('.memory-hero, .overlay-topbar').first().isVisible()
    await record(
      'journey-map-pin-detail',
      memoryOpen,
      'Torrey Pines pin opens memory detail overlay',
    )
    await screenshot(page, '08-journey-map-pin-detail')
  } catch (error) {
    overallPass = false
    errorMessage = error instanceof Error ? error.message : String(error)
    console.error(errorMessage)
  } finally {
    const video = page.video()
    await page.close()
    await context.close()
    await browser.close()

    if (video) {
      const webmPath = await video.path()
      await copyFile(webmPath, path.join(OUT_DIR, 'video', 'run.webm'))
    }
  }

  const report = {
    commit: COMMIT,
    overallPass: overallPass && results.every((item) => item.pass),
    results,
    error: errorMessage,
  }

  await writeFile(path.join(OUT_DIR, 'report.json'), JSON.stringify(report, null, 2))
  await writeFile(path.join(OUT_DIR, 'report.html'), buildHtmlReport(report))

  if (!report.overallPass) {
    process.exitCode = 1
  }
}

main()
