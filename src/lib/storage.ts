import { defaultAppState, type ActiveAdventure, type AppState } from '../data/demo'
import { normalizePhotoSlots } from '../lib/imageUtils'
import { resolvePlaceFromAdventure } from '../data/places'
import { EMPTY_CURATED_PLAN_DRAFT, type LegacyCuratedPlanDraft } from '../lib/curatedPlan'

const STORAGE_KEY = 'pawstreak:app'

function normalizeActiveAdventure(
  adventure: ActiveAdventure | { location: string; placeId?: string; started?: boolean } | null,
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
    started: adventure.started ?? false,
  }
}

function normalizeCuratedDraft(
  draft: LegacyCuratedPlanDraft | AppState['curatedPlanDraft'] | undefined,
): AppState['curatedPlanDraft'] {
  const base = (draft ?? EMPTY_CURATED_PLAN_DRAFT) as LegacyCuratedPlanDraft
  const optimizeIds =
    base.optimizeIds && base.optimizeIds.length > 0
      ? base.optimizeIds
      : base.optimizeId
        ? [base.optimizeId]
        : []

  return {
    optimizeIds,
    timeId: base.timeId ?? null,
    loveIds: base.loveIds ?? [],
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
    selectedAchievementId: rest.selectedAchievementId ?? null,
    showCommunityCompose: rest.showCommunityCompose ?? false,
    curatedPlanFlowStep: rest.curatedPlanFlowStep ?? 0,
    curatedPlanDraft: normalizeCuratedDraft(rest.curatedPlanDraft),
    curatedPlanResult: rest.curatedPlanResult ?? null,
    randomPlanResult: rest.randomPlanResult ?? null,
    showPresetPlanOverlay: rest.showPresetPlanOverlay ?? false,
    adventurePhotos: normalizePhotoSlots(rest.adventurePhotos),
    activeAdventure: normalizeActiveAdventure(rest.activeAdventure),
    memorySaveToast: rest.memorySaveToast ?? null,
    communityPosts: (rest.communityPosts ?? defaultAppState.communityPosts).map(
      (post) => ({
        ...post,
        likedByUser: post.likedByUser ?? false,
        commentList: post.commentList ?? [],
      }),
    ),
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
