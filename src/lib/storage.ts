import { defaultAppState, type ActiveAdventure, type AppState } from '../data/demo'
import { normalizePhotoSlots } from '../lib/imageUtils'
import { resolvePlaceFromAdventure } from '../data/places'
import { EMPTY_CURATED_PLAN_DRAFT } from '../lib/curatedPlan'

const STORAGE_KEY = 'pawstreak:app'

function normalizeActiveAdventure(
  adventure: ActiveAdventure | { location: string; placeId?: string } | null,
): ActiveAdventure | null {
  if (!adventure) return null

  const place = resolvePlaceFromAdventure(adventure)
  return {
    placeId: place.id,
    location: place.name,
    durationLabel:
      'durationLabel' in adventure && adventure.durationLabel
        ? adventure.durationLabel
        : 'Open end',
  }
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
    selectedChallengeId: rest.selectedChallengeId ?? null,
    curatedPlanFlowStep: rest.curatedPlanFlowStep ?? 0,
    curatedPlanDraft: rest.curatedPlanDraft ?? EMPTY_CURATED_PLAN_DRAFT,
    curatedPlanResult: rest.curatedPlanResult ?? null,
    randomPlanResult: rest.randomPlanResult ?? null,
    showPresetPlanOverlay: rest.showPresetPlanOverlay ?? false,
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
