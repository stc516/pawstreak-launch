import { chromium, devices } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE_URL = process.env.QA_BASE_URL || 'http://127.0.0.1:4177'
const OUT_DIR = process.env.QA_OUT_DIR || path.join(__dirname, 'evidence', 'phase1-product-honesty')

function resolveCommit() {
  try {
    return execSync('git rev-parse HEAD', { cwd: path.join(__dirname, '..'), encoding: 'utf8' }).trim()
  } catch {
    return process.env.QA_COMMIT || 'unknown'
  }
}

async function bodyText(page) {
  return page.locator('body').innerText()
}

async function runDemoChecks(page, results) {
  await page.goto(`${BASE_URL}/demo/app`, { waitUntil: 'networkidle', timeout: 60000 })
  await page.evaluate(() => localStorage.clear())
  await page.reload({ waitUntil: 'networkidle', timeout: 60000 })
  await page.locator('.home-dog-pill').first().waitFor({ state: 'visible', timeout: 15000 })
  await page.waitForTimeout(800)

  const homeText = await bodyText(page)
  results.push({
    id: 'demo-home-suggested-spots',
    pass: (await page.locator('.home-suggested-spots').count()) > 0,
    detail: 'Home shows Suggested Spots section',
  })
  results.push({
    id: 'demo-home-no-curated-adventures',
    pass: !homeText.includes('Curated Adventures'),
    detail: 'Home has no "Curated Adventures" copy',
  })
  results.push({
    id: 'demo-home-no-join-promo',
    pass: !(await page.getByRole('button', { name: 'Join', exact: true }).count()),
    detail: 'Home has no challenge join promo',
  })
  results.push({
    id: 'demo-home-active-challenge',
    pass: (await page.locator('section[aria-label="Active challenge"]').count()) > 0,
    detail: 'Demo Home surfaces joined active challenge',
  })
  results.push({
    id: 'demo-home-no-dog-stock-on-cards',
    pass: await page.evaluate(() => {
      const urls = [...document.querySelectorAll('.home-suggested-spots .card-img')]
        .map((el) => getComputedStyle(el).backgroundImage)
        .join(' ')
      return !urls.includes('dogs-outdoors')
    }),
    detail: 'Suggested Spots cards do not use dogs-outdoors.jpg',
  })

  await page.screenshot({ path: path.join(OUT_DIR, '01-demo-home.png'), fullPage: true })

  await page.getByRole('button', { name: 'Plan', exact: true }).click()
  await page.waitForTimeout(900)
  const planText = await bodyText(page)
  results.push({
    id: 'demo-plan-suggested-spots',
    pass: (await page.locator('.plan-suggested-sec').count()) > 0,
    detail: 'Plan strip labeled Suggested Spots',
  })
  results.push({
    id: 'demo-plan-curated-plan-cta',
    pass: (await page.locator('.plan-build-curated-plan').count()) > 0,
    detail: 'Plan has Build a Curated Plan CTA',
  })
  await page.screenshot({ path: path.join(OUT_DIR, '02-demo-plan.png'), fullPage: true })

  await page.getByRole('button', { name: 'Challenges', exact: true }).click()
  await page.waitForTimeout(900)
  const challengesText = await bodyText(page)
  results.push({
    id: 'demo-challenges-no-earned-tags',
    pass: !challengesText.includes('Earned Tags'),
    detail: 'Challenges screen has no Earned Tags',
  })
  results.push({
    id: 'demo-challenges-no-training',
    pass: !challengesText.includes('Training Skills'),
    detail: 'Challenges screen has no Training section',
  })
  results.push({
    id: 'demo-challenges-discover',
    pass: challengesText.includes('Discover challenges'),
    detail: 'Challenges shows Discover challenges',
  })
  results.push({
    id: 'demo-challenges-no-fake-counts',
    pass: !/\d[\d,]* packs joined/.test(challengesText),
    detail: 'No fake participant counts on Challenges',
  })
  await page.screenshot({ path: path.join(OUT_DIR, '03-demo-challenges.png'), fullPage: true })

  await page.getByRole('button', { name: 'Home', exact: true }).click()
  await page.waitForTimeout(500)
  await page.locator('.home-dog-pill').first().click()
  await page.waitForTimeout(800)
  const profileText = await bodyText(page)
  results.push({
    id: 'demo-profile-earned-tags',
    pass: profileText.includes('Earned Tags'),
    detail: 'Profile shows Earned Tags section',
  })
  results.push({
    id: 'demo-profile-training',
    pass: profileText.includes('Training'),
    detail: 'Profile shows Training section',
  })
  await page.screenshot({ path: path.join(OUT_DIR, '04-demo-profile.png'), fullPage: true })

  await page.getByRole('button', { name: 'Home', exact: true }).click()
  await page.waitForTimeout(500)
  await page.getByRole('button', { name: 'Challenges', exact: true }).click()
  await page.waitForTimeout(700)
  await page.locator('.ms-challenge-card-inner, .ms-challenge-card-cta').first().click()
  await page.waitForTimeout(900)
  const detailText = await bodyText(page)
  results.push({
    id: 'demo-challenge-detail-no-fake-leaderboard',
    pass:
      !detailText.includes('Bailey & Omi') &&
      !detailText.includes('Mochi pack') &&
      detailText.includes('No leaderboard yet'),
    detail: 'Challenge detail shows honest leaderboard empty state',
  })
  await page.screenshot({ path: path.join(OUT_DIR, '05-demo-challenge-detail.png'), fullPage: true })
}

async function runAppChecks(page, results) {
  await page.goto(`${BASE_URL}/app`, { waitUntil: 'networkidle', timeout: 60000 })
  await page.evaluate(() => localStorage.clear())
  await page.reload({ waitUntil: 'networkidle', timeout: 60000 })
  await page.waitForTimeout(1200)

  const appText = await bodyText(page)
  results.push({
    id: 'app-no-curated-adventures',
    pass: !appText.includes('Curated Adventures'),
    detail: '/app route has no Curated Adventures copy',
  })
  results.push({
    id: 'app-no-syncs-calendar',
    pass: !appText.includes('syncs to calendar'),
    detail: '/app route has no calendar sync promise',
  })
  await page.screenshot({ path: path.join(OUT_DIR, '06-app-entry.png'), fullPage: true })
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    ...devices['iPhone 13'],
    serviceWorkers: 'block',
  })
  const page = await context.newPage()
  const checks = []

  await runDemoChecks(page, checks)
  await runAppChecks(page, checks)

  await browser.close()

  const report = {
    commit: resolveCommit(),
    baseUrl: BASE_URL,
    device: 'iPhone 13',
    capturedAt: new Date().toISOString(),
    pass: checks.every((item) => item.pass),
    checks,
  }

  await writeFile(path.join(OUT_DIR, 'report.json'), JSON.stringify(report, null, 2))

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Phase 1 Product Honesty</title>
<style>body{font-family:system-ui,sans-serif;padding:16px}table{border-collapse:collapse;width:100%}
th,td{border:1px solid #ddd;padding:8px;text-align:left}.pass{color:green}.fail{color:#b00020}</style></head>
<body><h1>Phase 1 Product Honesty</h1><p>${report.pass ? 'PASS' : 'FAIL'} · ${report.baseUrl}</p>
<table><tr><th>Check</th><th>Result</th><th>Detail</th></tr>
${checks.map((c) => `<tr class="${c.pass ? 'pass' : 'fail'}"><td>${c.id}</td><td>${c.pass ? 'PASS' : 'FAIL'}</td><td>${c.detail}</td></tr>`).join('')}
</table></body></html>`
  await writeFile(path.join(OUT_DIR, 'report.html'), html)

  for (const check of checks) {
    console.log(`[${check.pass ? 'PASS' : 'FAIL'}] ${check.id} — ${check.detail}`)
  }
  console.log(`Report: ${path.join(OUT_DIR, 'report.json')}`)
  if (!report.pass) process.exit(1)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
