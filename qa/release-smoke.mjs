import { chromium, devices } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE_URL = process.env.QA_BASE_URL || 'http://127.0.0.1:4173'
const OUT_DIR = process.env.QA_OUT_DIR || path.join(__dirname, 'evidence', 'release-readiness')
const results = []

function record(id, pass, detail) {
  results.push({ id, pass, detail })
  console.log(`[${pass ? 'PASS' : 'FAIL'}] ${id}: ${detail}`)
}

async function shot(page, name, fullPage = false) {
  const file = path.join(OUT_DIR, `${name}.png`)
  await page.screenshot({ path: file, fullPage })
  return file
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    ...devices['iPhone 13'],
    serviceWorkers: 'block',
    colorScheme: 'light',
  })
  const page = await context.newPage()
  const runtimeErrors = []
  page.on('pageerror', (error) => runtimeErrors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().includes('Service worker registration')) {
      runtimeErrors.push(message.text())
    }
  })

  try {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' })
    record('landing-loads', await page.locator('body').innerText().then((text) => text.includes('PawStreak')), 'Marketing landing page renders')
    await shot(page, '01-landing-mobile')
    const pushWorker = await page.request.get(`${BASE_URL}/push-sw.js`)
    const pushWorkerText = await pushWorker.text()
    record(
      'push-worker',
      pushWorker.ok() && pushWorkerText.includes("addEventListener('push'") && pushWorkerText.includes("addEventListener('notificationclick'"),
      'PWA worker includes push delivery and notification-click handling',
    )

    await page.goto(`${BASE_URL}/demo/app`, { waitUntil: 'domcontentloaded' })
    await page.evaluate(() => localStorage.clear())
    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.locator('.home-dog-pill').waitFor({ state: 'visible', timeout: 20000 })
    record('demo-home', await page.locator('.app-shell').isVisible(), 'Demo reaches the mobile app shell')
    await shot(page, '02-demo-home')

    await page.evaluate(() => {
      const key = 'pawstreak:demo'
      const state = JSON.parse(localStorage.getItem(key))
      const oversizedPortrait =
        'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%221200%22 height=%221600%22 viewBox=%220 0 1200 1600%22%3E%3Crect width=%221200%22 height=%221600%22 fill=%22%2384a96b%22/%3E%3Ccircle cx=%22600%22 cy=%22550%22 r=%22280%22 fill=%22%23f4d2a4%22/%3E%3C/svg%3E'
      state.joinedChallenges = [
        ...state.joinedChallenges.filter((item) => item.challengeId !== 'first-walk-week'),
        { challengeId: 'first-walk-week', joinedAt: '2026-07-01T12:00:00.000Z' },
      ]
      state.journeyEntries = [
        ...state.journeyEntries,
        {
          id: 'qa-neighborhood-walk-photo',
          placeId: 'neighborhood-walk',
          place: 'Neighborhood Walk',
          date: 'Jul 2, 2026',
          occurredAt: '2026-07-02T12:00:00.000Z',
          tags: ['Neighborhood'],
          photoUrls: [oversizedPortrait],
        },
      ]
      localStorage.setItem(key, JSON.stringify(state))
    })
    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.locator('.home-dog-pill').waitFor({ state: 'visible', timeout: 20000 })
    await page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('button', { name: 'Journey', exact: true })
      .click()
    await page.locator('.journey-more').getByRole('button', { name: /^Challenges/ }).click()
    await page
      .locator('.ms-challenge-card-inner', { hasText: 'First Adventure Month' })
      .click()
    const challengePhoto = page.locator('.challenge-node-photo').first()
    await challengePhoto.waitFor({ state: 'visible', timeout: 20000 })
    await challengePhoto.scrollIntoViewIfNeeded()
    const photoBox = await challengePhoto.boundingBox()
    const circleBox = await challengePhoto.locator('..').boundingBox()
    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    )
    const photoIsContained = Boolean(
      photoBox &&
        circleBox &&
        photoBox.width <= circleBox.width &&
        photoBox.height <= circleBox.height &&
        photoBox.x >= circleBox.x &&
        photoBox.y >= circleBox.y,
    )
    record(
      'challenge-photo-contained',
      photoIsContained && !hasHorizontalOverflow,
      photoBox && circleBox
        ? `Walk photo ${Math.round(photoBox.width)}×${Math.round(photoBox.height)} inside ${Math.round(circleBox.width)}×${Math.round(circleBox.height)} node; horizontal overflow: ${hasHorizontalOverflow}`
        : 'Challenge photo or milestone circle was not measurable',
    )
    await shot(page, '02b-challenge-photo-contained')

    await page.evaluate(() => {
      const key = 'pawstreak:demo'
      const state = JSON.parse(localStorage.getItem(key))
      state.activeTab = 'home'
      state.selectedChallengeId = null
      state.journeyEntries = state.journeyEntries.filter(
        (entry) => entry.id !== 'qa-neighborhood-walk-photo',
      )
      state.joinedChallenges = state.joinedChallenges.filter(
        (item) => item.challengeId !== 'first-walk-week',
      )
      localStorage.setItem(key, JSON.stringify(state))
    })
    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.locator('.home-dog-pill').waitFor({ state: 'visible', timeout: 20000 })

    for (const label of ['Explore', 'Journey', 'Pack']) {
      await page.getByRole('button', { name: label, exact: true }).click()
      await page.waitForTimeout(250)
      record(`nav-${label.toLowerCase()}`, await page.locator('.bnav').isVisible(), `${label} remains inside the mobile shell`)
      if (label === 'Explore') await shot(page, '03-demo-explore')
      if (label === 'Journey') {
        await shot(page, '03-demo-journey')
        await page.locator('.journey-memory-card:not([disabled])').first().click()
        await page.locator('.memory-hero').waitFor({ state: 'visible', timeout: 10000 })
        await page.waitForTimeout(900)
        await shot(page, '03b-demo-memory')
        await page.getByRole('button', { name: 'Back', exact: true }).click()
      }
    }
    await shot(page, '03-demo-pack')

    await page.getByRole('button', { name: 'Today', exact: true }).click()
    await page.locator('.home-dog-pill').click()
    await page.waitForTimeout(300)
    record('profile-opens', await page.locator('.profile-screen').isVisible(), 'Profile opens from Home')
    await shot(page, '04-profile')
    await page.getByRole('button', { name: 'Open settings' }).click()
    const reminderCopyVisible = await page.getByText('Daily reminders', { exact: true }).isVisible()
    record('notification-settings', reminderCopyVisible, 'Settings exposes morning and evening reminder controls')
    await shot(page, '04b-notification-settings', true)

    for (const [route, title, screenshot] of [
      ['/privacy', 'Privacy Policy', '05-privacy'],
      ['/terms', 'Terms of Service', '06-terms'],
      ['/support', 'Support', '07-support'],
      ['/delete-account', 'Delete your PawStreak account', '08-delete-account'],
    ]) {
      await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded' })
      const visible = await page.getByRole('heading', { name: title, exact: true }).isVisible()
      record(`route-${route.slice(1)}`, visible, `${title} is public and readable`)
      await shot(page, screenshot, true)
    }

    await page.goto(`${BASE_URL}/internal/feedback`, { waitUntil: 'domcontentloaded' })
    const internalText = await page.locator('body').innerText()
    record('internal-feedback-gated', /Sign in required|Access denied/.test(internalText), 'Internal feedback is not public')
    await shot(page, '09-internal-gate')

    await page.goto(`${BASE_URL}/app`, { waitUntil: 'domcontentloaded' })
    await page.getByRole('button', { name: 'Create Your Free Account', exact: true }).click()
    await page.locator('.onboarding-legal').waitFor({ state: 'visible', timeout: 20000 })
    const legalLinks = await page.locator('.onboarding-legal a').count()
    record('signup-legal-links', legalLinks === 2, 'Signup links Privacy Policy and Terms')
    await shot(page, '10-app-entry')

    record('runtime-errors', runtimeErrors.length === 0, runtimeErrors.length ? runtimeErrors.join(' | ') : 'No uncaught page errors')
  } finally {
    await browser.close()
  }

  const report = { baseUrl: BASE_URL, checkedAt: new Date().toISOString(), pass: results.every((item) => item.pass), results }
  await writeFile(path.join(OUT_DIR, 'report.json'), `${JSON.stringify(report, null, 2)}\n`)
  if (!report.pass) process.exitCode = 1
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
