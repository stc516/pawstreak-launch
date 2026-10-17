import assert from 'node:assert/strict'
import type { Dog } from '../src/data/demo'
import {
  buildUnavailablePlaceMemoryPayload,
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

const serverPayload = buildUnavailablePlaceMemoryPayload({
  placeId: activeAdventure.placeId,
  placeName: activeAdventure.location,
  dogs: [dog],
  durationLabel: '15 min',
  recapLabels: ['Loved every second'],
})
assert.equal(serverPayload.place_id, retiredPlaceId)
assert.equal(serverPayload.place_name, savedLocation)
assert.equal(serverPayload.duration_label, '15 min')
assert.deepEqual(serverPayload.recap_labels, ['Loved every second'])
assert.deepEqual(serverPayload.tags, ['Adventure'])

console.log('[PASS] retired-place-hydration: original place ID and label survive reload')
console.log('[PASS] retired-place-memory: completion creates a local Journey memory without a dead catalog link')
console.log('[PASS] retired-place-server-memory: recovery keeps original place ID and label for persistent save')
