import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { createServer } from 'vite'

// Vite supplies the same import.meta.env semantics as the application.
const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
try {
  const { authenticImageUrl } = await vite.ssrLoadModule('/src/lib/authenticImages.ts')
  const { hasValidCoordinates } = await vite.ssrLoadModule('/src/lib/geographicCoordinates.ts')
  const { resolveJourneyEntryDisplayImage, resolveAdventureDisplayImage } = await vite.ssrLoadModule('/src/lib/adventureDisplayImage.ts')
  const { defaultAppState } = await vite.ssrLoadModule('/src/data/demo.ts')
  const { PLACES } = await vite.ssrLoadModule('/src/data/places.ts')
  const { buildJourneyMapPins } = await vite.ssrLoadModule('/src/data/journeyMapPins.ts')
  const { getJourneyMapStats } = await vite.ssrLoadModule('/src/lib/journeyMapStats.ts')
  const { getJourneyMapSummary, sanitizeProductionAppState } = await vite.ssrLoadModule('/src/lib/productionState.ts')
  const { buildSocialStudioCatalog } = await vite.ssrLoadModule('/src/lib/socialStudioCatalog.ts')
  const { buildShareCardData } = await vite.ssrLoadModule('/src/lib/shareCardData.ts')
  for (const url of ['/sample-images/beach.jpg', 'https://pawstreakapp.com/sample-images/coastal.jpg', 'https://images.unsplash.com/test']) assert.equal(authenticImageUrl(url), undefined)
  const photo = 'https://example.com/user-upload.jpg'
  assert.equal(authenticImageUrl(photo), photo)
  assert.equal(authenticImageUrl('data:image/png;base64,test'), 'data:image/png;base64,test')
  const entry = { id: 'real-memory', placeId: PLACES[0].id, place: PLACES[0].name, date: 'Today', tags: ['Beach'] }
  const other = { ...entry, id: 'other-memory', photoUrls: [photo] }
  assert.equal(resolveJourneyEntryDisplayImage([other], entry).imageUrl, undefined, 'Never borrow another memory photo')
  assert.equal(resolveJourneyEntryDisplayImage([], other).imageUrl, photo, 'Keep the user photo')
  assert.equal(resolveJourneyEntryDisplayImage([], { ...entry, photoUrls: ['/sample-images/beach.jpg', photo] }).imageUrl, photo)
  assert.equal(resolveAdventureDisplayImage([other], { ...PLACES[0], imageUrl: undefined }).imageUrl, undefined)
  assert.equal(resolveAdventureDisplayImage([], { ...PLACES[0], imageUrl: photo }).imageUrl, photo)
  assert.ok(PLACES.every(place => !place.imageUrl?.includes('/sample-images/')))
  assert.ok(hasValidCoordinates({ lat: 32.7, lng: -117.2 }))
  for (const point of [{ lat: NaN, lng: 0 }, { lat: 91, lng: 0 }, { lat: 0, lng: 181 }, { lng: 0 }, { lat: 0, lng: Infinity }]) assert.equal(hasValidCoordinates(point), false)
  const pins = buildJourneyMapPins([entry, other, { ...entry, id: 'unknown', placeId: 'not-in-catalog' }])
  assert.equal(pins.length, 1)
  assert.equal(pins[0].lat, PLACES[0].lat)
  assert.equal(pins[0].lng, PLACES[0].lng)
  assert.equal('top' in pins[0], false, 'No fabricated screen coordinates')
  const state = { ...structuredClone(defaultAppState), adventureCount: 47, placeCount: 22, journeyEntries: [entry, other] }
  assert.deepEqual(getJourneyMapStats(state), { adventures: 2, places: 1, isEmpty: false })
  assert.equal(getJourneyMapSummary(state).title, '2 adventures saved')
  assert.equal(sanitizeProductionAppState(state).placeCount, 1)
  const shareWithoutPhoto = buildShareCardData(state, { kind: 'adventure-complete', entryId: entry.id })
  assert.equal(shareWithoutPhoto.imageUrl, undefined)
  assert.equal(shareWithoutPhoto.photoCount, 0)
  assert.equal(buildShareCardData(state, { kind: 'adventure-complete', entryId: other.id }).imageUrl, photo)
  const custom = { ...state, journeyEntries: [{ ...entry, placeId: 'custom-adventure', place: 'My beach' }, { ...other, placeId: 'custom-adventure', place: 'My park' }] }
  assert.equal(getJourneyMapStats(custom).places, 2)
  assert.ok(buildSocialStudioCatalog().every(item => item.assetPath.startsWith('approved/')), 'Historical exports must not return to Content Studio')
  assert.equal(existsSync('public/sample-images'), false, 'Retired pictures must not ship')
  assert.ok(!readFileSync('supabase/seed/places.sql', 'utf8').includes('/sample-images/'))
  console.log('[PASS] Visual integrity: authentic photos, exact coordinates, honest counts, retired media excluded')
} finally {
  await vite.close()
}
