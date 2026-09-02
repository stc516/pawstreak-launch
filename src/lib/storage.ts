import {
  createDemoOnboardingState,
  createSeededDemoState,
  defaultAppState,
  type ActiveAdventure,
  type AppMode,
  type AppState,
} from '../data/demo'
import { normalizePhotoSlots } from '../lib/imageUtils'
import { resolveActiveAdventureView } from './activeAdventureSession'
import {
  CUSTOM_ADVENTURE_PLACE_ID,
  getPlaceById,
  isNeighborhoodWalkPlace,
  resolvePlaceFromAdventure,
} from '../data/places'
import {
  EMPTY_ADD_ADVENTURE_DRAFT,
  inferAdventureSource,
  isCustomAdventurePlace,
} from './customAdventure'
import { EMPTY_CURATED_PLAN_DRAFT, type LegacyCuratedPlanDraft } from '../lib/curatedPlan'
import { EMPTY_MONTHLY_PLAN_DRAFT, type MonthlyPlanResult } from '../lib/monthlyPlan'
import { EMPTY_TRAINING_PROGRAM_DRAFT } from '../lib/trainingSchedule'
import { DEFAULT_PACK_ACCESS_MEMBERS } from '../data/packAccess'
import { isDefaultDemoDogs } from './dogLabels'
import { personalizeAppContentForDogs } from './personalizeContent'
import { createProductionInitialState } from './appDataSync'
import { DEFAULT_MAP_CENTER, resolveMapCenterForLocation } from './mapbox'
import { resolveAchievements } from './achievementEngine'
import { computeBondLevel } from './bondLevel'
import {
  EMPTY_COMMUNITY_LIVE,
  sanitizeProductionAppState,
} from './productionState'
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
  adventure:
    | ActiveAdventure
    | {
        id?: string
        serverId?: string
        dogId?: string
        selectedDogIds?: string[]
        location: string
        placeId?: string
        started?: boolean
        startedAt?: string
        durationLabel?: string
        status?: 'active'
        source?: ActiveAdventure['source']
        customTitle?: string
        customLocationLabel?: string
        userNotes?: string
        locationPermissionStatus?: ActiveAdventure['locationPermissionStatus']
        startLat?: number
        startLng?: number
        endLat?: number
        endLng?: number
        locationCapturedAt?: string
        gpsSummary?: string
        routePoints?: ActiveAdventure['routePoints']
      }
    | null,
): ActiveAdventure | null {
  if (!adventure) return null

  const serverId = 'serverId' in adventure ? adventure.serverId : undefined
  const placeId = adventure.placeId
  const started = adventure.started ?? false
  const startedAt =
    'startedAt' in adventure && adventure.startedAt
      ? adventure.startedAt
      : started
        ? new Date().toISOString()
        : undefined
  const source =
    ('source' in adventure && adventure.source) ||
    inferAdventureSource(placeId)

  if (source === 'custom' || isCustomAdventurePlace(placeId)) {
    const customTitle =
      ('customTitle' in adventure && adventure.customTitle) ||
      adventure.location
    return {
      id: adventure.id ?? serverId ?? crypto.randomUUID(),
      serverId,
      dogId: 'dogId' in adventure ? adventure.dogId : undefined,
      selectedDogIds:
        'selectedDogIds' in adventure ? adventure.selectedDogIds : undefined,
      placeId: CUSTOM_ADVENTURE_PLACE_ID,
      location: customTitle,
      durationLabel:
        'durationLabel' in adventure && adventure.durationLabel
          ? adventure.durationLabel
          : 'Open end',
      started,
      startedAt,
      status: 'active',
      source: 'custom',
      customTitle,
      customLocationLabel:
        'customLocationLabel' in adventure
          ? adventure.customLocationLabel
          : undefined,
      userNotes: 'userNotes' in adventure ? adventure.userNotes : undefined,
      locationPermissionStatus:
        'locationPermissionStatus' in adventure
          ? adventure.locationPermissionStatus
          : 'unknown',
      startLat: 'startLat' in adventure ? adventure.startLat : undefined,
      startLng: 'startLng' in adventure ? adventure.startLng : undefined,
      endLat: 'endLat' in adventure ? adventure.endLat : undefined,
      endLng: 'endLng' in adventure ? adventure.endLng : undefined,
      locationCapturedAt:
        'locationCapturedAt' in adventure ? adventure.locationCapturedAt : undefined,
      gpsSummary: 'gpsSummary' in adventure ? adventure.gpsSummary : undefined,
      routePoints:
        'routePoints' in adventure && Array.isArray(adventure.routePoints)
          ? adventure.routePoints
          : undefined,
    }
  }

  if (isNeighborhoodWalkPlace(placeId)) {
    return {
      id: adventure.id ?? serverId ?? crypto.randomUUID(),
      serverId,
      dogId: 'dogId' in adventure ? adventure.dogId : undefined,
      selectedDogIds:
        'selectedDogIds' in adventure ? adventure.selectedDogIds : undefined,
      placeId: placeId ?? 'neighborhood-walk',
      location: adventure.location || 'Neighborhood Walk',
      durationLabel:
        'durationLabel' in adventure && adventure.durationLabel
          ? adventure.durationLabel
          : 'Open end',
      started,
      startedAt,
      status: 'active',
      source: 'neighborhood',
    }
  }

  const place = resolvePlaceFromAdventure(adventure)
  return {
    id: adventure.id ?? serverId ?? crypto.randomUUID(),
    serverId,
    dogId: 'dogId' in adventure ? adventure.dogId : undefined,
    selectedDogIds:
      'selectedDogIds' in adventure ? adventure.selectedDogIds : undefined,
    placeId: place.id,
    location: place.name,
    durationLabel:
      'durationLabel' in adventure && adventure.durationLabel
        ? adventure.durationLabel
        : 'Open end',
    started,
    startedAt,
    status: 'active',
    source: 'catalog',
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
  mode: AppMode,
): AppState['communityLive'] {
  const defaults =
    mode === 'app' ? EMPTY_COMMUNITY_LIVE : defaultAppState.communityLive
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

function normalizeMonthlyPlanResult(
  result: MonthlyPlanResult | null | undefined,
): MonthlyPlanResult | null {
  if (!result) return null

  return {
    ...result,
    weeks: result.weeks.map((week, index) => {
      const place = getPlaceById(week.placeId)

      return {
        ...week,
        label: week.label ?? `Outing ${index + 1}`,
        timingLabel: week.timingLabel ?? `Outing ${index + 1}`,
        bestTime: week.bestTime ?? place?.bestTime ?? 'Anytime',
        addressLabel:
          week.addressLabel ??
          place?.addressLabel ??
          place?.directionsDestination ??
          place?.city,
        tieInLabel:
          week.tieInLabel ??
          `${week.category} progress · Explorer and matching challenges`,
      }
    }),
  }
}

/** Reset navigation UI on cold start. Places deep links land on Plan. */
export function applyLaunchSessionState(state: AppState): AppState {
  const params = new URLSearchParams(window.location.search)
  const hasPlacePlanDeepLink =
    Boolean(params.get('place')) && params.get('action') === 'plan'

  return {
    ...state,
    activeTab: hasPlacePlanDeepLink ? 'plan' : 'home',
    selectedJourneyEntryId: null,
    selectedChallengeId: null,
    selectedAchievementId: null,
    selectedTrainingProgramId: null,
    showJourneyMapOverlay: false,
    showJourneyLevelOverlay: false,
    showPresetPlanOverlay: false,
    showAddAdventureFlow: false,
    showCommunityCompose: false,
    showPackInviteOverlay: false,
    curatedPlanFlowStep: 0,
    buildMyMonthFlowStep: 0,
    trainingProgramFlowStep: 0,
  }
}

function normalizeAppState(state: AppState, mode: AppMode): AppState {
  const rest = { ...state } as AppState & {
      heroSpot?: unknown
      planPlaces?: unknown
    }
  delete rest.heroSpot
  delete rest.planPlaces

  let normalized: AppState = {
    ...rest,
    mode,
    selectedMonthlyPlanId: rest.selectedMonthlyPlanId ?? null,
    selectedJourneyEntryId: rest.selectedJourneyEntryId ?? null,
    selectedChallengeId: rest.selectedChallengeId ?? null,
    selectedAchievementId: rest.selectedAchievementId ?? null,
    selectedTrainingProgramId: rest.selectedTrainingProgramId ?? null,
    showCommunityCompose: rest.showCommunityCompose ?? false,
    curatedPlanFlowStep: rest.curatedPlanFlowStep ?? 0,
    curatedPlanDraft: normalizeCuratedDraft(rest.curatedPlanDraft),
    curatedPlanResult: rest.curatedPlanResult ?? null,
    buildMyMonthFlowStep: rest.buildMyMonthFlowStep ?? 0,
    buildMyMonthDraft: {
      ...EMPTY_MONTHLY_PLAN_DRAFT,
      ...(rest.buildMyMonthDraft ?? {}),
      categoryIds: Array.isArray(rest.buildMyMonthDraft?.categoryIds)
        ? rest.buildMyMonthDraft.categoryIds
        : [],
    },
    monthlyPlanResult: normalizeMonthlyPlanResult(rest.monthlyPlanResult),
    trainingProgramFlowStep: rest.trainingProgramFlowStep ?? 0,
    trainingProgramDraft: {
      ...EMPTY_TRAINING_PROGRAM_DRAFT,
      ...(rest.trainingProgramDraft ?? {}),
    },
    activeTrainingSchedule: rest.activeTrainingSchedule ?? null,
    randomPlanResult: rest.randomPlanResult ?? null,
    showPresetPlanOverlay: rest.showPresetPlanOverlay ?? false,
    showJourneyMapOverlay: rest.showJourneyMapOverlay ?? false,
    showJourneyLevelOverlay: rest.showJourneyLevelOverlay ?? false,
    showAddAdventureFlow: rest.showAddAdventureFlow ?? false,
    addAdventureDraft: {
      ...EMPTY_ADD_ADVENTURE_DRAFT,
      ...(rest.addAdventureDraft ?? {}),
    },
    scheduledAdventures: rest.scheduledAdventures ?? [],
    locationCandidates: rest.locationCandidates ?? [],
    adventurePhotos: normalizePhotoSlots(rest.adventurePhotos),
    activeAdventure: normalizeActiveAdventure(rest.activeAdventure),
    activeAdventureView: resolveActiveAdventureView(
      normalizeActiveAdventure(rest.activeAdventure),
      rest.activeAdventureView,
    ),
    memorySaveToast: rest.memorySaveToast ?? null,
    zipCode: rest.zipCode ?? '',
    locationQuery: rest.locationQuery ?? defaultAppState.locationQuery,
    locationLabel: rest.locationLabel ?? defaultAppState.locationLabel,
    locationSupported: rest.locationSupported ?? defaultAppState.locationSupported,
    resolvedLocation: rest.resolvedLocation ?? null,
    mapCenter:
      rest.mapCenter ??
      resolveMapCenterForLocation({
        zipCode: rest.zipCode ?? defaultAppState.zipCode,
        supported: rest.locationSupported ?? defaultAppState.locationSupported,
        label: rest.locationLabel ?? defaultAppState.locationLabel,
      }) ??
      DEFAULT_MAP_CENTER,
    userName: rest.userName ?? '',
    dogVibeNames: rest.dogVibeNames ?? [],
    onboardingCategoryIds: rest.onboardingCategoryIds ?? [],
    hasUserDogProfile: rest.hasUserDogProfile ?? false,
    joinedChallenges: rest.joinedChallenges ?? [],
    trainingLessonCompletions: rest.trainingLessonCompletions ?? [],
    trainingRewardUnlocks: rest.trainingRewardUnlocks ?? [],
    packAccessMembers: rest.packAccessMembers ?? DEFAULT_PACK_ACCESS_MEMBERS,
    showPackInviteOverlay: rest.showPackInviteOverlay ?? false,
    packAccessToast: rest.packAccessToast ?? null,
    communityPosts: (mode === 'app'
      ? rest.communityPosts ?? []
      : rest.communityPosts ?? defaultAppState.communityPosts
    ).map(
      (post) => ({
        ...post,
        likedByUser: post.likedByUser ?? false,
        commentList: post.commentList ?? [],
      }),
    ),
    communityLive: normalizeCommunityLive(rest.communityLive, mode),
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

    return applyLaunchSessionState({
      ...normalized,
      achievements: resolveAchievements(normalized),
      bondLevel: computeBondLevel(normalized),
    })
  }

  return applyLaunchSessionState(sanitizeProductionAppState(normalized))
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

export function clearProductionAppState(): void {
  localStorage.removeItem(APP_STORAGE_KEY)
}

export function resetProductionAppState(): AppState {
  clearProductionAppState()
  return normalizeAppState(createProductionInitialState(), 'app')
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
