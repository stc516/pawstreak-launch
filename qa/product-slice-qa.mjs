import { chromium, devices } from 'playwright'

const BASE_URL = process.env.QA_BASE_URL || 'http://localhost:5173'
const iPhone = devices['iPhone 13']
const results = []

function record(id, pass, message) {
  results.push({ id, pass, message })
  console.log(`[${pass ? 'PASS' : 'FAIL'}] ${id}: ${message}`)
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ ...iPhone })
  const page = await context.newPage()

  let failed = false

  try {
    await page.goto(`${BASE_URL}/demo/app`, { waitUntil: 'networkidle' })
    await page.evaluate(() => localStorage.removeItem('pawstreak:demo'))
    await page.reload({ waitUntil: 'networkidle' })

    // 1. Home loads
    const homeOk = await page.getByRole('button', { name: 'Neighborhood Walk' }).isVisible()
    record('1-home', homeOk, 'Home screen with quick actions visible')
    if (!homeOk) throw new Error('Home failed')

    // 2. Neighborhood Walk starts
    await page.getByRole('button', { name: 'Neighborhood Walk' }).click()
    await page.waitForTimeout(400)
    const activeOk = await page.getByRole('button', { name: 'Finish adventure' }).isVisible()
    record('2-neighborhood-start', activeOk, 'Neighborhood Walk opens Active Adventure')
    if (!activeOk) throw new Error('Neighborhood walk failed')

    // 3. Photo upload
    const fileInput = page.locator('input.cam-input[type="file"]')
    const pngBase64 =
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
    await fileInput.setInputFiles({
      name: 'qa-moment.png',
      mimeType: 'image/png',
      buffer: Buffer.from(pngBase64, 'base64'),
    })
    await page.waitForTimeout(500)
    const photoOk = await page.locator('.rph-img').first().isVisible()
    record('3-photo', photoOk, 'Photo preview rendered after upload')
    if (!photoOk) throw new Error('Photo upload failed')

    // 4. Finish saves Journey memory
    const beforeCount = await page.evaluate(() => {
      const raw = localStorage.getItem('pawstreak:demo')
      if (!raw) return 0
      const state = JSON.parse(raw)
      return Array.isArray(state.journeyEntries) ? state.journeyEntries.length : 0
    })
    await page.getByRole('button', { name: 'Finish adventure' }).click()
    await page.waitForTimeout(700)
    const afterState = await page.evaluate(() => {
      const raw = localStorage.getItem('pawstreak:demo')
      return raw ? JSON.parse(raw) : null
    })
    const finishOk =
      afterState?.journeyEntries?.length > beforeCount &&
      afterState.journeyEntries.some((e) => e.place === 'Neighborhood Walk')
    record('4-finish', finishOk, 'Finish created Neighborhood Walk journey entry')
    if (!finishOk) throw new Error('Finish save failed')

    // 5. Journey displays saved memory
    const memoryVisible = await page
      .locator('.mcard-place')
      .filter({ hasText: 'Neighborhood Walk' })
      .first()
      .isVisible()
    record('5-journey-memory', memoryVisible, 'Journey grid shows Neighborhood Walk memory')
    if (!memoryVisible) throw new Error('Journey memory not visible')

    // 6. Journey path opens node detail
    const node = page.locator('.challenge-node').first()
    await node.click()
    await page.waitForTimeout(400)
    const nodeDetailOk = await page.locator('.challenge-node-detail--open').isVisible()
    record('6-path-node', nodeDetailOk, 'Challenge path node detail sheet opened')
    if (!nodeDetailOk) throw new Error('Node detail failed')
    await page.locator('.challenge-node-detail-close').click()
    await page.waitForTimeout(300)

    // 7. Milestones opens challenge paths
    await page.getByRole('button', { name: 'Milestones', exact: true }).click()
    await page.waitForTimeout(400)
    await page.getByRole('button', { name: 'View path' }).first().click()
    await page.waitForTimeout(400)
    const pathDetailOk = await page.locator('.challenge-path-detail-title').isVisible()
    record('7-milestones-path', pathDetailOk, 'Milestones View path opens challenge path detail')
    if (!pathDetailOk) throw new Error('Milestones path failed')
    await page.getByRole('button', { name: 'Back', exact: true }).click()
    await page.waitForTimeout(300)

    // 8. PWA mobile sizing
    const viewport = page.viewportSize()
    const sizingOk = viewport?.width === 390 && viewport?.height === 664
    record(
      '8-mobile-sizing',
      sizingOk,
      `Viewport ${viewport?.width}x${viewport?.height} (iPhone 13 profile)`,
    )

    // 9. Bottom nav not blocking content
    await page.getByRole('button', { name: 'Home', exact: true }).click()
    await page.waitForTimeout(300)
    const navBox = await page.locator('.bnav').boundingBox()
    const lastButton = page.getByRole('button', { name: 'View path' })
    await lastButton.scrollIntoViewIfNeeded()
    await page.waitForTimeout(200)
    const buttonBox = await lastButton.boundingBox()
    const navClear =
      navBox && buttonBox ? buttonBox.y + buttonBox.height <= navBox.y + 2 : false
    record(
      '9-nav-clearance',
      navClear,
      navClear
        ? 'Last home content sits above bottom nav'
        : 'Content may be obscured by bottom nav',
    )
  } catch (error) {
    failed = true
    record('overall', false, error instanceof Error ? error.message : String(error))
  }

  await browser.close()

  console.log('\n--- PRODUCT SLICE QA ---')
  console.log(JSON.stringify({ pass: !failed, results }, null, 2))
  process.exit(failed ? 1 : 0)
}

main()
