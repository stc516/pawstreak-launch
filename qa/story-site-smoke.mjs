import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

async function readDist(relativePath) {
  return readFile(path.join(rootDir, 'dist', relativePath), 'utf8')
}

function assertIncludes(source, expected, label) {
  if (!source.includes(expected)) {
    throw new Error(`${label} is missing ${JSON.stringify(expected)}`)
  }

  console.log(`[PASS] ${label}`)
}

const [series, bigClimb, robots, sitemap] = await Promise.all([
  readDist('bailey-and-omi/index.html'),
  readDist('bailey-and-omi/big-climb/index.html'),
  readDist('robots.txt'),
  readDist('sitemap.xml'),
])

for (const [label, html] of [
  ['Bailey & Omi series page', series],
  ["Bailey's Big Climb page", bigClimb],
]) {
  assertIncludes(html, 'assets/story-signup-', `${label} loads the book-news signup bundle`)
  assertIncludes(html, 'data-book-news-form', `${label} renders the book-news form`)
}

assertIncludes(bigClimb, 'https://www.amazon.com/dp/B0HMDMQ4Y3', 'Big Climb links the Kindle edition')
assertIncludes(bigClimb, 'https://www.amazon.com/dp/B0HMFT1R5P', 'Big Climb links the paperback edition')
assertIncludes(bigClimb, 'https://pawstreakapp.com/bailey-and-omi/big-climb', 'Big Climb declares its canonical URL')
assertIncludes(bigClimb, 'application/ld+json', 'Big Climb includes structured book data')
assertIncludes(robots, 'Sitemap: https://pawstreakapp.com/sitemap.xml', 'robots.txt advertises the sitemap')
assertIncludes(sitemap, '<loc>https://pawstreakapp.com/bailey-and-omi</loc>', 'Sitemap includes the series page')
assertIncludes(sitemap, '<loc>https://pawstreakapp.com/bailey-and-omi/big-climb</loc>', 'Sitemap includes the book page')
