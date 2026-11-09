import test from 'node:test'
import assert from 'node:assert/strict'
import { reconcileSelectedDogMemories } from '../src/lib/selectedDogMemoryState.ts'

const key = (entry) => entry.placeKey

function state(activeDogId, journeyEntries = []) {
  return { activeDogId, journeyEntries, adventureCount: journeyEntries.length, placeCount: 99 }
}

test('ignores A response when B is now selected (even if A finishes last)', () => {
  const aEntries = [{ placeKey: 'dog-park' }]
  const bEntries = [{ placeKey: 'trail' }, { placeKey: 'trail' }]
  const current = { ...state('b'), ...reconcileSelectedDogMemories(state('b'), 'b', bEntries, key) }
  const afterLateA = reconcileSelectedDogMemories(current, 'a', aEntries, key)
  assert.equal(afterLateA, current, 'stale requests must not replace the new dog\'s state')
  assert.deepEqual(afterLateA.journeyEntries, bEntries)
  assert.equal(afterLateA.placeCount, 1)
})

test('updates both counts from only the currently selected dog', () => {
  const entries = [
    { placeKey: 'beach' },
    { placeKey: 'beach' },
    { placeKey: 'trail' },
  ]
  const result = reconcileSelectedDogMemories(state('b'), 'b', entries, key)
  assert.equal(result.adventureCount, 3)
  assert.equal(result.placeCount, 2)
  assert.deepEqual(result.journeyEntries, entries)
})

test('empty new-dog Journey clears the old place count', () => {
  const result = reconcileSelectedDogMemories(state('b', [{ placeKey: 'park' }]), 'b', [], key)
  assert.equal(result.adventureCount, 0)
  assert.equal(result.placeCount, 0)
  assert.deepEqual(result.journeyEntries, [])
})

test('ignores stale requests after signout', () => {
  const current = state(null, [])
  assert.equal(reconcileSelectedDogMemories(current, 'b', [{ placeKey: 'park' }], key), current)
})
