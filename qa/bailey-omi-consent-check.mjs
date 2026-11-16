import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const book = readFileSync('bailey-and-omi/big-climb/index.html', 'utf8')
const series = readFileSync('bailey-and-omi/index.html', 'utf8')
const script = readFileSync('src/story-signup.ts', 'utf8')
const migration = readFileSync('supabase/migrations/023_book_news_consent.sql', 'utf8')
const css = readFileSync('public/bailey-and-omi/story.css', 'utf8')

for (const html of [book, series]) {
  assert.match(html, /name="book_news_consent" required/)
  assert.match(html, /I agree to receive occasional Bailey &amp; Omi book news/)
  assert.match(html, /mailto:hello@pawstreakapp\.com\?subject=Unsubscribe%20Bailey%20%26%20Omi/)
  assert.doesNotMatch(html, /Unsubscribe anytime/)
  assert.match(html, /<form data-book-news-form novalidate>/)
}
assert.match(book, /<a class="button" href="#availability-title">Find the book<\/a>/)
assert.match(book, /href="#try-big-climb">Try the family activity/)
assert.match(script, /if \(!consent\.checked\)/)
assert.match(script, /book_news_consent_version: '2026-11-v1'/)
assert.match(script, /if \(!email \|\| !consent \|\| !submit \|\| !status\)/)
assert.match(migration, /waitlist_signups_source_email_ci_idx/)
assert.match(migration, /book_news_consented_at := now\(\)/)
assert.match(migration, /drop index if exists public\.waitlist_signups_email_idx/)
assert.match(css, /\.consent-row input\[type=checkbox\]/)
console.log('PASS: explicit opt-in markup, consent payload, source-scoped SQL proposal, and purchase CTA. Database migration is NOT applied.')
