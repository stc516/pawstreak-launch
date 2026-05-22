import type { Dog } from '../data/demo'
import { dogNamesLabel } from '../data/demo'
import { PLACES } from '../data/places'

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

export function generateRandomPlan(dogs: Dog[]): RandomPlanResult {
  const spots = pickRandom(PLACES, 3)
  const types = pickRandom(ADVENTURE_TYPES, 3)

  return {
    title: `${dogNamesLabel(dogs)}'s Surprise Plan`,
    emotionalCopy: pickRandom(RANDOM_COPY, 1)[0]!,
    weeklyCadence: '3 surprise outings per week · mix of familiar and new',
    adventureTypes: types,
    recommendedSpots: spots.map((place) => ({
      name: place.name,
      reason: place.whyDogsLoveIt,
    })),
    savedAt: new Date().toISOString(),
  }
}
