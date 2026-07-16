import { chromium, devices } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const BASE_URL = process.env.QA_BASE_URL || 'http://127.0.0.1:5175'
const OUT_DIR = process.env.QA_OUT_DIR || '/tmp/pawstreak-training-energy-qa'
const results = []

function record(id, pass, message) {
  results.push({ id, pass, message })
  console.log(`[${pass ? 'PASS' : 'FAIL'}] ${id}: ${message}`)
}

await mkdir(OUT_DIR, { recursive: true })
const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ ...devices['iPhone 13'], reducedMotion: 'no-preference' })
const page = await context.newPage()

try {
  await page.goto(`${BASE_URL}/demo`, { waitUntil: 'networkidle' })
  await page.evaluate(() => {
    const raw = localStorage.getItem('pawstreak:demo')
    if (!raw) return
    const state = JSON.parse(raw)
    if (state.dogs?.[0]) state.dogs[0].photoUrl = '/sample-images/dogs-outdoors.jpg'
    state.trainingProgramFlowStep = 0
    state.selectedTrainingProgramId = null
    localStorage.setItem('pawstreak:demo', JSON.stringify(state))
  })
  await page.reload({ waitUntil: 'networkidle' })

  await page.getByRole('button', { name: 'Explore', exact: true }).click()
  await page.locator('.plan-hub-action').filter({ hasText: 'Training' }).click()
  await page.waitForSelector('.training-flow-hero--electric')
  record('adventure-hero', await page.locator('.training-flow-dog').isVisible(), 'Training adventure hero features the active dog')
  await page.screenshot({ path: path.join(OUT_DIR, '01-training-adventure.png'), fullPage: true })

  await page.getByRole('button', { name: /Fun & Enrichment/i }).click()
  record('program-pick', await page.locator('.training-flow-program.on').isVisible(), 'Selected adventure receives an electric active state')
  await page.locator('.training-flow-program.on').screenshot({ path: path.join(OUT_DIR, '02-adventure-picked.png') })
  await page.getByRole('button', { name: 'Choose this adventure', exact: true }).click()

  await page.getByRole('button', { name: /Daily/i }).click()
  await page.getByLabel('Training start date').fill('2030-06-15')
  await page.getByLabel('Training time').fill('09:30')
  await page.screenshot({ path: path.join(OUT_DIR, '03-training-rhythm.png'), fullPage: true })
  await page.getByRole('button', { name: 'Schedule my training adventure', exact: true }).click()

  await page.waitForSelector('.training-session-path')
  record('adventure-path', await page.getByText(/training adventure is ready/i).isVisible(), 'Schedule becomes a dog-specific adventure path')
  await page.screenshot({ path: path.join(OUT_DIR, '04-adventure-path.png'), fullPage: true })
  await page.getByRole('button', { name: 'Preview first session', exact: true }).click()

  await page.waitForSelector('.training-detail-intro--electric')
  record('session-detail', await page.locator('.training-lesson-card--current').isVisible(), 'Detail view clearly marks the next honest session')
  await page.screenshot({ path: path.join(OUT_DIR, '05-session-detail.png'), fullPage: true })
  await page.locator('.training-lesson-card--current .training-lesson-complete').click()

  await page.waitForSelector('.training-win-burst')
  record('victory-state', await page.getByText('SKILL UNLOCKED!').isVisible(), 'A real completion triggers the victory state')
  await page.screenshot({ path: path.join(OUT_DIR, '06-skill-unlocked.png'), fullPage: true })
} finally {
  await writeFile(path.join(OUT_DIR, 'report.json'), JSON.stringify({ testedAt: new Date().toISOString(), results }, null, 2))
  await browser.close()
}

if (results.some((result) => !result.pass)) process.exitCode = 1
