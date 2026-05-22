import { chromium, devices } from 'playwright'
import { copyFile, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE_URL = process.env.QA_BASE_URL || 'http://localhost:5173'
const DEMO_APP_URL = `${BASE_URL}/demo/app`
const OUT_DIR =
  process.env.QA_OUT_DIR || path.join(__dirname, 'evidence', 'community-journey-final-polish')

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
  <title>Community Journey Final Polish QA</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 24px; }
    table { border-collapse: collapse; width: 100%; margin-top: 16px; }
    th, td { border: 1px solid #ddd; padding: 8px 10px; text-align: left; }
    tr.pass td:nth-child(2) { color: #0a7a32; font-weight: 600; }
    tr.fail td:nth-child(2) { color: #b42318; font-weight: 600; }
  </style>
</head>
<body>
  <h1>Community Journey Final Polish QA</h1>
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
    await record('demo-app-loads', page.url().includes('/demo/app'), 'Demo app route loads')

    await page.evaluate(() => localStorage.removeItem('pawstreak:demo'))
    await page.reload({ waitUntil: 'networkidle', timeout: 60000 })

    await clickNav(page, 'Community')

    const topGrid = await page.locator('.comm-top-grid').isVisible()
    const nowCount = await page.locator('.comm-top-now-count').textContent()
    const postTile = await page.locator('.comm-top-post').isVisible()
    const legacyPostBtn = await page.locator('.comm-post-btn').count()
    await record(
      'community-top-layout',
      topGrid && nowCount?.includes('247') && postTile && legacyPostBtn === 0,
      'Community top grid shows live stats and compose tile without redundant button',
    )
    await screenshot(page, '01-community-top-layout')

    const quickShare = await page.locator('.comm-quick-share-card').isVisible()
    await record(
      'community-quick-share',
      quickShare,
      'Quick share card is visible above the feed',
    )
    await screenshot(page, '02-community-quick-share')

    const feedCards = await page.locator('.comm-post').count()
    const imageHeight = await page.locator('.comm-post .cp-img').first().evaluate((el) => el.getBoundingClientRect().height)
    await record(
      'community-feed-visible',
      feedCards >= 4 && imageHeight >= 140,
      `Community feed shows ${feedCards} cards with ~${Math.round(imageHeight)}px images`,
    )
    await screenshot(page, '03-community-feed-visible')

    await page.locator('.comm-quick-share-input').fill('Park picnic with the pack — best lazy afternoon.')
    await page.locator('.comm-quick-share-btn').click()
    await page.waitForTimeout(500)

    const newCaption = await page.locator('.comm-post .cp-caption').first().textContent()
    await record(
      'community-quick-share-post',
      newCaption?.includes('Park picnic with the pack'),
      'Quick share prepends a new post to the feed',
    )
    await screenshot(page, '04-community-new-post')

    await page.locator('.comm-top-post').click()
    await page.waitForTimeout(500)
    const composeOpen = await page.locator('.comm-compose-title').isVisible()
    await record(
      'community-compose-cta',
      composeOpen,
      'Post to community tile opens compose overlay',
    )
    await page.locator('.overlay-back').click()
    await page.waitForTimeout(400)

    await clickNav(page, 'Journey')

    const gridCards = await page.locator('.journey-grid .mcard--grid').count()
    const cardHeight = await page.locator('.journey-grid .mcard--grid').first().evaluate((el) => el.getBoundingClientRect().height)
    await record(
      'journey-grid-cards',
      gridCards >= 3 && cardHeight >= 150,
      `Journey grid shows ${gridCards} modular cards (~${Math.round(cardHeight)}px tall)`,
    )
    await screenshot(page, '05-journey-grid-all')

    await page.getByRole('button', { name: 'Beach', exact: true }).click()
    await page.waitForTimeout(400)
    const beachCards = await page.locator('.journey-grid .mcard--grid').count()
    await record(
      'journey-filter-beach',
      beachCards >= 1,
      `Beach filter shows ${beachCards} cards`,
    )
    await screenshot(page, '06-journey-filter-beach')

    await page.getByRole('button', { name: 'Map view', exact: true }).click()
    await page.waitForTimeout(500)
    const mapOpen = await page.locator('.jmap-overlay-title').isVisible()
    await record('journey-map-opens', mapOpen, 'Map view filter opens journey map overlay')
    await screenshot(page, '07-journey-map-visible')

    const statValues = await page.locator('.jmap-overlay-stat-value').allTextContents()
    await record(
      'journey-map-stats',
      statValues.includes('47') && statValues.includes('22'),
      `Map stats show ${statValues.join(' / ')}`,
    )

    await page.locator('#pin-torrey').click()
    await page.waitForTimeout(400)
    const previewVisible = await page.locator('.jmap-pin-preview').isVisible()
    await record(
      'journey-map-pin-preview',
      previewVisible,
      'Selecting a pin shows a memory preview card',
    )
    await screenshot(page, '08-journey-map-pin-preview')

    await page.locator('.jmap-pin-preview-cta').click()
    await page.waitForTimeout(500)
    const memoryOpen = await page.locator('.memory-hero').isVisible()
    await record('journey-memory-opens', memoryOpen, 'Open memory launches JourneyMemoryView')
    await screenshot(page, '09-journey-memory-detail')

    await page.locator('.overlay-back').click()
    await page.waitForTimeout(400)
    await clickNav(page, 'Home')
    await clickNav(page, 'Plan')
    await record(
      'bottom-nav-works',
      await page.locator('.bnav').isVisible(),
      'Bottom nav remains usable after map and memory flows',
    )
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
