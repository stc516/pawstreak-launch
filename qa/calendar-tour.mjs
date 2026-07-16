import { chromium, devices } from 'playwright'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const BASE_URL = process.env.QA_BASE_URL || 'http://127.0.0.1:5175'
const OUT_DIR = process.env.QA_OUT_DIR || '/tmp/pawstreak-calendar-tour-qa'
const results = []

function record(id, pass, detail) {
  results.push({ id, pass, detail })
  console.log(`[${pass ? 'PASS' : 'FAIL'}] ${id}: ${detail}`)
}

await mkdir(OUT_DIR, { recursive: true })
const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ ...devices['iPhone 13'], serviceWorkers: 'block' })
const page = await context.newPage()

try {
  await page.goto(`${BASE_URL}/demo/app`, { waitUntil: 'networkidle' })
  await page.evaluate(() => localStorage.removeItem('pawstreak:demo'))
  await page.reload({ waitUntil: 'networkidle' })

  await page.getByRole('button', { name: 'Explore', exact: true }).click()
  await page.getByRole('button', { name: /Add Your Own/i }).click()
  await page.locator('[data-testid="add-adventure-title"]').fill('Camping with Bailey')
  const saveWithoutDate = page.locator('[data-testid="add-adventure-save-later"]')
  record(
    'calendar-optional',
    !(await saveWithoutDate.isDisabled()) && (await saveWithoutDate.innerText()).includes('Save for later'),
    'An adventure can be saved without granting calendar access or choosing a date.',
  )
  await saveWithoutDate.click()
  const unscheduledCard = page.locator('.journey-planned-card').filter({ hasText: 'Camping with Bailey' })
  record(
    'unscheduled-has-no-fake-calendar',
    (await unscheduledCard.count()) === 1 && (await unscheduledCard.getByRole('button', { name: /Calendar/i }).count()) === 0,
    'Unscheduled adventures show no invented date or calendar action.',
  )

  await page.getByRole('button', { name: /Add Your Own/i }).click()
  await page.locator('[data-testid="add-adventure-title"]').fill('Sunrise trail')
  await page.locator('[data-testid="add-adventure-scheduled-for"]').fill('2030-06-15T09:30')
  await page.locator('[data-testid="add-adventure-save-later"]').click()
  const scheduledCard = page.locator('.journey-planned-card').filter({ hasText: 'Sunrise trail' })
  const downloadPromise = page.waitForEvent('download')
  await scheduledCard.getByRole('button', { name: /Calendar/i }).click()
  const download = await downloadPromise
  const calendarPath = await download.path()
  const calendarText = calendarPath ? await readFile(calendarPath, 'utf8') : ''
  record(
    'real-calendar-file',
    calendarText.includes('SUMMARY:PawStreak: Sunrise trail') && (calendarText.match(/BEGIN:VALARM/g) || []).length === 2,
    `summary=${calendarText.includes('SUMMARY:PawStreak: Sunrise trail')} alarms=${(calendarText.match(/BEGIN:VALARM/g) || []).length} bytes=${calendarText.length}`,
  )

  await page.screenshot({ path: path.join(OUT_DIR, '01-optional-calendar.png'), fullPage: true })

  const tourContext = await browser.newContext({ ...devices['iPhone 13'], serviceWorkers: 'block' })
  const tour = await tourContext.newPage()
  await tour.goto(`${BASE_URL}/demo/app?tour=1`, { waitUntil: 'networkidle' })
  await tour.locator('[data-testid="product-tour"]').waitFor({ state: 'visible' })
  const tabs = ['Today', 'Explore', 'Today', 'Journey', 'Explore', 'Pack']
  let tourPass = true
  const tourDetails = []
  for (let index = 0; index < tabs.length; index += 1) {
    const counterVisible = await tour.getByText(`${index + 1} / 6`, { exact: true }).isVisible()
    const current = await tour.locator('.bnav').getByRole('button', { name: tabs[index], exact: true }).getAttribute('aria-current')
    tourDetails.push(`${index + 1}:${tabs[index]} counter=${counterVisible} current=${current}`)
    tourPass = tourPass && counterVisible && current === 'page'
    await tour.getByRole('button', { name: index === tabs.length - 1 ? /Let's adventure/i : 'Show me' }).click()
  }
  record(
    'six-step-tour',
    tourPass && (await tour.locator('[data-testid="product-tour"]').count()) === 0,
    tourDetails.join(' | '),
  )
  await tourContext.close()
} finally {
  await writeFile(path.join(OUT_DIR, 'report.json'), JSON.stringify({ testedAt: new Date().toISOString(), results }, null, 2))
  await browser.close()
}

if (results.some((result) => !result.pass)) process.exitCode = 1
