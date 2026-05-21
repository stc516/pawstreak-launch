import { defaultAppState, type ActiveAdventure, type AppState } from '../data/demo'
import { normalizePhotoSlots } from '../lib/imageUtils'
import { resolvePlaceFromAdventure } from '../data/places'

const STORAGE_KEY = 'pawstreak:app'

function normalizeActiveAdventure(
  adventure: ActiveAdventure | { location: string; placeId?: string } | null,
): ActiveAdventure | null {
  if (!adventure) return null

  const place = resolvePlaceFromAdventure(adventure)
  return { placeId: place.id, location: place.name }
}

function normalizeAppState(state: AppState): AppState {
  const { heroSpot: _heroSpot, planPlaces: _planPlaces, ...rest } =
    state as AppState & {
      heroSpot?: unknown
      planPlaces?: unknown
    }

  return {
    ...rest,
    selectedMonthlyPlanId: rest.selectedMonthlyPlanId ?? null,
    selectedJourneyEntryId: rest.selectedJourneyEntryId ?? null,
    adventurePhotos: normalizePhotoSlots(rest.adventurePhotos),
    activeAdventure: normalizeActiveAdventure(rest.activeAdventure),
  }
}

export function loadAppState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return defaultAppState
    }
    return normalizeAppState({
      ...defaultAppState,
      ...JSON.parse(raw),
    } as AppState)
  } catch {
    return defaultAppState
  }
}

export function saveAppState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}
