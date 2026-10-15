import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { chromiumLaunchOptions } from './lib/playwrightLaunch.mjs'

const BASE_URL = process.env.QA_BASE_URL || 'http://127.0.0.1:4173'
const OUT_DIR = process.env.QA_OUT_DIR || 'artifacts/store-screenshots'
const formats = [
  { id: 'apple-iphone-6.7', viewport: { width: 430, height: 932 }, deviceScaleFactor: 3, expected: '1290x2796' },
  { id: 'google-phone', viewport: { width: 360, height: 640 }, deviceScaleFactor: 3, expected: '1080x1920' },
]

async function settle(page) {
  await page.waitForTimeout(700)
  await page.evaluate(() => window.scrollTo(0, 0))
}

async function capture(page, directory, name, label, manifest, resetScroll = true) {
  if (resetScroll) await settle(page)
  else await page.waitForTimeout(500)
  const file = path.join(directory, `${name}.png`)
  await page.screenshot({ path: file, fullPage: false, animations: 'disabled' })
  manifest.push({ name, label, file })
  console.log(`[CAPTURED] ${label}: ${file}`)
}

async function openDemo(page) {
  await page.goto(`${BASE_URL}/demo/app`, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.evaluate(() => localStorage.clear())
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.locator('.home-dog-pill').first().waitFor({ state: 'visible', timeout: 20000 })
}

async function captureFormat(browser, format) {
  const directory = path.join(OUT_DIR, format.id)
  await mkdir(directory, { recursive: true })
  const context = await browser.newContext({
    viewport: format.viewport,
    screen: format.viewport,
    deviceScaleFactor: format.deviceScaleFactor,
    isMobile: true,
    hasTouch: true,
    serviceWorkers: 'block',
    colorScheme: 'light',
  })
  const page = await context.newPage()
  const screenshots = []

  try {
    await openDemo(page)
    await capture(page, directory, '01-today', 'Today — one clear next adventure', screenshots)

    await page.getByRole('button', { name: 'Explore', exact: true }).click()
    await capture(page, directory, '02-explore', 'Explore — useful dog-friendly ideas', screenshots)

    await page.locator('[data-testid="starter-pack-card"]').scrollIntoViewIfNeeded()
    await capture(page, directory, '03-starter-pack', '30 Better Dog Days — free starter pack', screenshots, false)

    await page.getByRole('button', { name: 'Journey', exact: true }).click()
    await capture(page, directory, '04-journey', 'Journey — adventures worth remembering', screenshots)

    const memory = page.locator('.journey-memory-card:not([disabled])').first()
    if (await memory.isVisible()) {
      await memory.click()
      await page.locator('.memory-hero').waitFor({ state: 'visible', timeout: 10000 })
      await capture(page, directory, '05-memory', 'Memory — the emotional payoff', screenshots)
      await page.getByRole('button', { name: 'Back', exact: true }).click()
    }

    await page.getByRole('button', { name: 'Pack', exact: true }).click()
    await capture(page, directory, '06-pack', 'Pack — dog profiles and progress', screenshots)

    await page.getByRole('button', { name: 'Today', exact: true }).click()
    await page.locator('.home-dog-pill').click()
    await page.getByRole('button', { name: 'Open settings' }).click()
    await capture(page, directory, '07-settings', 'Settings — privacy and optional reminders', screenshots)
  } finally {
    await context.close()
  }

  return { ...format, screenshots }
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  const browser = await chromium.launch(chromiumLaunchOptions())
  try {
    const results = []
    for (const format of formats) results.push(await captureFormat(browser, format))
    const manifest = {
      generatedAt: new Date().toISOString(),
      baseUrl: BASE_URL,
      note: 'Review every image against the release candidate before uploading. Demo content must not be presented as real user activity.',
      formats: results,
    }
    await writeFile(path.join(OUT_DIR, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
    await writeFile(
      path.join(OUT_DIR, 'README.md'),
      '# PawStreak store screenshot package\n\nGenerated from `/demo/app` for layout review. Review copy, data accuracy, permissions, and final production behavior before uploading these images to either store. Screenshot ordering and captions are recorded in `manifest.json`.\n',
    )
  } finally {
    await browser.close()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
