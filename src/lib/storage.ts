import {
  createDemoOnboardingState,
  createSeededDemoState,
  defaultAppState,
  type ActiveAdventure,
  type AppMode,
  type AppState,
} from '../data/demo'
import { normalizePhotoSlots } from '../lib/imageUtils'
import { resolvePlaceFromAdventure } from '../data/places'
import { EMPTY_CURATED_PLAN_DRAFT, type LegacyCuratedPlanDraft } from '../lib/curatedPlan'
import { DEFAULT_PACK_ACCESS_MEMBERS } from '../data/packAccess'
import { isDefaultDemoDogs } from './dogLabels'
import { personalizeAppContentForDogs } from './personalizeContent'
import { createProductionInitialState } from './appDataSync'
import type { DemoRoute } from './demoRoute'

const APP_STORAGE_KEY = 'pawstreak:app'
const DEMO_STORAGE_KEY = 'pawstreak:demo'

export function getAppModeFromPath(pathname = window.location.pathname): AppMode {
  return pathname === '/demo' || pathname.startsWith('/demo/') ? 'demo' : 'app'
}

function getStorageKey(mode: AppMode): string {
  return mode === 'demo' ? DEMO_STORAGE_KEY : APP_STORAGE_KEY
}

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

function normalizeCommunityLive(
  live: AppState['communityLive'] | undefined,
): AppState['communityLive'] {
  const defaults = defaultAppState.communityLive
  const legacy = live as AppState['communityLive'] & { subtitle?: string }

  return {
    ...defaults,
    ...live,
    count: live?.count?.replace(/\s*dogs out now/i, '') ?? defaults.count,
    countLabel: live?.countLabel ?? defaults.countLabel,
    tagline: live?.tagline ?? defaults.tagline,
    topSpot:
      live?.topSpot ??
      legacy?.subtitle?.replace(/^Top spot:\s*/i, '') ??
      defaults.topSpot,
    topSpotNote: live?.topSpotNote ?? defaults.topSpotNote,
    chips: live?.chips?.length ? live.chips : defaults.chips,
  }
}

function normalizeAppState(state: AppState, mode: AppMode): AppState {
  const { heroSpot: _heroSpot, planPlaces: _planPlaces, ...rest } =
    state as AppState & {
      heroSpot?: unknown
      planPlaces?: unknown
    }

  let normalized: AppState = {
    ...rest,
    mode,
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
    showJourneyMapOverlay: rest.showJourneyMapOverlay ?? false,
    showJourneyLevelOverlay: rest.showJourneyLevelOverlay ?? false,
    adventurePhotos: normalizePhotoSlots(rest.adventurePhotos),
    activeAdventure: normalizeActiveAdventure(rest.activeAdventure),
    memorySaveToast: rest.memorySaveToast ?? null,
    zipCode: rest.zipCode ?? '',
    locationQuery: rest.locationQuery ?? defaultAppState.locationQuery,
    locationLabel: rest.locationLabel ?? defaultAppState.locationLabel,
    locationSupported: rest.locationSupported ?? defaultAppState.locationSupported,
    userName: rest.userName ?? '',
    dogVibeNames: rest.dogVibeNames ?? [],
    onboardingCategoryIds: rest.onboardingCategoryIds ?? [],
    hasUserDogProfile: rest.hasUserDogProfile ?? false,
    packAccessMembers: rest.packAccessMembers ?? DEFAULT_PACK_ACCESS_MEMBERS,
    showPackInviteOverlay: rest.showPackInviteOverlay ?? false,
    packAccessToast: rest.packAccessToast ?? null,
    communityPosts: (rest.communityPosts ?? defaultAppState.communityPosts).map(
      (post) => ({
        ...post,
        likedByUser: post.likedByUser ?? false,
        commentList: post.commentList ?? [],
      }),
    ),
    communityLive: normalizeCommunityLive(rest.communityLive),
  }

  if (
    mode === 'app' &&
    normalized.onboardingComplete &&
    !isDefaultDemoDogs(normalized.dogs)
  ) {
    normalized = {
      ...normalized,
      hasUserDogProfile: true,
      ...personalizeAppContentForDogs(normalized, normalized.dogs),
    }
  }

  if (mode === 'demo') {
    normalized = {
      ...normalized,
      mode: 'demo',
    }

    if (
      normalized.onboardingComplete &&
      normalized.demoEntry === 'onboarding' &&
      normalized.hasUserDogProfile &&
      !isDefaultDemoDogs(normalized.dogs)
    ) {
      normalized = {
        ...normalized,
        ...personalizeAppContentForDogs(normalized, normalized.dogs),
      }
    }

    return normalized
  }

  return normalized
}

function demoBaseState(state: AppState, demoRoute?: DemoRoute | null): AppState {
  if (state.demoEntry === 'onboarding') {
    if (state.onboardingComplete) {
      return { ...defaultAppState, mode: 'demo', demoEntry: 'onboarding' }
    }
    return createDemoOnboardingState()
  }

  if (demoRoute === 'onboarding') {
    return createDemoOnboardingState()
  }

  return createSeededDemoState()
}

export function clearDemoState(): void {
  localStorage.removeItem(DEMO_STORAGE_KEY)
}

export function saveSeededDemoState(): void {
  saveAppState(createSeededDemoState(), 'demo')
}

export function saveDemoOnboardingState(): void {
  saveAppState(createDemoOnboardingState(), 'demo')
}

export function loadAppState(
  mode: AppMode = getAppModeFromPath(),
  demoRoute?: DemoRoute | null,
): AppState {
  const key = getStorageKey(mode)

  if (mode === 'demo') {
    try {
      const raw = localStorage.getItem(key)
      if (raw) {
        const parsed = JSON.parse(raw) as AppState
        const base = demoBaseState(parsed, demoRoute)
        return normalizeAppState({ ...base, ...parsed, mode: 'demo' }, mode)
      }
    } catch {
      // fall through to route defaults
    }

    if (demoRoute === 'onboarding') {
      return normalizeAppState(createDemoOnboardingState(), mode)
    }

    return normalizeAppState(createSeededDemoState(), mode)
  }

  try {
    const raw = localStorage.getItem(key)
    if (!raw) {
      return normalizeAppState(createProductionInitialState(), mode)
    }
    return normalizeAppState(
      {
        ...createProductionInitialState(),
        ...JSON.parse(raw),
      } as AppState,
      mode,
    )
  } catch {
    return normalizeAppState(createProductionInitialState(), mode)
  }
}

export function saveAppState(
  state: AppState,
  mode: AppMode = getAppModeFromPath(),
): void {
  localStorage.setItem(
    getStorageKey(mode),
    JSON.stringify({ ...state, mode }),
  )
}
