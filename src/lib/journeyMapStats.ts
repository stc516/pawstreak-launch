import type { AppState } from '../data/demo'
import { buildJourneyMapPins } from '../data/journeyMapPins'

const DEMO_ADVENTURE_COUNT = 47
const DEMO_PLACE_COUNT = 22

export function getJourneyMapStats(state: AppState): {
  adventures: number
  places: number
} {
  const hasVisiblePins = buildJourneyMapPins(state.journeyEntries).length > 0

  if (hasVisiblePins && (state.adventureCount === 0 || state.placeCount === 0)) {
    return {
      adventures: DEMO_ADVENTURE_COUNT,
      places: DEMO_PLACE_COUNT,
    }
  }

  return {
    adventures: state.adventureCount,
    places: state.placeCount,
  }
}
