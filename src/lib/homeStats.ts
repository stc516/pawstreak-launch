import type { AppState } from '../data/demo'

/** Featured quest on Home — links to existing Milestones challenge detail. */
export const SAN_DIEGO_BEACH_QUEST = {
  challengeId: 'san-diego-beach-quest',
  title: 'San Diego Beach Quest',
  subtitle: '8 beach visits · build your coastal map',
  total: 8,
  placeIds: [
    'dog-beach-ocean-beach',
    'fiesta-island',
    'coronado-dog-beach',
    'del-mar-dog-beach',
    'la-jolla-shores',
    'huntington-dog-beach',
    'newport-dog-beach',
  ] as string[],
  imageUrl: '/sample-images/beach.jpg',
} as const

export function getBeachQuestProgress(state: AppState): {
  completed: number
  total: number
  fillWidth: string
} {
  const questIds = new Set(SAN_DIEGO_BEACH_QUEST.placeIds)
  const completedIds = new Set(
    state.journeyEntries
      .map((entry) => entry.placeId)
      .filter((placeId): placeId is string => Boolean(placeId && questIds.has(placeId))),
  )

  const completed = Math.min(completedIds.size, SAN_DIEGO_BEACH_QUEST.total)
  const total = SAN_DIEGO_BEACH_QUEST.total
  const percent = Math.round((completed / total) * 100)

  return {
    completed,
    total,
    fillWidth: `${percent}%`,
  }
}

export function getHomeProgressStats(state: AppState) {
  return {
    streak: state.streak,
    adventuresCompleted: state.adventureCount,
    memoriesSaved: state.journeyEntries.length,
  }
}
