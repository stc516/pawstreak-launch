import assert from 'node:assert/strict'
import { getHeroFitLine } from '../src/lib/homeCopy.ts'

const bailey = [{ id: 'bailey', name: 'Bailey' }]
const pack = [
  { id: 'bailey', name: 'Bailey' },
  { id: 'omi', name: 'Meiomi' },
]

function place(category, leashInfo, whyDogsLoveIt = 'Curated description') {
  return { category, leashInfo, whyDogsLoveIt }
}

// A beach may be dog-friendly only during certain hours or on a leash.
// Category alone must never produce an off-leash recommendation.
const leashed = getHeroFitLine(place('Beach', 'On-leash'), pack)
assert.match(leashed, /Bailey \+ Meiomi/)
assert.match(leashed, /listed on-leash/i)
assert.doesNotMatch(leashed, /off-leash/i)
assert.match(leashed, /check current access hours/i)

const unleashed = getHeroFitLine(place('Beach', 'Off-leash area'), bailey)
assert.match(unleashed, /listed off-leash/i)
assert.match(unleashed, /check posted rules/i)

const unspecified = getHeroFitLine(place('Beach', 'Verify posted rules'), bailey)
assert.match(unspecified, /check current dog-access and leash rules/i)
assert.doesNotMatch(unspecified, /listed off-leash/i)

// Complex/seasonal rule descriptions must not be silently simplified.
const seasonal = getHeroFitLine(place('Beach', 'Off-leash in winter only'), bailey)
assert.match(seasonal, /check current dog-access and leash rules/i)
assert.doesNotMatch(seasonal, /listed off-leash/i)

// Suggestions should not assert unverified amenities or travel time.
const park = getHeroFitLine(place('Park', 'On-leash'), bailey)
assert.doesNotMatch(park, /shaded|close by/i)
const coffee = getHeroFitLine(place('Coffee', 'Patio-friendly'), bailey)
assert.match(coffee, /confirm current outdoor dog rules/i)
assert.doesNotMatch(coffee, /close by/i)

// Custom places retain their authored description; empty profiles stay generic.
assert.equal(getHeroFitLine(place('Custom', '', 'Our favorite loop'), bailey), 'Our favorite loop')
assert.match(getHeroFitLine(place('Beach', 'On-leash'), []), /your dog/)

console.log('PASS: Home adventure fit copy honors leash uncertainty and pack names')
