import type { Place, PlaceCategory } from '../types/place'
import type { Dog } from '../data/demo'
import { getPackDisplayName } from './dogLabels'

const CATEGORY_LINES: Partial<Record<PlaceCategory, string>> = {
  Beach: 'Room to run · best for a bigger outing.',
  Trail: 'On-leash · good for a longer outing.',
  Coffee: 'Quick dog-friendly stop.',
  'Dog Park': 'Off-leash · best for high-energy dogs.',
  Park: 'Easy weekday adventure.',
  Patio: 'Dog-friendly stop · good for a calm outing.',
  Brewery: 'Patio stop · best for a settled dog.',
  Restaurant: 'Patio meal · good for a calm outing.',
  Gardens: 'Slow loop · good for a quieter day.',
  'Road trip': 'Bigger outing · plan extra time.',
  Neighborhood: 'Familiar route · easy everyday walk.',
}

export function getMagicLine(place: Place): string {
  if (place.popularNow) {
    return place.category === 'Dog Park'
      ? 'Likely busy · go early for calmer play.'
      : 'Likely busy · best with an early visit.'
  }

  if (place.energyLevel === 'High') {
    if (place.category === 'Road trip') {
      return 'Big adventure if they need to burn energy.'
    }
    if (place.category === 'Trail') {
      return CATEGORY_LINES.Trail ?? 'On-leash · good for a longer outing.'
    }
    return CATEGORY_LINES[place.category] ?? 'Best for a higher-energy outing.'
  }

  if (place.energyLevel === 'Low') {
    return CATEGORY_LINES[place.category] ?? 'Easy weekday adventure.'
  }

  if (
    place.tags.some((tag) =>
      ['quiet', 'calm', 'senior', 'flat', 'patio'].includes(tag),
    )
  ) {
    return 'Low crowd pick for a calmer day.'
  }

  if (place.featured) {
    return 'Perfect right now.'
  }

  return CATEGORY_LINES[place.category] ?? 'Dog-friendly outing.'
}

export function getHeroMagicSubtitle(place: Place, dogs: Dog[] = []): string {
  if (place.popularNow) {
    return `${place.distanceLabel} · Perfect right now`
  }

  if (place.featured) {
    return `${place.distanceLabel} · Worth getting out`
  }

  const welcome =
    dogs.length === 0
      ? 'Dog-friendly spot'
      : dogs.length === 1
        ? `${dogs[0].name} would love this`
        : `${getPackDisplayName(dogs)} welcome`

  return `${place.distanceLabel} · ${place.leashInfo} · ${welcome}`
}

export function getPlanMagicMeta(place: Place): string {
  const parts = [
    place.distanceLabel,
    place.leashInfo,
    ...getMagicLine(place)
      .replace(/\.$/, '')
      .split('·')
      .map((part) => part.trim()),
  ]
  const seen = new Set<string>()
  return parts
    .filter((part) => {
      if (!part) return false
      const key = part.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .join(' · ')
}
