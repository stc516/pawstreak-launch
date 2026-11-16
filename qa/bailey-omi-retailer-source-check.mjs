// Book 1 metadata integrity check — does not contact retailers or prove live availability.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const book = readFileSync('bailey-and-omi/big-climb/index.html', 'utf8')
const series = readFileSync('bailey-and-omi/index.html', 'utf8')

function structuredData(html) {
  const block = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)
  assert.ok(block, 'JSON-LD block exists')
  return JSON.parse(block[1])
}
const bookData = structuredData(book)
const seriesData = structuredData(series)

assert.equal(bookData['@type'], 'Book')
assert.equal(bookData.name, 'Bailey’s Big Climb')
assert.equal(bookData.author.name, 'S.T. Carroll')
assert.equal(bookData.isbn, '9798160563947')
assert.equal(seriesData.hasPart.isbn, bookData.isbn)

assert.match(book, /https:\/\/www\.amazon\.com\/dp\/B0HMFT1R5P/)
assert.match(book, /https:\/\/www\.amazon\.com\/dp\/B0HMDMQ4Y3/)
assert.match(series, /https:\/\/www\.amazon\.com\/dp\/B0HMFT1R5P/)
assert.match(series, /https:\/\/www\.amazon\.com\/dp\/B0HMDMQ4Y3/)
assert.match(book, /watercolor scene illustration from Bailey’s Big Climb/)
assert.doesNotMatch(book, /on the cover of Bailey’s Big Climb/)
assert.doesNotMatch(book, /\$3\.99|\$12\.99/)
assert.doesNotMatch(book + series, /"@type":"Offer"|"aggregateRating"|"review"/)

assert.match(book, /<form data-book-news-form novalidate>/)
assert.match(series, /<form data-book-news-form novalidate>/)
assert.match(book, /<a class="button" href="https:\/\/www\.amazon\.com\/dp\/B0HMFT1R5P"/)

console.log('Bailey & Omi Book 1 source integrity checks passed. Retailer availability still requires independent buyer verification.')
