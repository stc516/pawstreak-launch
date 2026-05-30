import { chromium, devices } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { assertShellLayout } from './lib/shellLayoutGuard.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE_URL = process.env.QA_BASE_URL || 'http://127.0.0.1:5173'
const OUT_DIR = process.env.QA_OUT_DIR || path.join(__dirname, 'evidence', 'mobile-product-audit')

const DEVICE_NAMES = ['iPhone 13', 'iPhone 15 Pro', 'iPhone 15 Pro Max']

const APP_SCREENS = [
  { id: 'home', label: 'Home', setup: async (page) => {
    await page.goto(`${BASE_URL}/demo/app`, { waitUntil: 'networkidle' })
    await page.evaluate(() => localStorage.clear())
    await page.reload({ waitUntil: 'networkidle' })
    await page.waitForTimeout(1500)
  }},
  { id: 'plan', label: 'Plan', setup: async (page) => {
    await page.getByRole('button', { name: 'Plan', exact: true }).click()
    await page.waitForTimeout(1200)
  }},
  { id: 'journey', label: 'Journey', setup: async (page) => {
    await page.getByRole('button', { name: 'Journey', exact: true }).click()
    await page.waitForTimeout(1200)
  }},
  { id: 'challenges', label: 'Challenges', setup: async (page) => {
    await page.getByRole('button', { name: 'Challenges', exact: true }).click()
    await page.waitForTimeout(1200)
  }},
  { id: 'profile', label: 'Profile', setup: async (page) => {
    await page.goto(`${BASE_URL}/demo/app`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(800)
    const pill = page.locator('.home-dog-pill').first()
    if (await pill.isVisible().catch(() => false)) {
      await pill.click()
      await page.waitForTimeout(800)
    } else {
      await page.getByRole('button', { name: 'Challenges', exact: true }).click()
      await page.waitForTimeout(400)
    }
  }},
]

const AUTH_SCREENS = [
  { id: 'signup', label: 'Signup', setup: async (page) => {
    await page.goto(`${BASE_URL}/demo/onboarding`, { waitUntil: 'networkidle' })
    await page.evaluate(() => localStorage.clear())
    await page.reload({ waitUntil: 'networkidle' })
    await page.waitForTimeout(1200)
    await page.getByRole('button', { name: 'Create Your Free Account' }).click()
    await page.waitForTimeout(600)
  }},
  { id: 'login', label: 'Login', setup: async (page) => {
    await page.goto(`${BASE_URL}/app`, { waitUntil: 'networkidle' })
    await page.evaluate(() => localStorage.clear())
    await page.reload({ waitUntil: 'networkidle' })
    await page.waitForTimeout(1200)
    await page.getByRole('button', { name: 'Already have an account? Sign in' }).click()
    await page.waitForTimeout(600)
  }},
]

async function collectMetrics(page) {
  return page.evaluate(() => {
    const rect = (el) => {
      if (!el) return null
      const r = el.getBoundingClientRect()
      return {
        top: Math.round(r.top),
        left: Math.round(r.left),
        width: Math.round(r.width),
        height: Math.round(r.height),
        bottom: Math.round(r.bottom),
        right: Math.round(r.right),
      }
    }

    const scrollEl = document.querySelector('.scroll')
    const viewportEl = document.querySelector('.app-viewport')
    const shellEl = document.querySelector('.app-shell')
    const bnavEl = document.querySelector('.bnav')
    const footerEl = document.querySelector('.app-shell-footer')
    const html = document.documentElement
    const body = document.body

    const probe = document.createElement('div')
    probe.style.cssText =
      'position:fixed;top:0;left:0;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);visibility:hidden;pointer-events:none;'
    document.body.appendChild(probe)
    const probeStyle = getComputedStyle(probe)
    const safeArea = {
      top: probeStyle.paddingTop,
      right: probeStyle.paddingRight,
      bottom: probeStyle.paddingBottom,
      left: probeStyle.paddingLeft,
    }
    probe.remove()

    const scrollContainer = scrollEl || html
    const scrollHeight = scrollContainer.scrollHeight
    const clientHeight = scrollContainer.clientHeight
    const scrollTop = scrollContainer.scrollTop

    const viewportHeight = window.innerHeight
    const visualViewportHeight = window.visualViewport?.height ?? viewportHeight

    const htmlStyle = getComputedStyle(html)
    const bodyStyle = getComputedStyle(body)

    const scrollbars = {
      scrollElOverflowY: scrollEl ? getComputedStyle(scrollEl).overflowY : null,
      bodyOverflowY: bodyStyle.overflowY,
      htmlOverflowY: htmlStyle.overflowY,
      scrollElCanScroll: scrollEl ? scrollEl.scrollHeight > scrollEl.clientHeight + 2 : false,
      bodyCanScroll: body.scrollHeight > body.clientHeight + 2,
      htmlCanScroll: html.scrollHeight > html.clientHeight + 2,
    }

    const bnavRect = rect(bnavEl)
    const viewportRect = rect(viewportEl)
    const footerRect = rect(footerEl)
    const shellRect = rect(shellEl)

    const navCenterY = bnavRect ? bnavRect.top + bnavRect.height / 2 : null
    const navInLowerHalf =
      navCenterY === null ? null : navCenterY >= viewportHeight * 0.55
    const shellFillRatio =
      shellRect && viewportHeight > 0 ? shellRect.height / viewportHeight : null

    const navAtBottom =
      bnavRect && viewportRect
        ? Math.abs(bnavRect.bottom - viewportRect.bottom) <= 3
        : null

    const gapBelowNav =
      bnavRect && viewportRect ? Math.round(viewportRect.bottom - bnavRect.bottom) : null

    const contentHiddenBehindNav = (() => {
      if (!scrollEl || !bnavEl) return null
      const lastChild = scrollEl.lastElementChild
      if (!lastChild) return null
      const lastRect = lastChild.getBoundingClientRect()
      const navRect = bnavEl.getBoundingClientRect()
      const footerTop = footerEl ? footerEl.getBoundingClientRect().top : navRect.top
      return lastRect.bottom > footerTop + 2
    })()

    const sampleBottomPixels = (() => {
      const canvas = document.createElement('canvas')
      canvas.width = 1
      canvas.height = 1
      const ctx = canvas.getContext('2d')
      if (!ctx || !viewportEl) return null
      const vr = viewportEl.getBoundingClientRect()
      const x = Math.floor(vr.left + vr.width / 2)
      const y = Math.floor(vr.bottom - 2)
      const belowNavY = bnavEl
        ? Math.floor(bnavEl.getBoundingClientRect().bottom + 4)
        : y
      const sample = (sy) => {
        const el = document.elementFromPoint(x, sy)
        if (!el) return { y: sy, color: null, tag: null }
        const cs = getComputedStyle(el)
        return {
          y: sy,
          tag: el.tagName.toLowerCase() + (el.className ? `.${String(el.className).split(' ')[0]}` : ''),
          backgroundColor: cs.backgroundColor,
          color: cs.color,
        }
      }
      return {
        viewportBottom: sample(y),
        belowNav: sample(Math.min(belowNavY, window.innerHeight - 1)),
      }
    })()

    const blackGapHeuristic = (() => {
      if (!viewportEl || !bnavEl) return null
      const vr = viewportEl.getBoundingClientRect()
      const nr = bnavEl.getBoundingClientRect()
      const gap = vr.bottom - nr.bottom
      if (gap <= 1) return { detected: false, gapPx: Math.round(gap) }
      const x = vr.left + vr.width / 2
      const y = nr.bottom + gap / 2
      const el = document.elementFromPoint(x, y)
      if (!el) return { detected: true, gapPx: Math.round(gap), reason: 'no element' }
      const bg = getComputedStyle(el).backgroundColor
      const isDark =
        bg === 'rgb(0, 0, 0)' ||
        bg === 'rgba(0, 0, 0, 1)' ||
        bg === 'black'
      return { detected: isDark || gap > 8, gapPx: Math.round(gap), backgroundColor: bg, tag: el.tagName }
    })()

    const homeSections = (() => {
      const hero = document.querySelector('.home-hero')
      const progress = document.querySelector('.home-progress')
      const challenge = document.querySelector('.home-challenge')
      const memoryTile = document.querySelector('.home-memory-tile--large, .home-memory-tile')
      return {
        hero: rect(hero),
        progress: rect(progress),
        challenge: rect(challenge),
        memoryTile: rect(memoryTile),
        heroToViewportRatio: hero && viewportRect ? +(hero.getBoundingClientRect().height / viewportRect.height).toFixed(2) : null,
      }
    })()

    const planMetrics = (() => {
      const map = document.querySelector('.plan-map, .plan-map-wrap, [class*="plan-map"]')
      const cards = document.querySelectorAll('.pcard')
      return {
        mapVisible: map ? map.getBoundingClientRect().height > 40 : false,
        mapRect: rect(map),
        cardCount: cards.length,
        firstCardRect: rect(cards[0]),
      }
    })()

    const journeyMetrics = (() => {
      const spine = document.querySelector('.journey-story-spine, .journey-spine')
      const photo = document.querySelector('.journey-story-photo, .journey-node-photo, .js-photo')
      const header = document.querySelector('.journey-story-header, .journey-header')
      return {
        spineRect: rect(spine),
        photoRect: rect(photo),
        headerRect: rect(header),
        spineToPhotoRatio:
          spine && photo
            ? +(spine.getBoundingClientRect().width / photo.getBoundingClientRect().width).toFixed(2)
            : null,
      }
    })()

    const challengeMetrics = (() => {
      const cards = document.querySelectorAll('.challenge-node-card, .milestone-card, .ach-card, [class*="challenge"]')
      return {
        cardCount: cards.length,
        firstCardRect: rect(cards[0]),
        cardsTotalHeight: Array.from(cards).reduce((sum, c) => sum + c.getBoundingClientRect().height, 0),
      }
    })()

    const profileMetrics = (() => {
      const dogCards = document.querySelectorAll('.profile-dog-card, .dog-card, [class*="profile-dog"]')
      const dogNames = Array.from(document.querySelectorAll('.profile-dog-name, .dog-name, h2, h3'))
        .map((el) => el.textContent?.trim())
        .filter(Boolean)
        .slice(0, 10)
      const clipped = Array.from(document.querySelectorAll('.profile-dog-card, .profile-screen *'))
        .filter((el) => {
          const r = el.getBoundingClientRect()
          const cs = getComputedStyle(el)
          return (
            cs.overflow !== 'visible' &&
            el.scrollHeight > el.clientHeight + 2 &&
            r.height > 20
          )
        })
        .length
      return { dogCardCount: dogCards.length, dogNamesSample: dogNames, clippedOverflowCount: clipped }
    })()

    return {
      viewport: {
        innerHeight: viewportHeight,
        innerWidth: window.innerWidth,
        visualViewportHeight: Math.round(visualViewportHeight),
        devicePixelRatio: window.devicePixelRatio,
      },
      heights: {
        documentScrollHeight: html.scrollHeight,
        bodyScrollHeight: body.scrollHeight,
        scrollContainerScrollHeight: scrollHeight,
        scrollContainerClientHeight: clientHeight,
        scrollClientHeight: clientHeight,
        scrollContainerScrollTop: scrollTop,
        appViewportHeight: viewportEl?.clientHeight ?? null,
        appShellHeight: shellEl?.clientHeight ?? null,
        contentHeight: scrollEl?.scrollHeight ?? null,
      },
      safeArea,
      layout: {
        scrollEl: rect(scrollEl),
        viewportEl: viewportRect,
        shellEl: shellRect,
        bnav: bnavRect,
        footer: footerRect,
        navCenterY: navCenterY === null ? null : Math.round(navCenterY),
        navInLowerHalf,
        shellFillRatio:
          shellFillRatio === null ? null : +shellFillRatio.toFixed(3),
        navAtBottom,
        gapBelowNav,
        contentHiddenBehindNav,
        blackGapHeuristic,
        sampleBottomPixels,
        scrollbars,
      },
      screenSpecific: {
        home: homeSections,
        plan: planMetrics,
        journey: journeyMetrics,
        challenges: challengeMetrics,
        profile: profileMetrics,
      },
    }
  })
}

function auditScreen(screenId, metrics) {
  const issues = []
  const { layout, heights, viewport, screenSpecific } = metrics

  const shellCheck = assertShellLayout(metrics, { requireNav: Boolean(layout.bnav) })
  if (!shellCheck.ok) {
    issues.push({ severity: 'red', code: shellCheck.code, detail: shellCheck.detail })
  }

  if (layout.blackGapHeuristic?.detected) {
    issues.push({ severity: 'red', code: 'BLACK_GAP', detail: `Gap below nav: ${layout.blackGapHeuristic.gapPx}px`, })
  }
  if (layout.gapBelowNav > 3) {
    issues.push({ severity: 'red', code: 'NAV_NOT_PINNED', detail: `Nav ${layout.gapBelowNav}px above viewport bottom` })
  }
  if (layout.navAtBottom === false) {
    issues.push({ severity: 'red', code: 'NAV_MISALIGNED', detail: 'Bottom nav not flush with viewport bottom' })
  }
  if (layout.scrollbars.bodyCanScroll && layout.scrollbars.scrollElCanScroll) {
    issues.push({ severity: 'yellow', code: 'DOUBLE_SCROLL', detail: 'Both body and .scroll appear scrollable' })
  }
  if (layout.contentHiddenBehindNav) {
    issues.push({ severity: 'yellow', code: 'BEHIND_NAV', detail: 'Last content extends under footer/nav area' })
  }

  const emptyRatio =
    heights.scrollContainerClientHeight > 0
      ? heights.contentHeight / heights.scrollContainerClientHeight
      : 1
  if (emptyRatio < 0.35 && screenId !== 'journey') {
    issues.push({ severity: 'yellow', code: 'EXCESS_WHITESPACE', detail: `Content fills only ~${Math.round(emptyRatio * 100)}% of scroll area` })
  }

  if (screenId === 'home') {
    const hr = screenSpecific.home.heroToViewportRatio
    if (hr && hr > 0.55) issues.push({ severity: 'red', code: 'HERO_OVERSIZED', detail: `Hero is ${Math.round(hr * 100)}% of viewport height` })
    else if (hr && hr > 0.45) issues.push({ severity: 'yellow', code: 'HERO_LARGE', detail: `Hero is ${Math.round(hr * 100)}% of viewport height` })
  }

  if (screenId === 'plan' && !screenSpecific.plan.mapVisible) {
    issues.push({ severity: 'yellow', code: 'MAP_NOT_VISIBLE', detail: 'Plan map element not visible or too small' })
  }

  if (screenId === 'journey') {
    const photo = screenSpecific.journey.photoRect
    if (photo && photo.height < 80) {
      issues.push({ severity: 'yellow', code: 'JOURNEY_PHOTOS_SMALL', detail: `First photo height ${photo.height}px` })
    }
  }

  if (screenId === 'profile' && screenSpecific.profile.dogCardCount > 3) {
    issues.push({ severity: 'yellow', code: 'PROFILE_DOG_DUP', detail: `${screenSpecific.profile.dogCardCount} dog cards found` })
  }

  const worst = issues.some((i) => i.severity === 'red')
    ? 'red'
    : issues.some((i) => i.severity === 'yellow')
      ? 'yellow'
      : 'green'

  return { rating: worst, issues }
}

async function captureScreen(page, deviceSlug, screen, metrics) {
  const fileName = `${deviceSlug}-${screen.id}.png`
  const filePath = path.join(OUT_DIR, fileName)
  await page.screenshot({ path: filePath, fullPage: true })
  const audit = auditScreen(screen.id, metrics)
  return {
    screen: screen.label,
    screenId: screen.id,
    screenshot: fileName,
    screenshotPath: filePath,
    metrics,
    audit,
  }
}

async function runDevice(browser, deviceName) {
  const device = devices[deviceName]
  const deviceSlug = deviceName.toLowerCase().replace(/\s+/g, '-')
  const context = await browser.newContext({ ...device })
  const page = await context.newPage()
  const results = []

  // App screens share one session
  await APP_SCREENS[0].setup(page)
  for (const screen of APP_SCREENS) {
    if (screen.id !== 'home') await screen.setup(page)
    const metrics = await collectMetrics(page)
    const result = await captureScreen(page, deviceSlug, screen, metrics)
    results.push(result)
    console.log(`[${deviceName}] ${screen.label}: ${result.audit.rating.toUpperCase()} (${result.audit.issues.length} issues)`)
  }

  for (const screen of AUTH_SCREENS) {
    await screen.setup(page)
    const metrics = await collectMetrics(page)
    const result = await captureScreen(page, deviceSlug, screen, metrics)
    results.push(result)
    console.log(`[${deviceName}] ${screen.label}: ${result.audit.rating.toUpperCase()} (${result.audit.issues.length} issues)`)
  }

  await context.close()
  return { device: deviceName, deviceSlug, viewport: device.viewport, results }
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  const browser = await chromium.launch({ headless: true })
  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    devices: [],
  }

  for (const deviceName of DEVICE_NAMES) {
    const deviceReport = await runDevice(browser, deviceName)
    report.devices.push(deviceReport)
  }

  await browser.close()

  const reportPath = path.join(OUT_DIR, 'audit-report.json')
  await writeFile(reportPath, JSON.stringify(report, null, 2))
  console.log(`\nReport: ${reportPath}`)
  console.log(`Screenshots: ${OUT_DIR}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
