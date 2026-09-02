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
      'const fileSharePayloads: ShareData[] = [',
      '{ title, text: payload, files: input.files }',
      '{ title, files: input.files }',
      '{ files: input.files }',
      'Opened your share sheet with card image.',
      'const textSharePayload: ShareData = {',
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

  const shareCardPreview = await readRepoFile('src/components/share/ShareCardPreview.tsx')
  record(
    'share-card-save-to-photos',
    includesAll(shareCardPreview, [
      'const filesOnlyPayload: ShareData = { files: [file] }',
      'Choose “Save Image” to add it to Photos.',
      'Save to Photos',
    ]),
    'Share-card save action opens an image-only share sheet so iOS can save to Photos instead of only downloading to Files',
  )

  const activeAdventureScreen = await readRepoFile('src/screens/app/ActiveAdventureScreen.tsx')
  record(
    'captured-photos-save-to-phone',
    includesAll(activeAdventureScreen, [
      'handleSavePhotoToPhone',
      'const payload: ShareData = { files: [file] }',
      'captureNativeAdventurePhoto',
      'Saved to PawStreak and your phone photos.',
      'Save photo ${index + 1} to Photos',
      'Tap a photo to save it to Photos too.',
    ]),
    'Captured adventure photos expose native gallery save plus an image-only save-to-Photos fallback',
  )

  const shareCardData = await readRepoFile('src/lib/shareCardData.ts')
  record(
    'completion-card-real-photos-only',
    shareCardData.includes('const imageUrl = entry?.photoUrls?.find(Boolean)') &&
      !shareCardData.includes("from './adventureDisplayImage'"),
    'Adventure-complete share cards use real captured photos only; no-photo cards stay branded instead of showing fake destination art',
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
      pushWorker.ok() &&
        pushWorkerText.includes("addEventListener('push'") &&
        pushWorkerText.includes("addEventListener('notificationclick'"),
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
    await page.getByRole('button', { name: 'Create Your Free Account', exact: true }).waitFor({
      state: 'visible',
      timeout: 20000,
    })
    const appBodyText = await page.locator('body').innerText()
    const demoBadgeCount = await page.locator('.demo-pill').count()
    record(
      'app-entry-production-not-demo',
      appBodyText.includes('Create Your Free Account') && demoBadgeCount === 0,
      '/app opens production account entry, not demo mode',
    )
    const productionDemoLeakPatterns = [
      /Bailey/i,
      /Meiomi/i,
      /Dog Beach/i,
      /Coronado Dog Beach/i,
      /Saved today/i,
      /Pack is ready/i,
      /Beach day/i,
      /Trailblazer/i,
      /Patio pup/i,
      /Just now/i,
      /likes/i,
      /followers/i,
      /comments/i,
    ]
    const productionDemoLeakHits = productionDemoLeakPatterns.filter((pattern) => pattern.test(appBodyText))
    record(
      'app-entry-no-demo-data-leak',
      productionDemoLeakHits.length === 0,
      productionDemoLeakHits.length
        ? `/app leaked demo/fake data: ${productionDemoLeakHits.map(String).join(', ')}`
        : '/app account entry stays generic and does not leak demo dog/place/social data',
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

    await page.getByRole('button', { name: 'Quick Walk', exact: true }).click()
    await page.locator('.cbtn--save-memory').waitFor({ state: 'visible', timeout: 20000 })
    await page.locator('.cbtn--save-memory').click()
    await page.locator('.memory-hero').waitFor({ state: 'visible', timeout: 20000 })
    await page.locator('.share-preview-shell').waitFor({ state: 'visible', timeout: 20000 })
    const finishedMemoryText = await page.locator('body').innerText()
    record(
      'quick-walk-finish-save-loop',
      finishedMemoryText.includes('Open end · Saved to the Journey') &&
        finishedMemoryText.includes('Share to Instagram') &&
        finishedMemoryText.includes('Memory saved to Journey'),
      'Quick Walk can start, finish, save to Journey, and open the share-card preview',
    )
    await shot(page, '04-quick-walk-finish-save')
    await page.locator('.share-preview-close').click()
    await page.getByRole('button', { name: 'Back', exact: true }).click()
    await page.getByRole('button', { name: 'Today', exact: true }).click()

    await page.getByRole('button', { name: 'Explore', exact: true }).click()
    await page.waitForTimeout(300)
    const exploreOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    )
    record('explore-mobile-contained', !exploreOverflow, 'Explore remains contained on iPhone viewport')
    await shot(page, '05-demo-explore')

    await page.getByRole('button', { name: 'Journey', exact: true }).click()
    await page.locator('.journey-memory-card:not([disabled])').first().click()
    await page.locator('.memory-hero').waitFor({ state: 'visible', timeout: 10000 })
    const shareButtons = await page.getByRole('button', { name: /share|story|instagram/i }).count()
    record('journey-memory-share-surface', shareButtons > 0, 'Journey memory exposes a share/story action')
    await shot(page, '06-memory-share-surface')

    await page.getByRole('button', { name: 'Back', exact: true }).click()
    await page.getByRole('button', { name: 'Today', exact: true }).click()
    await page.locator('.home-dog-pill').click()
    await page.getByRole('button', { name: 'Open settings' }).click()
    const reminderCopyVisible = await page.getByText('Daily reminders', { exact: true }).isVisible()
    record('reminder-settings-visible', reminderCopyVisible, 'Settings exposes reminder controls')
    await shot(page, '07-reminder-settings', true)

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
