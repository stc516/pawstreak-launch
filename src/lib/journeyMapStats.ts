import type { AppState } from '../data/demo'
import { buildJourneyMapPins } from '../data/journeyMapPins'

const DEMO_ADVENTURE_COUNT = 47
const DEMO_PLACE_COUNT = 22

export function getJourneyMapStats(state: AppState): {
  adventures: number
  places: number
  isEmpty: boolean
} {
  const hasVisiblePins = buildJourneyMapPins(state.journeyEntries).length > 0
  const hasSavedCounts = state.adventureCount > 0 || state.placeCount > 0

  if (hasVisiblePins && !hasSavedCounts) {
    return {
      adventures: DEMO_ADVENTURE_COUNT,
      places: DEMO_PLACE_COUNT,
      isEmpty: false,
    }
  }

  if (!hasSavedCounts && state.journeyEntries.length === 0) {
    return {
      adventures: 0,
      places: 0,
      isEmpty: true,
    }
  }

  return {
    adventures: state.adventureCount,
    places: state.placeCount,
    isEmpty: false,
  }
}
