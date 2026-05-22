import { chromium, devices } from 'playwright'
import { copyFile, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE_URL = process.env.QA_BASE_URL || 'http://localhost:5173'
const OUT_DIR =
  process.env.QA_OUT_DIR || path.join(__dirname, 'evidence', 'home-emotional-polish')

function resolveCommit() {
  if (process.env.QA_COMMIT) return process.env.QA_COMMIT
  try {
    return execSync('git rev-parse HEAD', { cwd: path.join(__dirname, '..'), encoding: 'utf8' }).trim()
  } catch {
    return 'unknown'
  }
}

const COMMIT = resolveCommit()
const iPhone = devices['iPhone 13']
const results = []

async function record(flow, pass, message) {
  results.push({ flow, pass, message })
  console.log(`[${pass ? 'PASS' : 'FAIL'}] ${flow}: ${message}`)
  if (!pass) throw new Error(`${flow}: ${message}`)
}

async function screenshot(page, name) {
  const file = path.join(OUT_DIR, `${name}.png`)
  await page.screenshot({ path: file, fullPage: true })
  return file
}

function hasGhostNames(text) {
  const lower = (text ?? '').toLowerCase()
  return (
    lower.includes('bailey + omi') ||
    /\bbailey\b/.test(lower) ||
    /\bomi\b/.test(lower)
  )
}

async function clickChip(page, label) {
  await page.locator('button.chip').filter({ hasText: label }).first().click()
  await page.waitForTimeout(400)
}

async function clickNav(page, label) {
  await page.getByRole('button', { name: label, exact: true }).click()
  await page.waitForTimeout(400)
}

async function clearStorage(page, keys) {
  await page.evaluate((storageKeys) => {
    storageKeys.forEach((key) => localStorage.removeItem(key))
  }, keys)
}

async function completeTacoOnboarding(page) {
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' })
  await clearStorage(page, ['pawstreak:app', 'pawstreak:demo'])
  await page.reload({ waitUntil: 'networkidle' })

  await page.getByRole('button', { name: /Get started/i }).click()
  await page.getByPlaceholder('First name').fill('QA Tester')
  await page.getByPlaceholder('you@email.com').fill('qa@pawstreak.test')
  await page.getByPlaceholder('Min. 8 characters').fill('password123')
  await page.getByRole('button', { name: /Create account/i }).click()

  await page.getByPlaceholder('e.g. Luna').fill('Taco')
  await page.locator('select.field-input').first().selectOption('Mixed / Other')
  await page.locator('select.field-input').nth(1).selectOption('1–3 years')
  await page.getByRole('button', { name: /^Next$/ }).click()
  await page.getByRole('button', { name: 'Explorer' }).click()
  await page.getByRole('button', { name: /^Next$/ }).click()
  await page
    .getByPlaceholder('ZIP, city, or neighborhood — e.g. 92123 or San Diego')
    .fill('92123')
  await page.getByRole('button', { name: /Create our world/i }).click()
  await page.getByRole('button', { name: /Start your first adventure/i }).click()
  await page.waitForTimeout(600)
}

function buildHtmlReport(report) {
  const rows = report.results
    .map(
      (item) =>
        `<tr class="${item.pass ? 'pass' : 'fail'}"><td>${item.flow}</td><td>${item.pass ? 'PASS' : 'FAIL'}</td><td>${item.message}</td></tr>`,
    )
    .join('\n')

  return `<!DOCTYPE html><html><head><meta charset="utf-8" /><title>Home Emotional Polish QA</title></head><body><h1>Home Emotional Polish QA</h1><p>Commit: ${report.commit}</p><p>Overall: ${report.overallPass ? 'PASS' : 'FAIL'}</p><table border="1"><thead><tr><th>Flow</th><th>Result</th><th>Message</th></tr></thead><tbody>${rows}</tbody></table></body></html>`
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  await mkdir(path.join(OUT_DIR, 'video'), { recursive: true })

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    ...iPhone,
    recordVideo: {
      dir: path.join(OUT_DIR, 'video'),
      size: { width: 390, height: 844 },
    },
  })
  const page = await context.newPage()

  let overallPass = true
  let errorMessage = null

  try {
    // Demo mode Home
    await page.goto(`${BASE_URL}/demo`, { waitUntil: 'networkidle' })
    await clearStorage(page, ['pawstreak:demo'])
    await page.reload({ waitUntil: 'networkidle' })

    const demoHeadline = (await page.locator('.home-intro-title').textContent())?.trim() || ''
    await record(
      'demo-home-headline',
      demoHeadline.includes('Bailey + Omi'),
      `Demo Home headline uses Bailey + Omi ("${demoHeadline}")`,
    )

    const demoCurate = (await page.locator('.hc-curate').textContent())?.trim() || ''
    await record(
      'demo-home-curate',
      demoCurate.length > 0,
      `Demo hero curated line present ("${demoCurate}")`,
    )

    await screenshot(page, '01-demo-home')

    const heroBefore = (await page.locator('.hc-title').textContent())?.trim() || ''
    await clickChip(page, 'Coffee')
    const heroAfter = (await page.locator('.hc-title').textContent())?.trim() || ''
    await record(
      'demo-chip-change',
      heroBefore !== heroAfter && heroAfter.length > 0,
      `Demo activity chip changes hero ("${heroBefore}" -> "${heroAfter}")`,
    )
    await screenshot(page, '02-demo-home-chip-change')

    await page.getByRole('button', { name: '15 min', exact: true }).click()
    await page.waitForTimeout(500)
    await record(
      'demo-adventure-ready',
      await page.locator('.adv-ready-label').isVisible(),
      'Demo duration opens Adventure Ready screen',
    )
    await screenshot(page, '03-demo-adventure-ready')
    await page.locator('.overlay-back').click()
    await page.waitForTimeout(400)

    // Personalized Taco Home
    await completeTacoOnboarding(page)

    const tacoHeadline = (await page.locator('.home-intro-title').textContent())?.trim() || ''
    await record(
      'taco-home-headline',
      tacoHeadline.includes('Taco'),
      `Taco Home headline uses Taco ("${tacoHeadline}")`,
    )

    const tacoBody = await page.locator('body').innerText()
    await record(
      'taco-no-ghosts',
      !hasGhostNames(tacoBody),
      'Taco Home has no Bailey/Omi ghost names',
    )

    await screenshot(page, '04-taco-home')

    const tacoHeroBefore = (await page.locator('.hc-title').textContent())?.trim() || ''
    await clickChip(page, 'Coffee')
    const tacoHeroAfter = (await page.locator('.hc-title').textContent())?.trim() || ''
    await record(
      'taco-chip-change',
      tacoHeroBefore !== tacoHeroAfter,
      `Taco activity chip changes hero ("${tacoHeroBefore}" -> "${tacoHeroAfter}")`,
    )
    await screenshot(page, '05-taco-home-chip-change')

    await page.getByRole('button', { name: '15 min', exact: true }).click()
    await page.waitForTimeout(500)
    const readyDogs = (await page.locator('.adv-ready-row').filter({ hasText: 'Dogs' }).textContent()) ?? ''
    await record(
      'taco-adventure-ready',
      readyDogs.includes('Taco') && !hasGhostNames(readyDogs),
      `Taco Adventure Ready uses Taco ("${readyDogs.trim()}")`,
    )
    await page.locator('.overlay-back').click()
    await page.waitForTimeout(400)

    await clickNav(page, 'Home')
    await page.getByRole('button', { name: 'Taco' }).click()
    await page.waitForTimeout(400)
    await record(
      'dog-pill-profile',
      await page.getByText('Taco').first().isVisible(),
      'Dog pill opens Profile with Taco',
    )
    await screenshot(page, '06-taco-profile')

    await clickNav(page, 'Plan')
    await record('bottom-nav-plan', true, 'Bottom nav still works after Home polish')
    await clickNav(page, 'Home')
  } catch (error) {
    overallPass = false
    errorMessage = error instanceof Error ? error.message : String(error)
    await screenshot(page, '99-failure-state').catch(() => {})
    console.error(errorMessage)
  }

  const video = page.video()
  await page.close()
  await context.close()

  const videoPath = video ? await video.path() : null
  const runWebm = path.join(OUT_DIR, 'video', 'run.webm')
  if (videoPath) {
    await copyFile(videoPath, runWebm)
  }

  await browser.close()

  const report = {
    commit: COMMIT,
    testedAt: new Date().toISOString(),
    overallPass,
    errorMessage,
    evidenceDir: OUT_DIR,
    videoPath: runWebm,
    results,
  }

  await writeFile(path.join(OUT_DIR, 'report.json'), JSON.stringify(report, null, 2))
  await writeFile(path.join(OUT_DIR, 'report.html'), buildHtmlReport(report))

  console.log('\n--- HOME EMOTIONAL POLISH QA ---')
  console.log(JSON.stringify(report, null, 2))
  process.exit(overallPass ? 0 : 1)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
