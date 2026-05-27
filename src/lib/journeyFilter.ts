import type { JourneyEntry } from '../data/demo'

export interface JourneyFilterEmptyState {
  title: string
  body: string
  cta: string
}

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

export function getJourneyFilterEmptyState(
  filterId: string,
): JourneyFilterEmptyState | null {
  if (filterId === 'beach') {
    return {
      title: 'No beach memories saved yet',
      body: 'Plan a beach day this weekend and this map starts filling in.',
      cta: 'Find an adventure',
    }
  }
  if (filterId === 'trail') {
    return {
      title: 'No trail memories saved yet',
      body: 'Pick a trail from Plan and this list starts filling in.',
      cta: 'Find an adventure',
    }
  }
  if (filterId === 'road-trips') {
    return {
      title: 'No road trips saved yet',
      body: 'Plan one this weekend and this map starts filling in.',
      cta: 'Find an adventure',
    }
  }
  if (filterId === 'all') {
    return {
      title: 'Your first memory will appear here',
      body: 'Your first memory will appear here after an adventure.',
      cta: 'Find an adventure',
    }
  }
  return null
}

/** @deprecated Use getJourneyFilterEmptyState */
export function getJourneyFilterEmptyMessage(filterId: string): string | null {
  const emptyState = getJourneyFilterEmptyState(filterId)
  if (!emptyState) return null
  return `${emptyState.title}. ${emptyState.body}`
}
