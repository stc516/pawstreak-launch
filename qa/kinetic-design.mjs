import assert from 'node:assert/strict'
import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:4190'
const out = process.env.QA_OUT_DIR || 'artifacts/kinetic-design'
await mkdir(out, { recursive: true })
const browser = await chromium.launch({ headless: true, ...(process.env.QA_BROWSER_PATH ? { executablePath: process.env.QA_BROWSER_PATH } : {}) })
const results = []
try {
  for (const viewport of [{ width: 375, height: 667 }, { width: 393, height: 852 }]) {
    const page = await browser.newPage({ viewport, isMobile: true, hasTouch: true, deviceScaleFactor: 1, serviceWorkers: 'block', reducedMotion: 'reduce' })
    const errors = []
    page.on('pageerror', e => errors.push(e.message))
    // The product must retain typography and icons without remote font/CDN access.
    await page.route(/https:\/\/(fonts\.|cdn\.jsdelivr)/, route => route.abort())
    await page.goto(`${base}/demo/app`)
    await page.locator('.home-pack').waitFor()
    await page.evaluate(() => document.fonts.ready)
    const capture = async name => {
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name}: viewport containment`)
      await page.screenshot({ path: path.join(out, `${viewport.width}-${name}.png`) })
      results.push(`${viewport.width}: ${name}`)
    }
    assert.equal(await page.locator('.home-screen h1').evaluate(el => getComputedStyle(el).fontFamily.includes('Outfit')), true)
    assert.equal(await page.locator('.kinetic-home-actions .field-primary').evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(220, 53, 34)')
    assert.ok(await page.evaluate(() => document.fonts.check('16px "Outfit Variable"')))
    await capture('home')
    for (const [label, name] of [['Explore','explore'],['Journey','journey'],['Pack','pack']]) {
      await page.locator('.bnav').getByRole('button', { name: label, exact: true }).click()
      await capture(name)
    }
    await page.locator('.bnav').getByRole('button', { name: 'Today', exact: true }).click()
    await page.getByRole('button', { name: 'Training', exact: true }).click()
    await page.locator('.training-flow-title').waitFor()
    assert.equal(await page.locator('.training-flow-title').evaluate(el => getComputedStyle(el).color), 'rgb(26, 23, 21)')
    await capture('training')
    await page.getByRole('button', { name: 'Back', exact: true }).click()
    await page.getByRole('button', { name: 'Start a walk', exact: true }).click()
    const start = page.getByRole('button', { name: 'Start adventure', exact: true })
    if (await start.isVisible()) await start.click()
    await page.locator('.trail-console').waitFor()
    assert.equal(await page.locator('.trail-timer').count(), 1)
    await capture('active')
    await page.getByRole('button', { name: 'Finish walk', exact: true }).click()
    await page.locator('.field-notes').waitFor()
    assert.equal(await page.locator('.kinetic-recap-hero img').count(), 0)
    await capture('recap-no-photo')
    assert.deepEqual(errors, [])
    await page.close()
  }
  console.log('PASS: seven Kinetic screens at 375 × 667 and 393 × 852, local typography, readable Training, single timer, no-photo recap, no runtime errors.')
} finally {
  await writeFile(path.join(out, 'report.json'), JSON.stringify({ results, engine: 'Chromium mobile emulation; not a physical iPhone', mode: 'Seeded demo; no production account data' }, null, 2))
  await browser.close()
}
