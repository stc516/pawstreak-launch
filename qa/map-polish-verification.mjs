import { chromium, devices } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE_URL = process.env.QA_BASE_URL || 'http://localhost:5173'
const OUT_DIR =
  process.env.QA_OUT_DIR || path.join(__dirname, 'evidence', 'map-polish-verification')

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
const captures = []
const checks = []

async function capture(page, name, locator = null) {
  const file = path.join(OUT_DIR, `${name}.png`)
  if (locator) {
    await locator.scrollIntoViewIfNeeded()
    await page.waitForTimeout(250)
    await locator.screenshot({ path: file })
  } else {
    await page.screenshot({ path: file, fullPage: true })
  }
  captures.push({ name, file })
  console.log(`Captured ${file}`)
  return file
}

async function note(id, pass, message) {
  checks.push({ id, pass, message })
  console.log(`[${pass ? 'PASS' : 'WARN'}] ${id}: ${message}`)
}

async function clickNav(page, label) {
  await page.getByRole('button', { name: label, exact: true }).click()
  await page.waitForTimeout(450)
}

async function scrollHasVisibleBar(page) {
  return page.evaluate(() => {
    const scroll = document.querySelector('.app-shell .scroll')
    if (!scroll) return { found: false, visible: false }
    const style = getComputedStyle(scroll)
    const visible =
      style.overflowY === 'scroll' &&
      scroll.scrollHeight > scroll.clientHeight + 2 &&
      scroll.offsetWidth - scroll.clientWidth > 0
    return {
      found: true,
      visible,
      overflowY: style.overflowY,
      scrollbarWidth: style.scrollbarWidth,
    }
  })
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ ...iPhone })
  const page = await context.newPage()

  try {
    // 1–3: working app via demo route (same map components as production app)
    await page.goto(`${BASE_URL}/demo/app`, { waitUntil: 'networkidle', timeout: 60000 })
    await page.evaluate(() => localStorage.removeItem('pawstreak:demo'))
    await page.reload({ waitUntil: 'networkidle', timeout: 60000 })

    await clickNav(page, 'Journey')

    const journeyMapCard = page.locator('.jmap--tap').first()
    await note(
      'journey-map-card-visible',
      await journeyMapCard.isVisible(),
      'Journey tab map card is visible',
    )
    await capture(page, '01-app-journey-map-card', journeyMapCard)

    const shellScroll = await scrollHasVisibleBar(page)
    await note(
      'journey-tab-no-scrollbar',
      shellScroll.found && !shellScroll.visible,
      shellScroll.found
        ? `Journey tab scroll overflow-y=${shellScroll.overflowY}, scrollbarWidth=${shellScroll.scrollbarWidth}, visible=${shellScroll.visible}`
        : 'App shell scroll container not found',
    )

    await journeyMapCard.click()
    await page.waitForTimeout(500)

    const mapPanel = page.locator('.jmap-overlay-panel').first()
    await note(
      'map-overlay-visible',
      await page.locator('.jmap-overlay-title').isVisible(),
      'Journey map overlay opened',
    )

    const pinCount = await page.locator('.jmap-overlay-pin').count()
    const visibleLabels = await page.locator('.jmap-overlay-pin-label').count()
    await note(
      'map-pin-density',
      pinCount >= 1,
      `${pinCount} pins, ${visibleLabels} visible labels (labels hidden until tap when crowded)`,
    )

    await capture(page, '02-app-journey-map-overlay-full', page.locator('.app-viewport').first())
    await capture(page, '02b-app-journey-map-panel', mapPanel)

    if (pinCount > 0) {
      await page.locator('.jmap-overlay-pin').first().click()
      await page.waitForTimeout(400)
      await capture(page, '02c-app-journey-map-pin-selected', mapPanel)
      const selectedLabels = await page.locator('.jmap-overlay-pin--selected .jmap-overlay-pin-label').count()
      await note(
        'selected-pin-label',
        selectedLabels >= 1,
        `Selected pin shows ${selectedLabels} label chip`,
      )
    }

    await page.getByRole('button', { name: 'Back', exact: true }).click()
    await page.waitForTimeout(400)

    await clickNav(page, 'Plan')
    const planMapCard = page.locator('.plan-map-card--adventure').first()
    const planMapbox = page.locator('.plan-map-canvas--mapbox .mapboxgl-map').first()
    const planMapFallback = page.locator('.plan-map-empty').first()
    const planMapRendered =
      (await planMapbox.count()) > 0 || (await planMapFallback.isVisible())
    await note(
      'plan-map-card-visible',
      await planMapCard.isVisible() && planMapRendered,
      (await planMapbox.count()) > 0
        ? 'Plan Mapbox map is visible'
        : 'Plan map card visible (Mapbox token fallback UI)',
    )
    await capture(page, '03-app-plan-map-card-viewport', page.locator('.app-viewport').first())
    await capture(page, '03b-app-plan-map-card', planMapCard)

    const planScroll = await scrollHasVisibleBar(page)
    await note(
      'plan-tab-no-scrollbar',
      planScroll.found && !planScroll.visible,
      planScroll.found
        ? `Plan tab scroll visible=${planScroll.visible}`
        : 'App shell scroll container not found',
    )

    // 4: landing phone mockup
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60000 })
    const landingPhone = page.locator('.landing-phone').first()
    await note('landing-phone-visible', await landingPhone.isVisible(), 'Landing phone mockup is visible')
    await capture(page, '04-landing-phone-mockup', landingPhone)
    const landingPreviewMap = page.locator('.landing-phone-preview-map').first()
    if (await landingPreviewMap.isVisible()) {
      await capture(page, '04c-landing-phone-map-preview', landingPreviewMap)
    }
    await capture(page, '04b-landing-hero-full')
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  } finally {
    await page.close()
    await context.close()
    await browser.close()
  }

  const report = {
    commit: COMMIT,
    capturedAt: new Date().toISOString(),
    captures,
    checks,
  }

  await writeFile(path.join(OUT_DIR, 'report.json'), JSON.stringify(report, null, 2))
}

main()
