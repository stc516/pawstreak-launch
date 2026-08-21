import { chromium, devices } from 'playwright'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = path.resolve(__dirname, '..')
const BASE_URL = process.env.QA_BASE_URL || 'http://127.0.0.1:4173'
const OUT_DIR = process.env.QA_OUT_DIR || path.join(__dirname, 'evidence', 'beta-critical')
const results = []

function record(id, pass, detail) {
  results.push({ id, pass, detail })
  console.log(`[${pass ? 'PASS' : 'FAIL'}] ${id}: ${detail}`)
}

async function readRepoFile(relativePath) {
  return readFile(path.join(ROOT_DIR, relativePath), 'utf8')
}

function includesAll(source, snippets) {
  return snippets.every((snippet) => source.includes(snippet))
}

async function shot(page, name, fullPage = false) {
  const file = path.join(OUT_DIR, `${name}.png`)
  await page.screenshot({ path: file, fullPage })
  return file
}

async function runStaticChecks() {
  const checklist = await readRepoFile('docs/release-checklist.md')
  record(
    'checklist-current-production-surface',
    includesAll(checklist, [
      'Migrations 001–020',
      '020_push_notifications.sql',
      'push-subscriptions',
      'send-push-reminders',
      'VITE_WEB_PUSH_PUBLIC_KEY',
      'Morning reminder can be triggered and received',
      'Evening reminder can be triggered and received',
    ]),
    'Release checklist covers push migration, push functions, public key, and real push receipt checks',
  )

  const shareContent = await readRepoFile('src/lib/shareContent.ts')
  record(
    'share-image-first',
    includesAll(shareContent, [
      'const fileTextPayload: ShareData = { title, text, files }',
      'const fileOnlyPayload: ShareData = { files }',
      'Opened your share sheet with the image attached.',
      'Opened your share sheet without the image.',
    ]) && !shareContent.includes('const filePayload: ShareData = { ...sharePayload, files: input.files }'),
    'Native share tries image payloads before text/url fallback, avoiding Instagram dropping the image',
  )

  const memories = await readRepoFile('src/lib/db/memories.ts')
  record(
    'memory-photo-save-honest',
    includesAll(memories, [
      'rollbackIncompleteMemory',
      'photoPaths.length !== photos.length',
      'Could not save every attached memory photo.',
      'Could not attach memory photos.',
    ]),
    'Attached photo failures roll back incomplete server memories instead of pretending production save succeeded',
  )
}

async function runBrowserChecks() {
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
    const landingText = await page.locator('body').innerText()
    record('landing-loads', landingText.includes('PawStreak'), 'Marketing landing renders PawStreak copy')
    await shot(page, '01-landing-mobile')

    const pushWorker = await page.request.get(`${BASE_URL}/push-sw.js`)
    const pushWorkerText = await pushWorker.text()
    record(
      'push-worker-handlers',
      pushWorker.ok() && pushWorkerText.includes("addEventListener('push'") && pushWorkerText.includes("addEventListener('notificationclick'"),
      'Push service worker can receive pushes and route notification taps',
    )

    const manifest = await page.request.get(`${BASE_URL}/manifest.webmanifest`)
    const manifestJson = await manifest.json().catch(() => null)
    record(
      'manifest-installable',
      manifest.ok() &&
        Boolean(manifestJson?.name || manifestJson?.short_name) &&
        manifestJson?.start_url === '/app' &&
        ['standalone', 'fullscreen'].includes(manifestJson?.display) &&
        Array.isArray(manifestJson?.icons) &&
        manifestJson.icons.length > 0,
      'PWA manifest has name, /app start URL, standalone/fullscreen display, and icons',
    )

    await page.goto(`${BASE_URL}/app`, { waitUntil: 'domcontentloaded' })
    const appBodyText = await page.locator('body').innerText()
    const demoBadgeCount = await page.locator('.demo-pill').count()
    record(
      'app-entry-production-not-demo',
      appBodyText.includes('Create Your Free Account') && demoBadgeCount === 0,
      '/app opens production account entry, not demo mode',
    )
    await page.getByRole('button', { name: 'Create Your Free Account', exact: true }).click()
    await page.locator('.onboarding-legal').waitFor({ state: 'visible', timeout: 20000 })
    const legalLinks = await page.locator('.onboarding-legal a').count()
    record('signup-legal-links', legalLinks === 2, 'Signup links Privacy Policy and Terms')
    await shot(page, '02-app-entry')

    await page.goto(`${BASE_URL}/demo/app`, { waitUntil: 'domcontentloaded' })
    await page.evaluate(() => localStorage.clear())
    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.locator('.home-dog-pill').waitFor({ state: 'visible', timeout: 20000 })
    const navLabels = ['Today', 'Explore', 'Journey', 'Pack']
    const navVisible = await Promise.all(
      navLabels.map((label) => page.getByRole('button', { name: label, exact: true }).isVisible()),
    )
    const hasHorizontalOverflowHome = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    )
    record(
      'demo-core-nav-only',
      navVisible.every(Boolean) && !hasHorizontalOverflowHome,
      'Demo shell exposes the focused beta nav without horizontal overflow',
    )
    await shot(page, '03-demo-home')

    await page.getByRole('button', { name: 'Explore', exact: true }).click()
    await page.waitForTimeout(300)
    const exploreOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    )
    record('explore-mobile-contained', !exploreOverflow, 'Explore remains contained on iPhone viewport')
    await shot(page, '04-demo-explore')

    await page.getByRole('button', { name: 'Journey', exact: true }).click()
    await page.locator('.journey-memory-card:not([disabled])').first().click()
    await page.locator('.memory-hero').waitFor({ state: 'visible', timeout: 10000 })
    const shareButtons = await page.getByRole('button', { name: /share|story|instagram/i }).count()
    record('journey-memory-share-surface', shareButtons > 0, 'Journey memory exposes a share/story action')
    await shot(page, '05-memory-share-surface')

    await page.getByRole('button', { name: 'Back', exact: true }).click()
    await page.getByRole('button', { name: 'Today', exact: true }).click()
    await page.locator('.home-dog-pill').click()
    await page.getByRole('button', { name: 'Open settings' }).click()
    const reminderCopyVisible = await page.getByText('Daily reminders', { exact: true }).isVisible()
    record('reminder-settings-visible', reminderCopyVisible, 'Settings exposes reminder controls')
    await shot(page, '06-reminder-settings', true)

    record('runtime-errors', runtimeErrors.length === 0, runtimeErrors.length ? runtimeErrors.join(' | ') : 'No uncaught page errors')
  } finally {
    await browser.close()
  }
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  await runStaticChecks()
  await runBrowserChecks()

  const report = {
    baseUrl: BASE_URL,
    checkedAt: new Date().toISOString(),
    pass: results.every((item) => item.pass),
    results,
  }
  await writeFile(path.join(OUT_DIR, 'report.json'), `${JSON.stringify(report, null, 2)}\n`)
  if (!report.pass) process.exitCode = 1
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
