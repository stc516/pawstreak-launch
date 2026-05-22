import type { JourneyEntry } from '../data/demo'

export function filterJourneyEntries(
  entries: JourneyEntry[],
  filterId: string,
): JourneyEntry[] {
  if (filterId === 'all' || filterId === 'map-view') {
    return entries
  }

  if (filterId === 'beach') {
    return entries.filter((entry) =>
      entry.tags.some((tag) => tag.toLowerCase().includes('beach')),
    )
  }

  if (filterId === 'trail') {
    return entries.filter((entry) =>
      entry.tags.some((tag) => tag.toLowerCase().includes('trail')),
    )
  }

  if (filterId === 'road-trips') {
    return entries.filter((entry) =>
      entry.tags.some((tag) => tag.toLowerCase().includes('road trip')),
    )
  }

  return entries
}

export function getJourneyFilterEmptyMessage(filterId: string): string | null {
  if (filterId === 'beach') {
    return 'No beach memories saved yet. Pick a beach spot from Plan and start building the map.'
  }
  if (filterId === 'trail') {
    return 'No trail memories saved yet. Pick a trail from Plan and start building the map.'
  }
  if (filterId === 'road-trips') {
    return 'No road trips saved yet. Pick one from Plan and start building the map.'
  }
  return null
}
