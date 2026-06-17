import type { AppState, Dog } from '../data/demo'
import { dogNamesLabel } from '../data/demo'
import { PLACES } from '../data/places'
import { GENERIC_ADVENTURE_TYPES } from './genericAdventures'

export interface RandomPlanResult {
  title: string
  emotionalCopy: string
  weeklyCadence: string
  adventureTypes: string[]
  recommendedSpots: { name: string; reason: string }[]
  savedAt: string
}

const RANDOM_COPY = [
  'Surprise keeps tails high. A little randomness goes a long way.',
  'Not knowing what is next is half the fun — new smells, same happy dogs.',
  'Mix familiar loops with one wild card each week. That is how streaks stay alive.',
]

const ADVENTURE_TYPES = [
  'Beach mornings',
  'Trail loops',
  'Neighborhood sniffaris',
  'Cafe patio stops',
  'Dog park socials',
  'Road trip day escapes',
]

function pickRandom<T>(items: T[], count: number): T[] {
  const pool = [...items]
  const picked: T[] = []

  while (picked.length < count && pool.length > 0) {
    const index = Math.floor(Math.random() * pool.length)
    picked.push(pool.splice(index, 1)[0]!)
  }

  return picked
}

export function generateRandomPlan(dogsOrState: Dog[] | AppState): RandomPlanResult {
  const dogs = Array.isArray(dogsOrState) ? dogsOrState : dogsOrState.dogs
  const supported = Array.isArray(dogsOrState) ? true : dogsOrState.locationSupported
  const localPool = supported
    ? PLACES.filter((place) => place.category !== 'Road trip')
    : []
  const spots = pickRandom(localPool, 3)
  const types = pickRandom(ADVENTURE_TYPES, 3)

  return {
    title: `${dogNamesLabel(dogs)}'s Surprise Plan`,
    emotionalCopy: pickRandom(RANDOM_COPY, 1)[0]!,
    weeklyCadence: '3 surprise outings per week · mix of familiar and new',
    adventureTypes: types,
    recommendedSpots: supported
      ? spots.map((place) => ({
          name: place.name,
          reason: place.whyDogsLoveIt,
        }))
      : pickRandom(GENERIC_ADVENTURE_TYPES, 3).map((type) => ({
          name: type.label,
          reason: type.prompt,
        })),
    savedAt: new Date().toISOString(),
  }
}
