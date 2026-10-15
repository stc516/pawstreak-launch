import { chromium, devices } from 'playwright'
import { chromiumLaunchOptions } from './lib/playwrightLaunch.mjs'

const BASE_URL = process.env.QA_BASE_URL || 'http://127.0.0.1:4173'

const browser = await chromium.launch(chromiumLaunchOptions())
try {
  const context = await browser.newContext({ ...devices['iPhone 13'], serviceWorkers: 'block' })
  const page = await context.newPage()
  await page.goto(`${BASE_URL}/demo/app`, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.evaluate(() => localStorage.clear())
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.locator('.home-dog-pill').first().waitFor({ state: 'visible', timeout: 20000 })
  await page.getByRole('button', { name: 'Explore', exact: true }).click()

  const card = page.getByTestId('starter-pack-card')
  await card.waitFor({ state: 'visible' })
  const firstTitle = await card.locator('h3').innerText()
  await card.getByRole('button', { name: 'Another idea' }).click()
  const secondTitle = await card.locator('h3').innerText()
  if (firstTitle === secondTitle) throw new Error('Another idea did not rotate the starter pack.')

  for (let attempt = 0; attempt < 30; attempt += 1) {
    if (await card.getAttribute('data-idea-action') === 'custom') break
    await card.getByRole('button', { name: 'Another idea' }).click()
  }

  const selectedTitle = await card.locator('h3').innerText()
  const selectedPrompt = await card.locator('p').innerText()
  await card.getByRole('button', { name: 'Try this adventure' }).click()
  await page.getByTestId('add-adventure-flow').waitFor({ state: 'visible', timeout: 10000 })
  const draftTitle = await page.getByTestId('add-adventure-title').inputValue()
  const draftNotes = await page.getByTestId('add-adventure-notes').inputValue()
  if (draftTitle !== selectedTitle || draftNotes !== selectedPrompt) {
    throw new Error('Starter pack did not prefill the custom adventure correctly.')
  }
  console.log('[PASS] 30 Better Dog Days rotates ideas and prefills a usable adventure.')
  await context.close()
} finally {
  await browser.close()
}
