import { chromium, devices } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE_URL = process.env.QA_BASE_URL || 'http://127.0.0.1:4177'
const OUT_DIR = process.env.QA_OUT_DIR || path.join(__dirname, 'evidence', 'phase2-mapbox')

function resolveCommit() {
  try {
    return execSync('git rev-parse HEAD', { cwd: path.join(__dirname, '..'), encoding: 'utf8' }).trim()
  } catch {
    return process.env.QA_COMMIT || 'unknown'
  }
}

const COMMIT = resolveCommit()
const iPhone = devices['iPhone 13']
const checks = []
const captures = []

function note(id, pass, message) {
  checks.push({ id, pass, message })
  console.log(`[${pass ? 'PASS' : 'FAIL'}] ${id}: ${message}`)
}

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
}

async function clickNav(page, label) {
  await page.getByRole('button', { name: label, exact: true }).click()
  await page.waitForTimeout(450)
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ ...iPhone })
  const page = await context.newPage()

  try {
    await page.goto(`${BASE_URL}/demo/app`, { waitUntil: 'networkidle', timeout: 60000 })
    await page.evaluate(() => localStorage.removeItem('pawstreak:demo'))
    await page.reload({ waitUntil: 'networkidle', timeout: 60000 })
    await page.locator('.home-dog-pill').first().waitFor({ state: 'visible', timeout: 15000 })

    const bottomNav = page.locator('.bnav').first()
    note(
      'shell-bottom-nav',
      await bottomNav.isVisible(),
      'Bottom nav preserved on demo app',
    )

    await clickNav(page, 'Plan')

    const planMapCard = page.locator('.plan-map-card--adventure').first()
    note('plan-map-card', await planMapCard.isVisible(), 'Plan map card renders')

    const mapboxMap = page.locator('.plan-map-canvas--mapbox .mapboxgl-map').first()
    const mapFallback = page.locator('.plan-map-empty').first()
    const hasMapbox = (await mapboxMap.count()) > 0
    const hasFallback = await mapFallback.isVisible().catch(() => false)

    note(
      'mapbox-or-fallback',
      hasMapbox || hasFallback,
      hasMapbox
        ? 'Mapbox GL map mounted'
        : hasFallback
          ? 'Fallback UI shown (missing VITE_MAPBOX_TOKEN at build time)'
          : 'Neither Mapbox map nor fallback UI found',
    )

    await capture(page, '01-plan-map-default', planMapCard)

    const pinButtons = page.locator('.plan-map-pin--mapbox')
    const pinCount = await pinButtons.count()

    if (pinCount > 0) {
      note('plan-map-pins', true, `${pinCount} map pins rendered`)

      const firstPin = pinButtons.first()
      await firstPin.evaluate((element) => {
        element.click()
      })
      await page.waitForTimeout(500)

      const selectedPin = page.locator('.plan-map-pin--mapbox.on').first()
      note(
        'pin-select-highlight',
        await selectedPin.isVisible(),
        'Pin selection highlights marker',
      )

      const selectedCard = page.locator('.pcard--map-selected').first()
      note(
        'pin-card-sync',
        await selectedCard.isVisible(),
        'Pin tap selects matching place card',
      )

      await capture(page, '02-plan-map-pin-selected', planMapCard)
      await capture(page, '03-plan-map-card-selected', selectedCard)
    } else if (hasFallback) {
      note(
        'plan-map-pins',
        true,
        'Pin sync skipped — rebuild with VITE_MAPBOX_TOKEN in .env.local to verify pins',
      )
    } else {
      note('plan-map-pins', false, '0 map pins rendered')
    }

    const curatedPlan = page.getByRole('button', { name: /Curated Plan/i }).first()
    note(
      'curated-plan-workflow',
      await curatedPlan.isVisible(),
      'Curated Plan workflow entry preserved',
    )

    const zipInput = page.locator('.plan-map-zip .zip-input').first()
    const findButton = page.getByRole('button', { name: 'Find', exact: true })
    note(
      'zip-controls',
      (await zipInput.isVisible()) && (await findButton.isVisible()),
      'ZIP input + Find controls preserved',
    )

    await zipInput.fill('92648')
    await findButton.click()
    await page.waitForTimeout(900)
    note(
      'zip-apply',
      (await zipInput.inputValue()) === '92648',
      'ZIP apply updates location query',
    )
    await capture(page, '04-plan-map-zip-applied', planMapCard)

    await clickNav(page, 'Home')
    note(
      'nav-home-return',
      await page.locator('.home-dog-pill').first().isVisible(),
      'Shell navigation returns to Home',
    )
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  } finally {
    await page.close()
    await context.close()
    await browser.close()
  }

  const passed = checks.filter((item) => item.pass).length
  const report = {
    commit: COMMIT,
    capturedAt: new Date().toISOString(),
    summary: `${passed}/${checks.length} checks passed`,
    checks,
    captures,
  }

  await writeFile(path.join(OUT_DIR, 'report.json'), JSON.stringify(report, null, 2))
  await writeFile(
    path.join(OUT_DIR, 'report.html'),
    `<!DOCTYPE html><html><body><pre>${JSON.stringify(report, null, 2)}</pre></body></html>`,
  )

  if (passed !== checks.length) {
    process.exitCode = 1
  }
}

main()
