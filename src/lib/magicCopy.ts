import type { Place, PlaceCategory } from '../types/place'

const CATEGORY_LINES: Partial<Record<PlaceCategory, string>> = {
  Beach: 'Beach day energy — worth getting out.',
  Trail: 'Trail day — worth getting out.',
  Coffee: 'Easy win for a short outing.',
  'Dog park': 'Popular with the pack right now.',
  Park: 'Low crowd pick for a calmer day.',
  Brewery: 'Perfect right now for a patio stop.',
  Gardens: 'Best window today for a slow loop.',
  'Road trip': 'Big adventure if they need to burn energy.',
  Neighborhood: 'Easy win for a short outing.',
}

export function getMagicLine(place: Place): string {
  if (place.popularNow) {
    return 'Popular with the pack right now.'
  }

  if (place.energyLevel === 'High') {
    if (place.category === 'Road trip') {
      return 'Big adventure if they need to burn energy.'
    }
    if (place.category === 'Trail') {
      return 'Trail day — worth getting out.'
    }
    return 'Worth getting out for a big run.'
  }

  if (place.energyLevel === 'Low') {
    return 'Easy win for a short outing.'
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

  return CATEGORY_LINES[place.category] ?? 'Worth getting out.'
}

export function getHeroMagicSubtitle(place: Place): string {
  if (place.popularNow) {
    return `${place.distanceLabel} · Perfect right now`
  }

  if (place.featured) {
    return `${place.distanceLabel} · Worth getting out`
  }

  return `${place.distanceLabel} · ${place.leashInfo} · Both dogs welcome`
}

export function getPlanMagicMeta(place: Place): string {
  const base = `${place.distanceLabel} · ${place.leashInfo}`
  const magic = getMagicLine(place).replace(/\.$/, '')
  return `${base} · ${magic}`
}
