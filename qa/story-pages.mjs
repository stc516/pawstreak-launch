import assert from 'node:assert/strict'
import { readFile, mkdir } from 'node:fs/promises'
import { chromium } from 'playwright'

const paths = ['/bailey-and-omi', '/bailey-and-omi/big-climb']
const titles = ['Bailey &amp; Omi Adventures', 'Bailey’s Big Climb']
const config = JSON.parse(await readFile('vercel.json', 'utf8'))
for (const [i, route] of paths.entries()) {
  const html = await readFile(`dist${route}/index.html`, 'utf8')
  assert(html.includes(`<title>${titles[i]}`))
  assert(html.includes(`rel="canonical" href="https://pawstreakapp.com${route}"`))
  assert(html.includes(`property="og:url" content="https://pawstreakapp.com${route}"`))
  assert(html.includes('S.T. Carroll'))
  assert(!html.includes('<script'), 'Story content must work without JavaScript or app auth')
  assert(config.rewrites.some(x => x.source === route && x.destination === `${route}/index.html`))
  assert(config.rewrites.some(x => x.source === `${route}/` && x.destination === `${route}/index.html`))
}
const book = await readFile('dist/bailey-and-omi/big-climb/index.html', 'utf8')
assert(book.includes('data-story-adventure-id="big-climb"'))
assert(book.includes('never pull, force, or frighten'))
assert(book.includes('href="#try-big-climb"'))
assert(book.includes('href="/app"'))
console.log('PASS: built HTML, metadata, no-JS access, stable story ID, safety copy, production rewrites')
if (process.argv.includes('--static')) process.exit(0)

const browser = await chromium.launch({ headless: true })
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:4173'
const out = 'qa/evidence/story-pages'
await mkdir(out, { recursive: true })
try {
  for (const width of [320, 390, 768, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 844 }, javaScriptEnabled: false })
    const page = await context.newPage()
    for (const route of paths) {
      const response = await page.goto(base + route)
      assert.equal(response.status(), 200)
      await page.locator('h1').waitFor()
      assert.equal(await page.locator('h1').count(), 1)
      assert(await page.locator('body').evaluate(el => el.scrollWidth <= window.innerWidth), `Overflow at ${width}: ${route}`)
      assert(await page.locator('img').evaluateAll(imgs => imgs.every(img => img.complete && img.naturalWidth > 0)))
      assert.equal(await page.locator('a[href="/app"]').count(), 1)
      await page.screenshot({ path: `${out}/${width}-${route.endsWith('big-climb') ? 'book' : 'series'}.png`, fullPage: true })
      await page.reload()
      assert((await page.title()).includes('S.T. Carroll'))
    }
    await page.getByRole('link', { name: 'Try Bailey’s Big Climb', exact: true }).click()
    assert(new URL(page.url()).hash === '#try-big-climb')
    await page.getByRole('link', { name: 'Bailey & Omi', exact: true }).click()
    assert(new URL(page.url()).pathname.replace(/\/$/, '') === paths[0])
    await context.close()
    console.log(`PASS: ${width}px public routes, reload, images, no overflow, navigation, no JavaScript`)
  }
} finally { await browser.close() }
