import assert from 'node:assert/strict'
import test from 'node:test'
import type { ActiveAdventure, AppState, Dog } from '../src/data/demo'
import {
  getActiveAdventureParticipants,
  getActiveAdventureParticipantLabel,
  getActiveAdventureOutLabel,
} from '../src/lib/activeAdventureParticipants'

const dogs = [
  { id: 'bailey', name: 'Bailey' },
  { id: 'omi', name: 'Omi' },
  { id: 'other', name: 'Scout' },
] as Dog[]

const state = { onboardingComplete: true, dogs } as AppState
const adventure = (selectedDogIds?: string[], dogId?: string) =>
  ({ selectedDogIds, dogId } as ActiveAdventure)

test('one selected dog never displays the other dogs in the active hero or finish payoff', () => {
  const result = getActiveAdventureParticipants(state, adventure(['omi']))
  assert.deepEqual(result.map((dog) => dog.name), ['Omi'])
  assert.equal(getActiveAdventureParticipantLabel(result), 'Omi')
  assert.equal(getActiveAdventureOutLabel(result), 'Omi is out')
})

test('two selected dogs retain selected profile order and singular/plural grammar', () => {
  const result = getActiveAdventureParticipants(state, adventure(['omi', 'bailey']))
  assert.deepEqual(result.map((dog) => dog.name), ['Bailey', 'Omi'])
  assert.equal(getActiveAdventureOutLabel(result), 'Bailey + Omi are out')
})

test('legacy single-dog adventures respect dogId when selectedDogIds is missing', () => {
  assert.deepEqual(
    getActiveAdventureParticipants(state, adventure(undefined, 'bailey')).map((dog) => dog.id),
    ['bailey'],
  )
  assert.deepEqual(
    getActiveAdventureParticipants(state, adventure([], 'omi')).map((dog) => dog.id),
    ['omi'],
  )
})

test('legacy adventures without a selection still display the profile pack', () => {
  assert.deepEqual(
    getActiveAdventureParticipants(state, adventure()).map((dog) => dog.id),
    ['bailey', 'omi', 'other'],
  )
})

test('unknown selected dog IDs do not falsely show a different dog', () => {
  const result = getActiveAdventureParticipants(state, adventure(['removed-dog']))
  assert.deepEqual(result, [])
  assert.equal(getActiveAdventureParticipantLabel(result), 'your dog')
  assert.equal(getActiveAdventureOutLabel(result), 'Adventure in progress')
})

test('missing adventure or unfinished onboarding has no participating dog avatars', () => {
  assert.deepEqual(getActiveAdventureParticipants(state, null), [])
  assert.deepEqual(
    getActiveAdventureParticipants({ ...state, onboardingComplete: false }, adventure(['bailey'])),
    [],
  )
})
