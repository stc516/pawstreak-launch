import assert from 'node:assert/strict'
import type { Dog } from '../src/data/demo'
import {
  createJourneyEntryFromUnavailablePlace,
  resolveCatalogAdventureIdentity,
} from '../src/lib/unavailablePlaceRecovery'

const savedLocation = 'Saved Seaside Trail'
const retiredPlaceId = 'retired-seaside-trail'
const activeAdventure = resolveCatalogAdventureIdentity({
  placeId: retiredPlaceId,
  location: savedLocation,
})

assert.equal(activeAdventure.placeId, retiredPlaceId)
assert.equal(activeAdventure.location, savedLocation)

const dog: Dog = {
  id: 'qa-dog',
  name: 'Scout',
  initial: 'S',
  avatarClass: 'da-b',
  profileEmoji: '🐕',
  breed: 'Mixed breed',
  circleClass: 'dc-b',
}
const memory = createJourneyEntryFromUnavailablePlace(savedLocation, [dog], {
  durationLabel: '15 min',
  recapLabels: ['Loved every second'],
})

assert.equal(memory.place, savedLocation)
assert.equal(memory.placeId, undefined, 'a retired catalog ID must not create a dead Go again action')
assert.equal(memory.durationLabel, '15 min')
assert.deepEqual(memory.recapLabels, ['Loved every second'])

console.log('[PASS] retired-place-hydration: original place ID and label survive reload')
console.log('[PASS] retired-place-memory: completion creates a memory without a dead catalog link')
