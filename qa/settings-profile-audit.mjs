/**
 * Phase 0 — read-only Settings/Profile / storage audit.
 *
 *   QA_BASE_URL=http://127.0.0.1:4190 node qa/settings-profile-audit.mjs
 */
import { chromium, devices } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE_URL = process.env.QA_BASE_URL || 'http://127.0.0.1:4190'
const OUT_DIR =
  process.env.QA_OUT_DIR || path.join(__dirname, 'evidence', 'settings-profile-audit')

const iPhone = devices['iPhone 13']

function resolveCommit() {
  try {
    return execSync('git rev-parse HEAD', { cwd: path.join(__dirname, '..'), encoding: 'utf8' }).trim()
  } catch {
    return 'unknown'
  }
}

async function readStorageSnapshot(page, route) {
  await page.goto(`${BASE_URL}${route}`, { waitUntil: 'load', timeout: 90000 })
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
  await page.reload({ waitUntil: 'load', timeout: 90000 })
  await page.waitForTimeout(1500)

  return page.evaluate(() => {
    const demoRaw = localStorage.getItem('pawstreak:demo')
    const appRaw = localStorage.getItem('pawstreak:app')
    const parse = (raw) => {
      if (!raw) return null
      try {
        return JSON.parse(raw)
      } catch {
        return null
      }
    }
    const demo = parse(demoRaw)
    const app = parse(appRaw)
    const active = location.pathname.startsWith('/demo') ? demo : app

    return {
      href: location.href,
      pathname: location.pathname,
      hasAppShell: !!document.querySelector('.bnav'),
      hasDemoPill: !!document.querySelector('.demo-pill'),
      storageKeys: Object.keys(localStorage),
      demoKeyPresent: !!demoRaw,
      appKeyPresent: !!appRaw,
      onboardingComplete: active?.onboardingComplete ?? null,
      zipCode: active?.zipCode ?? null,
      locationLabel: active?.locationLabel ?? null,
      dogs: (active?.dogs || []).map((d) => ({ id: d.id, name: d.name })),
      activeDogId: active?.activeDogId ?? null,
      activeTrainingSchedule: !!active?.activeTrainingSchedule,
      monthlyPlanResult: !!active?.monthlyPlanResult,
      activeAdventure: active?.activeAdventure
        ? {
            location: active.activeAdventure.location,
            started: active.activeAdventure.started,
            view: active.activeAdventureView,
          }
        : null,
      journeyCount: active?.journeyEntries?.length ?? 0,
      bodySample: document.body.innerText.slice(0, 280),
    }
  })
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  const report = {
    commit: resolveCommit(),
    baseUrl: BASE_URL,
    capturedAt: new Date().toISOString(),
    checklist: [
      'Confirm URL: /demo/app = demo storage; /app = app storage + auth',
      'ZIP in Settings should match Plan map region after Apply',
      'Demo shows demo account copy — not a bug',
      'Signed-in /app should show email and Supabase-backed dogs',
      'Clear pawstreak:demo and pawstreak:app separately when debugging bleed',
    ],
    routes: {},
  }

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    ...iPhone,
    isMobile: true,
    serviceWorkers: 'block',
  })
  const page = await context.newPage()

  report.routes.demoApp = await readStorageSnapshot(page, '/demo/app')
  report.routes.app = await readStorageSnapshot(page, '/app')
  report.routes.demoOnboarding = await readStorageSnapshot(page, '/demo/onboarding')

  await browser.close()

  await writeFile(path.join(OUT_DIR, 'audit.json'), JSON.stringify(report, null, 2))
  await writeFile(
    path.join(OUT_DIR, 'audit.md'),
    `# Settings / Profile audit\n\nCommit: ${report.commit}\n\n## /demo/app\n\`\`\`json\n${JSON.stringify(report.routes.demoApp, null, 2)}\n\`\`\`\n\n## /app\n\`\`\`json\n${JSON.stringify(report.routes.app, null, 2)}\n\`\`\`\n`,
  )

  console.log('Settings/Profile audit written to', OUT_DIR)
  console.log(JSON.stringify(report.routes, null, 2))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
