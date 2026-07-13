import { chromium, devices } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const BASE_URL = process.env.QA_BASE_URL || 'http://127.0.0.1:5173'
const OUT_DIR = process.env.QA_OUT_DIR || '/tmp/pawstreak-personalized-art'
const iPhone = devices['iPhone 13']

await mkdir(OUT_DIR, { recursive: true })
const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ ...iPhone, reducedMotion: 'no-preference' })
const page = await context.newPage()
const results = []

function record(id, pass, message) {
  results.push({ id, pass, message })
  console.log(`[${pass ? 'PASS' : 'FAIL'}] ${id}: ${message}`)
}

try {
  await page.goto(`${BASE_URL}/demo`, { waitUntil: 'networkidle' })
  await page.evaluate(() => {
    const raw = localStorage.getItem('pawstreak:demo')
    if (!raw) return
    const state = JSON.parse(raw)
    if (state.dogs?.[0]) state.dogs[0].photoUrl = '/sample-images/dogs-outdoors.jpg'
    localStorage.setItem('pawstreak:demo', JSON.stringify(state))
  })
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForSelector('.home-screen')

  const homeSticker = page.locator('.home-quick-adventure .dog-adventure-sticker')
  record('home-personalized', await homeSticker.isVisible(), 'Today’s Pick features the active dog')
  record(
    'header-pack-portrait',
    await page.locator('.home-dog-pill .pack-mini-portrait').isVisible(),
    'Header uses a recognizable pack portrait instead of an initial badge',
  )
  await page.screenshot({ path: path.join(OUT_DIR, '01-home-personalized.png'), fullPage: true })

  await page.getByRole('button', { name: 'Explore', exact: true }).click()
  await page.waitForSelector('.plan-screen-header')
  record(
    'plan-personalized',
    (await page.locator('.dog-adventure-sticker').count()) >= 2,
    'Adventure choices reuse the active dog over dog-free scenes',
  )
  await page.locator('.pcard').first().click()
  await page.waitForSelector('.plan-place-detail')
  await page.locator('.plan-place-detail').scrollIntoViewIfNeeded()
  await page.locator('.plan-place-detail').screenshot({
    path: path.join(OUT_DIR, '02-plan-personalized.png'),
  })

  await page.getByRole('button', { name: 'Pack', exact: true }).click()
  await page.waitForSelector('.profile-screen')
  record(
    'profile-pack-portrait',
    await page.locator('.profile-screen-header .pack-mini-portrait').isVisible(),
    'Pack screen repeats the same recognizable portrait identity',
  )
  await page.screenshot({ path: path.join(OUT_DIR, '03-pack-portrait.png'), fullPage: true })
} finally {
  await writeFile(
    path.join(OUT_DIR, 'report.json'),
    JSON.stringify({ testedAt: new Date().toISOString(), results }, null, 2),
  )
  await browser.close()
}

if (results.some((result) => !result.pass)) process.exitCode = 1
