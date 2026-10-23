import type { AppState } from '../data/demo'
import { getDistinctPlaceKey } from './customAdventure'

export function getJourneyMapStats(state: AppState): {
  adventures: number
  places: number
  isEmpty: boolean
} {
  const entries = state.journeyEntries
  const isEmpty = entries.length === 0

  return {
    adventures: entries.length,
    places: new Set(entries.map(getDistinctPlaceKey)).size,
    isEmpty,
  }
}
