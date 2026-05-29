import type { JourneyEntry, RecentAdventure } from '../data/demo'

export function buildRecentAdventuresFromJourney(
  entries: JourneyEntry[],
  limit = 3,
): RecentAdventure[] {
  return entries.slice(0, limit).map((entry) => ({
    placeId: entry.placeId ?? '',
    title: entry.place,
    tag: entry.tags[0] ? `${entry.tags[0]} · ${entry.date}` : entry.date,
    memoryLine: entry.magicLine ?? entry.emotionalLine,
    photoUrl: entry.photoUrls?.[0],
  }))
}
