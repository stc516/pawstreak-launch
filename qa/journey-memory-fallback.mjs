import { chromium, devices } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const BASE_URL = process.env.QA_BASE_URL || 'http://127.0.0.1:5173'
const OUT_DIR = process.env.QA_OUT_DIR || path.resolve('qa/evidence/journey-memory-fallback')
const results = []

function record(id, pass, detail) {
  results.push({ id, pass, detail })
  console.log(`[${pass ? 'PASS' : 'FAIL'}] ${id}: ${detail}`)
}

await mkdir(OUT_DIR, { recursive: true })
const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({
  ...devices['iPhone 13'],
  serviceWorkers: 'block',
  reducedMotion: 'no-preference',
})
const page = await context.newPage()
const runtimeErrors = []
page.on('pageerror', (error) => runtimeErrors.push(error.message))

try {
  await page.goto(`${BASE_URL}/demo/app`, { waitUntil: 'networkidle' })
  await page.evaluate(() => localStorage.removeItem('pawstreak:demo'))
  await page.reload({ waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Journey', exact: true }).click()

  const fallbackCards = page.locator(
    '.journey-memory-node:not(.journey-memory-node--preview) .journey-memory-no-photo',
  )
  await fallbackCards.first().waitFor({ state: 'visible' })
  await page.waitForTimeout(700)

  const fallbackCount = await fallbackCards.count()
  const destinationCardCount = await page.locator(
    '.journey-memory-node:not(.journey-memory-node--preview) .journey-memory-card',
  ).count()
  record(
    'all-no-photo-memories-render',
    fallbackCount > 0 && fallbackCount === destinationCardCount,
    `${fallbackCount} of ${destinationCardCount} destination memories use the designed fallback`,
  )

  const themes = ['coast', 'trail', 'road', 'park', 'patio']
  const themeCounts = Object.fromEntries(
    await Promise.all(
      themes.map(async (theme) => [
        theme,
        await page.locator(`.journey-memory-no-photo--${theme}`).count(),
      ]),
    ),
  )
  record(
    'entry-aware-themes',
    themes.every((theme) => themeCounts[theme] > 0),
    `Real entry metadata resolves coast/trail/road/park/patio themes: ${JSON.stringify(themeCounts)}`,
  )

  const firstFallback = fallbackCards.first()
  const visualStyle = await firstFallback.evaluate((element) => {
    const style = getComputedStyle(element)
    const rect = element.getBoundingClientRect()
    return {
      backgroundImage: style.backgroundImage,
      height: Math.round(rect.height),
      width: Math.round(rect.width),
      overflow: style.overflow,
    }
  })
  record(
    'not-flat-placeholder',
    visualStyle.backgroundImage.includes('gradient') && visualStyle.height < 180,
    `Rendered ${visualStyle.width}×${visualStyle.height} with layered gradient scenery`,
  )

  const accessibleFallbacks = page.getByLabel('Memory saved · no photo added')
  record(
    'honest-accessible-label',
    (await accessibleFallbacks.count()) === fallbackCount,
    'Every scenic fallback still identifies itself as a memory with no photo',
  )

  await page.screenshot({
    path: path.join(OUT_DIR, '02-after-journey.png'),
  })
  await page.locator('.journey-memory-track').screenshot({
    path: path.join(OUT_DIR, '03-after-memory-track.png'),
  })

  await page.locator('.journey-memory-card').first().click()
  const backButton = page.getByRole('button', { name: 'Back', exact: true })
  await backButton.waitFor({ state: 'visible' })
  record(
    'memory-card-opens-detail',
    await page.getByText('No camera. Still a story.', { exact: true }).isVisible(),
    'The visual fallback remains a working entry point to the saved memory detail',
  )
  await page.screenshot({
    path: path.join(OUT_DIR, '04-memory-detail.png'),
  })

  await backButton.click()
  await page.getByRole('button', { name: 'Journey', exact: true }).waitFor({ state: 'visible' })
  record('navigation-preserved', true, 'Back returns to the existing Journey navigation shell')

  record(
    'runtime-errors',
    runtimeErrors.length === 0,
    runtimeErrors.length ? runtimeErrors.join(' | ') : 'No uncaught page errors',
  )
} catch (error) {
  record('test-run', false, error instanceof Error ? error.message : String(error))
  await page.screenshot({ path: path.join(OUT_DIR, '99-failure.png') }).catch(() => {})
} finally {
  const report = {
    baseUrl: BASE_URL,
    checkedAt: new Date().toISOString(),
    pass: results.every((result) => result.pass),
    results,
  }
  await writeFile(path.join(OUT_DIR, 'report.json'), `${JSON.stringify(report, null, 2)}\n`)
  await browser.close()
  if (!report.pass) process.exitCode = 1
}
