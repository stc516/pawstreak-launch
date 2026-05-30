import type { AppState } from '../data/demo'
import { getFeaturedChallenge } from './challengeEngine'

export function getHomeProgressStats(state: AppState) {
  return {
    streak: state.streak,
    adventuresCompleted: state.adventureCount,
    memoriesSaved: state.journeyEntries.length,
    places: state.placeCount,
  }
}

export { getFeaturedChallenge }
