import { chromium } from 'playwright'
import { copyFile, mkdir, readFile, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = __dirname
const SCREENSHOTS_DIR = path.join(ROOT, 'screenshots')
const STORIES_DIR = path.join(ROOT, 'stories')
const VIDEOS_DIR = path.join(ROOT, 'videos')
const ASSETS_JSON = path.join(ROOT, 'assets.json')

const BASE_URL = process.env.SOCIAL_BASE_URL || 'http://127.0.0.1:5173'
const DEMO_APP_URL = `${BASE_URL}/demo/app`
const VIEWPORT = { width: 390, height: 844 }

const args = process.argv.slice(2)
const screensOnly = args.includes('--screens-only')
const videoOnly = args.includes('--video-only')
const runScreens = !videoOnly
const runVideo = !screensOnly

const CAPTURE_CLEANUP_CSS = `
  .demo-mode-bar,
  .demo-feedback-trigger,
  .demo-feedback-overlay,
  .demo-feedback-sheet,
  .memory-toast {
    display: none !important;
    visibility: hidden !important;
    pointer-events: none !important;
  }
`

const STORY_SAFE_CSS = `
  body.social-story-export::before {
    content: '';
    position: fixed;
    inset: 0;
    z-index: 99998;
    pointer-events: none;
    background:
      linear-gradient(
        180deg,
        rgba(8, 7, 6, 0.5) 0%,
        rgba(8, 7, 6, 0.08) 14%,
        rgba(8, 7, 6, 0) 24%,
        rgba(8, 7, 6, 0) 72%,
        rgba(8, 7, 6, 0.12) 84%,
        rgba(8, 7, 6, 0.52) 100%
      );
  }
  body.social-story-export::after {
    content: '';
    position: fixed;
    inset: 0;
    z-index: 99999;
    pointer-events: none;
    box-shadow: inset 0 0 80px rgba(0, 0, 0, 0.18);
  }
`

function resolveCommit() {
  if (process.env.SOCIAL_COMMIT) return process.env.SOCIAL_COMMIT
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf8', cwd: path.join(ROOT, '..') }).trim()
  } catch {
    return 'unknown'
  }
}

function log(step, message) {
  console.log(`[${step}] ${message}`)
}

function fail(message) {
  console.error(`[FAIL] ${message}`)
  process.exitCode = 1
  throw new Error(message)
}

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function assertDevServer() {
  try {
    const response = await fetch(BASE_URL, { signal: AbortSignal.timeout(5000) })
    if (!response.ok) fail(`Dev server returned ${response.status} at ${BASE_URL}`)
    log('setup', `Using ${BASE_URL}`)
  } catch {
    fail(`Cannot reach ${BASE_URL}. Start the app first: npm run dev`)
  }
}

async function createContext(browser, recordVideo = false) {
  const options = {
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  }

  if (recordVideo) {
    options.recordVideo = {
      dir: VIDEOS_DIR,
      size: VIEWPORT,
    }
  }

  const context = await browser.newContext(options)
  await context.addInitScript(() => {
    window.__SOCIAL_CAPTURE__ = true
  })
  return context
}

async function injectCaptureStyles(page) {
  await page.addStyleTag({ content: CAPTURE_CLEANUP_CSS })
  await page.addStyleTag({ content: STORY_SAFE_CSS })
}

async function captureViewport(page, filePath) {
  await page.screenshot({
    path: filePath,
    type: 'png',
    animations: 'disabled',
  })
  return filePath
}

async function capturePair(page, basename, generated) {
  const screenshotPath = path.join(SCREENSHOTS_DIR, `${basename}.png`)
  const storyPath = path.join(STORIES_DIR, `${basename}.png`)

  await page.evaluate(() => document.body.classList.remove('social-story-export'))
  await captureViewport(page, screenshotPath)
  generated.push({
    id: basename,
    type: 'screenshot',
    path: path.relative(ROOT, screenshotPath),
    width: VIEWPORT.width,
    height: VIEWPORT.height,
  })
  log('screenshot', screenshotPath)

  await page.evaluate(() => document.body.classList.add('social-story-export'))
  await wait(120)
  await captureViewport(page, storyPath)
  generated.push({
    id: `${basename}-story`,
    type: 'story',
    path: path.relative(ROOT, storyPath),
    width: VIEWPORT.width,
    height: VIEWPORT.height,
    overlay: 'subtle top/bottom gradient for Story/TikTok text safe zones',
  })
  log('story', storyPath)

  await page.evaluate(() => document.body.classList.remove('social-story-export'))
}

async function clickNav(page, label) {
  await page.getByRole('button', { name: label, exact: true }).click()
  await wait(500)
}

async function loadDemoApp(page) {
  await page.goto(DEMO_APP_URL, { waitUntil: 'networkidle', timeout: 60000 })
  await page.evaluate(() => localStorage.removeItem('pawstreak:demo'))
  await page.reload({ waitUntil: 'networkidle', timeout: 60000 })
  if (!page.url().includes('/demo/app')) {
    fail(`Expected /demo/app but got ${page.url()}`)
  }
  await injectCaptureStyles(page)
  await wait(500)
}

async function safeScroll(page, selector) {
  await page.locator(selector).first().scrollIntoViewIfNeeded().catch(() => {})
  await wait(280)
}

async function captureScreenshots(browser) {
  await mkdir(SCREENSHOTS_DIR, { recursive: true })
  await mkdir(STORIES_DIR, { recursive: true })

  const context = await createContext(browser)
  const page = await context.newPage()
  const generated = []

  try {
    await loadDemoApp(page)

    await clickNav(page, 'Home')
    await page.locator('.home-adventure-launch-hero').waitFor({ timeout: 15000 })
    await safeScroll(page, '.home-adventure-launch-hero')
    await capturePair(page, '01-adventure-launch-home', generated)

    await safeScroll(page, '.home-quick-adventure--today-pick')
    await capturePair(page, '02-todays-pick-card', generated)

    await clickNav(page, 'Plan')
    await page.locator('.explore-hype').waitFor({ timeout: 15000 })
    await safeScroll(page, '.plan-screen-header')
    await capturePair(page, '03-discover-adventure-mode', generated)

    await page.locator('.plan-card-list .pcard').first().click()
    await page.locator('.plan-place-detail').waitFor({ timeout: 15000 })
    await safeScroll(page, '.plan-place-detail')
    await capturePair(page, '04-adventure-detail', generated)

    await clickNav(page, 'Home')
    await page.locator('.today-primary-action').click()
    await page.locator('.adv-ready-hero').waitFor({ timeout: 15000 })
    await capturePair(page, '05-adventure-ready', generated)

    await page.getByRole('button', { name: 'Start adventure', exact: true }).click()
    await page.locator('.clock-bg--active').waitFor({ timeout: 15000 })
    await safeScroll(page, '.adventure-finish-payoff')
    await capturePair(page, '06-save-memory-payoff', generated)

    await clickNav(page, 'Journey')
    await page.locator('.journey-grid .mcard--grid').first().click()
    await wait(600)
    if (!(await page.locator('.memory-hero').isVisible())) {
      fail('Journey memory overlay did not open')
    }
    await capturePair(page, '07-journey-memory', generated)
  } finally {
    await page.close()
    await context.close()
  }

  return generated
}

async function captureVideo(browser) {
  await mkdir(VIDEOS_DIR, { recursive: true })

  const context = await createContext(browser, true)
  const page = await context.newPage()
  const generated = []

  try {
    await loadDemoApp(page)

    await clickNav(page, 'Home')
    await safeScroll(page, '.home-adventure-launch-hero')
    await wait(1200)

    await safeScroll(page, '.home-quick-adventure--today-pick')
    await wait(900)

    await clickNav(page, 'Plan')
    await wait(1000)
    await page.locator('.plan-card-list .pcard').first().click()
    await wait(1000)

    await clickNav(page, 'Home')
    await page.locator('.today-primary-action').click()
    await wait(900)
    await page.getByRole('button', { name: 'Start adventure', exact: true }).click()
    await wait(900)
    await safeScroll(page, '.adventure-finish-payoff')
    await wait(1300)

    await clickNav(page, 'Journey')
    await wait(1200)
  } finally {
    const video = page.video()
    await page.close()
    await context.close()

    if (video) {
      const tempPath = await video.path()
      const finalPath = path.join(VIDEOS_DIR, 'pawstreak-demo-flow.webm')
      await copyFile(tempPath, finalPath)
      await unlink(tempPath).catch(() => {})
      generated.push({
        id: 'pawstreak-demo-flow',
        type: 'video',
        path: path.relative(ROOT, finalPath),
        width: VIEWPORT.width,
        height: VIEWPORT.height,
      })
      log('video', finalPath)
    }
  }

  return generated
}

async function writeAssetsManifest(newAssets) {
  const base = JSON.parse(await readFile(ASSETS_JSON, 'utf8'))
  base.generatedAt = new Date().toISOString()
  base.commit = resolveCommit()
  base.baseUrl = BASE_URL
  base.assets = newAssets
  await writeFile(ASSETS_JSON, `${JSON.stringify(base, null, 2)}\n`)
}

async function main() {
  log('start', `screens=${runScreens} video=${runVideo}`)
  await assertDevServer()

  const browser = await chromium.launch({ headless: true })
  const allAssets = []

  try {
    if (runScreens) {
      allAssets.push(...(await captureScreenshots(browser)))
    }
    if (runVideo) {
      allAssets.push(...(await captureVideo(browser)))
    }
    await writeAssetsManifest(allAssets)
    log('done', `Generated ${allAssets.length} assets`)
  } catch (error) {
    fail(error instanceof Error ? error.message : String(error))
  } finally {
    await browser.close()
  }
}

main()
