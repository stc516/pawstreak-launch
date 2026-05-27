import type { AppState } from '../data/demo'
import { buildJourneyMapPins } from '../data/journeyMapPins'

export function getJourneyMapStats(state: AppState): {
  adventures: number
  places: number
  isEmpty: boolean
} {
  const pins = buildJourneyMapPins(state.journeyEntries)
  const isEmpty = pins.length === 0

  return {
    adventures: state.adventureCount,
    places: state.placeCount,
    isEmpty,
  }
}
