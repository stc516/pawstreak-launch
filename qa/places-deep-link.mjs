import { chromium, devices } from 'playwright'

const BASE_URL = process.env.QA_BASE_URL || 'http://127.0.0.1:4173'
const results = []

function check(id, pass, detail) {
  results.push({ id, pass, detail })
  console.log(`[${pass ? 'PASS' : 'FAIL'}] ${id}: ${detail}`)
}

async function openDeepLink(page, placeId) {
  const query = new URLSearchParams({
    place: placeId,
    action: 'plan',
    utm_source: 'pawstreak_places',
  })
  await page.goto(`${BASE_URL}/demo/app?${query}`, {
    waitUntil: 'domcontentloaded',
    timeout: 90000,
  })
  await page.locator('.plan-screen-header').waitFor({ state: 'visible', timeout: 30000 })
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    ...devices['iPhone 13'],
    serviceWorkers: 'block',
    colorScheme: 'light',
  })
  const page = await context.newPage()

  try {
    await openDeepLink(page, 'dog-beach-ocean-beach')
    const knownTitle = await page.locator('.curated-spotlight h2').innerText()
    const knownFallback = await page.locator('[data-testid="places-deep-link-fallback"]').count()
    check(
      'known-place-focused',
      /dog beach/i.test(knownTitle) && knownFallback === 0,
      `title=${knownTitle}; fallback=${knownFallback}`,
    )

    await openDeepLink(page, 'lazy-dog')
    const fallback = page.locator('[data-testid="places-deep-link-fallback"]')
    const fallbackText = await fallback.innerText()
    const addButton = fallback.getByRole('button', { name: 'Add this place', exact: true })
    check(
      'unknown-place-honest-recovery',
      (await fallback.isVisible()) &&
        fallbackText.includes('not in PawStreak') &&
        (await addButton.isVisible()),
      fallbackText.replace(/\s+/g, ' '),
    )

    await addButton.click()
    const addFlow = page.locator('[data-testid="add-adventure-flow"]')
    const addFlowHeading = addFlow.getByRole('heading', { name: 'Your own outing', exact: true })
    check(
      'unknown-place-opens-add-flow',
      (await addFlow.isVisible()) && (await addFlowHeading.isVisible()),
      'Add this place opens the existing custom-adventure flow headed “Your own outing”',
    )
  } finally {
    await browser.close()
  }

  process.exit(results.every((result) => result.pass) ? 0 : 1)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
