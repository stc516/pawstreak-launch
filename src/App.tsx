import { useEffect, useRef, useState } from 'react'
import type { ActiveAdventure, AppState, CommunityPost, Dog, JourneyEntry, TabId } from './data/demo'
import {
  createActiveAdventure,
  getFinishedDurationLabel,
} from './data/demo'
import type { AdventureFinishPayload } from './lib/adventureFinish'
import {
  createJourneyEntryFromNeighborhoodWalk,
  createJourneyEntryFromPlace,
  CUSTOM_ADVENTURE_PLACE_ID,
  getPlaceById,
  isNeighborhoodWalkPlace,
  NEIGHBORHOOD_WALK_PLACE_ID,
} from './data/places'
import {
  createCustomActiveAdventure,
  createDefaultAddAdventureDraft,
  createJourneyEntryFromCustom,
  getDistinctPlaceKey,
  getDogsForAdventure,
  isCustomAdventure,
  scheduledFromDraft,
  type AddAdventureDraft,
} from './lib/customAdventure'
import {
  applyEndLocation,
  applyStartLocation,
  captureCurrentLocation,
  createLocationCandidate,
} from './lib/locationCandidates'
import { loadAppState, saveAppState, clearDemoState, resetProductionAppState, saveSeededDemoState, saveDemoOnboardingState } from './lib/storage'
import { getDemoRoute, navigateTo } from './lib/demoRoute'
import { usePathname } from './lib/usePathname'
import {
  isContentStudioRoute,
  isEarlyAccessRoute,
  isFeedbackDashboardRoute,
} from './lib/internalRoute'
import {
  getAppEntryAuthMode,
  getInviteToken,
  isLandingRoute,
  isMarketingRoute,
  isProductionAppRoute,
  isStartRoute,
  ROUTES,
} from './lib/routes'
import { LandingPage } from './screens/landing/LandingPage'
import { StartPage } from './screens/landing/StartPage'
import { ContentStudio } from './screens/internal/ContentStudio'
import { FeedbackDashboard } from './screens/internal/FeedbackDashboard'
import { EarlyAccessScreen } from './screens/EarlyAccessScreen'
import { DemoLauncher } from './screens/demo/DemoLauncher'
import type { DemoRoute } from './lib/demoRoute'
import { shouldPersonalizeContent } from './lib/profileDisplay'
import { fillPhotoSlots } from './lib/imageUtils'
import { AppShell } from './components/AppShell'
import { ActiveAdventureBanner } from './components/ActiveAdventureBanner'
import {
  AdventureCompletionReward,
  type AdventureCompletionSummary,
} from './components/AdventureCompletionReward'
import { ActiveAdventureScreen } from './screens/app/ActiveAdventureScreen'
import {
  clearActiveAdventureFields,
  hasMeaningfulAdventureProgress,
  shouldShowFocusedAdventure,
  showActiveAdventureBanner,
  viewForNewAdventure,
} from './lib/activeAdventureSession'
import { HomeScreen } from './screens/app/HomeScreen'
import { CommunityScreen } from './screens/app/CommunityScreen'
import { JourneyScreen } from './screens/app/JourneyScreen'
import { MilestonesScreen } from './screens/app/MilestonesScreen'
import { AchievementsScreen } from './screens/app/AchievementsScreen'
import { ProfileScreen } from './screens/app/ProfileScreen'
import { OnboardingFlow } from './screens/onboarding/OnboardingFlow'
import { SplashScreen } from './screens/SplashScreen'
import { JourneyMemoryView } from './screens/overlays/JourneyMemoryView'
import { JourneyLevelDetailView } from './screens/overlays/JourneyLevelDetailView'
import { JourneyMapView } from './screens/overlays/JourneyMapView'
import { ChallengePathDetailView } from './screens/overlays/ChallengePathDetailView'
import { getChallengeById, isCuratedChallengeId } from './data/challenges'
import { getTrainingProgramById, isTrainingProgramId } from './data/training'
import {
  joinChallengeState,
  leaveChallengeState,
  resolveJoinedChallenges,
} from './lib/challengeEngine'
import {
  completeTrainingLessonState,
  resetTrainingLessonState,
} from './lib/trainingEngine'
import { TrainingProgramDetailView } from './screens/overlays/TrainingProgramDetailView'
import { BuildMyMonthFlow } from './screens/overlays/BuildMyMonthFlow'
import { AddAdventureFlow } from './screens/overlays/AddAdventureFlow'
import { TrainingProgramFlow } from './screens/overlays/TrainingProgramFlow'
import { CuratedPlanFlow } from './screens/overlays/CuratedPlanFlow'
import { AchievementDetailView } from './screens/overlays/AchievementDetailView'
import { CommunityComposeOverlay } from './screens/overlays/CommunityComposeOverlay'
import { PackInviteOverlay } from './screens/overlays/PackInviteOverlay'
import type { PackInvitePayload } from './screens/overlays/PackInviteOverlay'
import { PresetPlanOverlay } from './screens/overlays/PresetPlanOverlay'
import { PlanScreen } from './screens/app/PlanScreen'
import {
  generateCuratedPlanResult,
} from './lib/curatedPlan'
import {
  EMPTY_MONTHLY_PLAN_DRAFT,
  advanceMonthlyPlanAfterAdventure,
  generateMonthlyPlanResult,
} from './lib/monthlyPlan'
import {
  EMPTY_TRAINING_PROGRAM_DRAFT,
  generateTrainingSchedule,
} from './lib/trainingSchedule'
import { generateRandomPlan } from './lib/randomPlan'
import type { OnboardingResult } from './lib/onboardingProfile'
import { applyOnboardingToAppState } from './lib/onboardingProfile'
import { resolveLocationProfileGeocoded } from './lib/geocode'
import { recordLocationExpansionRequest } from './lib/db/expansionRequests'
import { resolveMapCenterForLocation } from './lib/mapbox'
import {
  accessDescriptionForPackRole,
  accessLevelForPackRole,
  packRoleValueForInvite,
  roleLabelForPackRole,
} from './data/packAccess'
import { useAuth } from './context/AuthContext'
import {
  cancelAdventureOnServer,
  finishAdventureOnServer,
  hydrateProductionState,
  persistOnboardingToSupabase,
  removeScheduledAdventureOnServer,
  saveLocationCandidateOnServer,
  saveScheduledAdventureOnServer,
  startAdventureOnServer,
} from './lib/appDataSync'
import { applyRealUserContent } from './lib/productionState'
import {
  getDefaultNavTab,
  isNavTabVisible,
  LIVE_PRODUCT,
} from './lib/liveProductFeatures'
import { deleteDogForUser, setActiveDog, updateDogForUser } from './lib/db/dogs'
import { fetchMemoriesForUser, countDistinctPlaces, memoryRowToJourneyEntry } from './lib/db/memories'
import { insertEarlyAccessSignup } from './lib/db/earlyAccess'
import { trackUserEvent } from './lib/db/userEvents'
import { ensureProfileShell, updateProfileLocation } from './lib/db/profiles'
import {
  resetPasswordForEmail,
  sendMagicLink,
  signInWithEmail,
  signUpWithEmail,
  signupRequiresEmailConfirmation,
  type EmailAuthResult,
} from './lib/auth'
import {
  acceptPackInvite,
  createChallengeRequest,
  fetchPackAccessMembers,
  sendPackInvite,
} from './lib/db/packAccess'

function formatCompletionDogLabel(dogs: Dog[]): string {
  if (dogs.length === 0) return 'your dog'
  if (dogs.length === 1) return dogs[0]!.name
  if (dogs.length === 2) return `${dogs[0]!.name} + ${dogs[1]!.name}`
  return `${dogs.slice(0, -1).map((dog) => dog.name).join(', ')} + ${dogs[dogs.length - 1]!.name}`
}

function buildChallengeRewardRows(
  beforeState: AppState,
  afterState: AppState,
): AdventureCompletionSummary['rows'] {
  const beforeChallenges = resolveJoinedChallenges(beforeState)
  const beforeById = new Map(
    beforeChallenges.map((challenge) => [challenge.id, challenge.progress.metricValue]),
  )

  return resolveJoinedChallenges(afterState)
    .filter((challenge) => {
      const beforeValue = beforeById.get(challenge.id) ?? 0
      return challenge.progress.metricValue > beforeValue
    })
    .slice(0, 2)
    .map((challenge) => {
      const remaining = Math.max(
        challenge.progress.metricTarget - challenge.progress.metricValue,
        0,
      )
      const detail =
        remaining === 0
          ? 'Challenge complete.'
          : remaining === 1
            ? `1 more to finish. ${challenge.rewardConnection}`
            : `${remaining} more to finish. ${challenge.rewardConnection}`

      return {
        id: `challenge-${challenge.id}`,
        icon: 'ti-trophy',
        tone: 'progress' as const,
        label: `${challenge.title}: ${challenge.progress.metricValue} / ${challenge.progress.metricTarget}`,
        detail,
      }
    })
}

function buildAchievementRewardRows(
  beforeState: AppState,
  afterState: AppState,
): AdventureCompletionSummary['rows'] {
  const beforeUnlocked = new Set(
    beforeState.achievements
      .filter((achievement) => achievement.progress.unlocked)
      .map((achievement) => achievement.id),
  )

  return afterState.achievements
    .filter((achievement) => achievement.progress.unlocked && !beforeUnlocked.has(achievement.id))
    .slice(0, 2)
    .map((achievement) => ({
      id: `achievement-${achievement.id}`,
      icon: 'ti-medal',
      tone: 'unlock' as const,
      label: 'Badge unlocked',
      detail: achievement.title,
    }))
}

function buildAdventureCompletionSummary(input: {
  beforeState: AppState
  afterState: AppState
  memory: JourneyEntry
  adventure: ActiveAdventure
  dogs: Dog[]
  place?: ReturnType<typeof getPlaceById>
  durationLabel: string
  photoCount: number
}): AdventureCompletionSummary {
  const { beforeState, afterState, memory, adventure, dogs, place, durationLabel, photoCount } = input
  const challengeRows = buildChallengeRewardRows(beforeState, afterState)
  const achievementRows = buildAchievementRewardRows(beforeState, afterState)
  const placeName = memory.place || adventure.customTitle || adventure.location
  const streakRow =
    afterState.streak > 0 && afterState.streak >= beforeState.streak
      ? [{
          id: 'streak',
          icon: 'ti-route',
          label: 'PawStreak continued',
          detail: `${afterState.streak} day streak`,
        }]
      : []

  return {
    memoryId: memory.id,
    dogLabel: formatCompletionDogLabel(dogs),
    placeName,
    category: place?.category,
    durationLabel,
    photoCount,
    rows: [
      {
        id: 'memory',
        icon: 'ti-bookmark',
        label: '1 memory saved',
        detail: 'Saved to Journey.',
      },
      {
        id: 'map',
        icon: 'ti-map-pin',
        label: 'Added to your adventure map',
        detail: placeName,
      },
      ...streakRow,
      ...challengeRows,
      ...achievementRows,
    ],
  }
}

function AppExperience({ demoRoute }: { demoRoute: DemoRoute | null }) {
  const auth = useAuth()
  const appMode = demoRoute !== null ? 'demo' : 'app'
  const isDemoMode = appMode === 'demo' && demoRoute === 'app'
  const useProductionBackend = appMode === 'app' && auth.configured
  const [state, setState] = useState<AppState>(() => loadAppState(appMode, demoRoute))
  const [authError, setAuthError] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(false)
  const [dataHydrated, setDataHydrated] = useState(!useProductionBackend)
  const [splashComplete, setSplashComplete] = useState(false)
  const [completionReward, setCompletionReward] = useState<AdventureCompletionSummary | null>(null)
  const acceptedInviteTokenRef = useRef<string | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setSplashComplete(true), 1000)
    return () => window.clearTimeout(timer)
  }, [])

  const inAuthFlow =
    !splashComplete ||
    (!dataHydrated && useProductionBackend) ||
    !state.onboardingComplete ||
    (useProductionBackend && auth.configured && !auth.user)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('auth-route', inAuthFlow)
    root.classList.toggle('app-route', splashComplete && !inAuthFlow)
    return () => {
      root.classList.remove('auth-route', 'app-route')
    }
  }, [inAuthFlow, splashComplete])

  useEffect(() => {
    if (!useProductionBackend || auth.loading) return
    if (!auth.user) {
      setDataHydrated(true)
      return
    }

    let cancelled = false
    void hydrateProductionState(auth.user.id, state).then((next) => {
      if (cancelled) return
      setState((current) => ({ ...current, ...next }))
      setDataHydrated(true)
    })

    return () => {
      cancelled = true
    }
  }, [auth.user?.id, auth.loading, useProductionBackend])

  useEffect(() => {
    if (!useProductionBackend || !auth.user || !dataHydrated) return
    const inviteToken = getInviteToken()
    if (!inviteToken || acceptedInviteTokenRef.current === inviteToken) return

    acceptedInviteTokenRef.current = inviteToken
    void acceptPackInvite(inviteToken)
      .then(async () => {
        const refreshed = await hydrateProductionState(auth.user!.id, state)
        setState((current) => ({
          ...current,
          ...refreshed,
          packAccessToast: 'Pack invite accepted. Welcome in.',
        }))
        window.history.replaceState({}, '', ROUTES.app)
      })
      .catch((error) => {
        const message =
          error instanceof Error ? error.message : 'Could not accept that invite.'
        acceptedInviteTokenRef.current = null
        setState((current) => ({
          ...current,
          packAccessToast: message,
        }))
      })
  }, [auth.user?.id, dataHydrated, useProductionBackend])

  useEffect(() => {
    saveAppState(state, appMode)
  }, [state, appMode])

  useEffect(() => {
    setState((current) => {
      const patch: Partial<AppState> = {}

      if (
        current.selectedJourneyEntryId &&
        !current.journeyEntries.some(
          (entry) => entry.id === current.selectedJourneyEntryId,
        )
      ) {
        patch.selectedJourneyEntryId = null
      }

      if (
        current.selectedChallengeId &&
        !isCuratedChallengeId(current.selectedChallengeId)
      ) {
        patch.selectedChallengeId = null
      }

      if (
        current.selectedAchievementId &&
        !current.achievements.some(
          (achievement) => achievement.id === current.selectedAchievementId,
        )
      ) {
        patch.selectedAchievementId = null
      }

      if (
        current.selectedTrainingProgramId &&
        !isTrainingProgramId(current.selectedTrainingProgramId)
      ) {
        patch.selectedTrainingProgramId = null
      }

      if (Object.keys(patch).length === 0) {
        return current
      }

      return { ...current, ...patch }
    })
  }, [
    state.journeyEntries,
    state.joinedChallenges,
    state.selectedJourneyEntryId,
    state.selectedChallengeId,
    state.selectedAchievementId,
    state.selectedTrainingProgramId,
  ])

  const setActiveTab = (activeTab: TabId) => {
    setState((current) => ({
      ...current,
      activeTab,
      selectedJourneyEntryId: null,
      selectedChallengeId: null,
      selectedAchievementId: null,
      selectedTrainingProgramId: null,
      showPresetPlanOverlay: false,
      showJourneyMapOverlay: false,
      showJourneyLevelOverlay: false,
      showCommunityCompose: false,
    }))
  }

  const setSelectedActivity = (selectedActivityId: string) => {
    setState((current) => ({ ...current, selectedActivityId }))
  }

  const setSelectedPlanCategory = (selectedPlanCategoryId: string) => {
    setState((current) => ({ ...current, selectedPlanCategoryId }))
  }

  const setZipCode = (zipCode: string) => {
    setState((current) => ({ ...current, zipCode }))
  }

  const applyLocationFromZip = async () => {
    const query = state.zipCode.trim() || state.locationQuery
    const located = await resolveLocationProfileGeocoded(query)
    const location = located.profile

    setState((current) =>
      applyRealUserContent({
        ...current,
        zipCode: location.zipCode,
        locationQuery: location.query,
        locationLabel: location.label,
        locationSupported: location.supported,
        resolvedLocation: located.resolved,
        mapRegion: {
          title: location.mapTitle,
          subtitle: location.mapSubtitle,
        },
        mapCenter: resolveMapCenterForLocation(location),
        communityLive: {
          ...current.communityLive,
          label: location.communityLabel,
        },
      }),
    )

    if (useProductionBackend && auth.user) {
      void updateProfileLocation(auth.user.id, {
        zipCode: location.zipCode,
        locationQuery: location.query,
        locationLabel: location.label,
        locationSupported: location.supported,
      })
    }

    if (!location.supported) {
      void recordLocationExpansionRequest({
        userId: useProductionBackend ? auth.user?.id : null,
        dogId: state.activeDogId ?? null,
        rawLocationInput: query,
        resolved: located.resolved,
        source: 'profile',
      })
    }

    return {
      supported: location.supported,
      resolved: Boolean(located.resolved),
      label: location.label,
    }
  }

  const openJourneyMap = () => {
    setState((current) => ({
      ...current,
      showJourneyMapOverlay: true,
      selectedJourneyFilterId: 'map-view',
      selectedJourneyEntryId: null,
      selectedChallengeId: null,
      showPresetPlanOverlay: false,
    }))
  }

  const closeJourneyMap = () => {
    setState((current) => ({
      ...current,
      showJourneyMapOverlay: false,
      selectedJourneyFilterId:
        current.selectedJourneyFilterId === 'map-view' ? 'all' : current.selectedJourneyFilterId,
    }))
  }

  const openJourneyMemory = (selectedJourneyEntryId: string) => {
    setState((current) => ({
      ...current,
      activeTab: 'journey',
      selectedJourneyEntryId,
      selectedChallengeId: null,
      showPresetPlanOverlay: false,
      showJourneyMapOverlay: false,
    }))
  }

  const viewCompletedMemory = () => {
    if (!completionReward) return
    const memoryId = completionReward.memoryId
    setCompletionReward(null)
    openJourneyMemory(memoryId)
  }

  const findNextAdventureFromCompletion = () => {
    setCompletionReward(null)
    setActiveTab('plan')
  }

  const closeJourneyMemory = () => {
    setState((current) => ({ ...current, selectedJourneyEntryId: null }))
  }

  const openChallengeDetail = (selectedChallengeId: string) => {
    setState((current) => ({
      ...current,
      selectedChallengeId,
      selectedJourneyEntryId: null,
      selectedAchievementId: null,
      selectedTrainingProgramId: null,
      showPresetPlanOverlay: false,
    }))
  }

  const closeChallengeDetail = () => {
    setState((current) => ({ ...current, selectedChallengeId: null }))
  }

  const joinChallenge = (challengeId: string) => {
    setState((current) => joinChallengeState(current, challengeId))
  }

  const leaveChallenge = (challengeId: string) => {
    setState((current) => ({
      ...leaveChallengeState(current, challengeId),
      selectedChallengeId:
        current.selectedChallengeId === challengeId
          ? null
          : current.selectedChallengeId,
    }))
  }

  const openTrainingProgram = (selectedTrainingProgramId: string) => {
    setState((current) => ({
      ...current,
      selectedTrainingProgramId,
      selectedChallengeId: null,
      selectedAchievementId: null,
      selectedJourneyEntryId: null,
      showPresetPlanOverlay: false,
    }))
  }

  const closeTrainingProgram = () => {
    setState((current) => ({ ...current, selectedTrainingProgramId: null }))
  }

  const completeTrainingLesson = (lessonId: string) => {
    setState((current) => completeTrainingLessonState(current, lessonId))
  }

  const resetTrainingLesson = (lessonId: string) => {
    setState((current) => resetTrainingLessonState(current, lessonId))
  }

  const openAchievementDetail = (selectedAchievementId: string) => {
    setState((current) => ({
      ...current,
      selectedAchievementId,
      selectedChallengeId: null,
      selectedTrainingProgramId: null,
      selectedJourneyEntryId: null,
      showPresetPlanOverlay: false,
    }))
  }

  const closeAchievementDetail = () => {
    setState((current) => ({ ...current, selectedAchievementId: null }))
  }

  const closeJourneyLevelDetail = () => {
    setState((current) => ({ ...current, showJourneyLevelOverlay: false }))
  }

  const handleCuratedPlanBack = () => {
    setState((current) => {
      if (current.curatedPlanFlowStep === 4) {
        return {
          ...current,
          curatedPlanFlowStep: 0,
          activeTab: 'plan',
          selectedMonthlyPlanId: 'curated',
        }
      }
      if (current.curatedPlanFlowStep <= 1) {
        return { ...current, curatedPlanFlowStep: 0, activeTab: 'plan' }
      }
      return {
        ...current,
        curatedPlanFlowStep: current.curatedPlanFlowStep - 1,
      }
    })
  }

  const setCuratedOptimize = (optimizeId: string) => {
    setState((current) => {
      const optimizeIds = current.curatedPlanDraft.optimizeIds.includes(optimizeId)
        ? current.curatedPlanDraft.optimizeIds.filter((id) => id !== optimizeId)
        : [...current.curatedPlanDraft.optimizeIds, optimizeId]
      return {
        ...current,
        curatedPlanDraft: { ...current.curatedPlanDraft, optimizeIds },
      }
    })
  }

  const setCuratedTime = (timeId: string) => {
    setState((current) => ({
      ...current,
      curatedPlanDraft: { ...current.curatedPlanDraft, timeId },
    }))
  }

  const toggleCuratedLove = (loveId: string) => {
    setState((current) => {
      const loveIds = current.curatedPlanDraft.loveIds.includes(loveId)
        ? current.curatedPlanDraft.loveIds.filter((id) => id !== loveId)
        : [...current.curatedPlanDraft.loveIds, loveId]
      return {
        ...current,
        curatedPlanDraft: { ...current.curatedPlanDraft, loveIds },
      }
    })
  }

  const advanceCuratedPlanFlow = () => {
    setState((current) => {
      if (current.curatedPlanFlowStep === 3) {
        return {
          ...current,
          curatedPlanFlowStep: 4,
          curatedPlanResult: generateCuratedPlanResult(
            current.dogs,
            current.curatedPlanDraft,
          ),
          randomPlanResult: null,
          selectedMonthlyPlanId: 'curated',
        }
      }
      return {
        ...current,
        curatedPlanFlowStep: current.curatedPlanFlowStep + 1,
      }
    })
  }

  const finishCuratedPlanFlow = () => {
    setState((current) => ({
      ...current,
      curatedPlanFlowStep: 0,
      activeTab: 'plan',
      selectedMonthlyPlanId: 'curated',
    }))
  }

  const startWeekFromCuratedPlan = () => {
    setState((current) => {
      const first = current.curatedPlanResult?.firstAdventure
      if (!first) {
        return {
          ...current,
          curatedPlanFlowStep: 0,
          activeTab: 'plan',
          selectedMonthlyPlanId: 'curated',
        }
      }

      const activeAdventure = createActiveAdventure(first.placeId, first.name, '30 min')
      return {
        ...current,
        curatedPlanFlowStep: 0,
        selectedMonthlyPlanId: 'curated',
        activeAdventure,
        activeAdventureView: viewForNewAdventure(activeAdventure),
        adventurePhotos: ['', '', ''],
      }
    })
  }

  const generateRandomPlanForDogs = () => {
    setState((current) => ({
      ...current,
      activeTab: 'plan',
      selectedMonthlyPlanId: 'random',
      randomPlanResult: generateRandomPlan(current),
      curatedPlanResult: null,
      monthlyPlanResult: null,
      curatedPlanFlowStep: 0,
      buildMyMonthFlowStep: 0,
    }))
  }

  const openBuildMyMonthFlow = () => {
    setState((current) => ({
      ...current,
      activeTab: 'home',
      buildMyMonthFlowStep: 1,
      buildMyMonthDraft: EMPTY_MONTHLY_PLAN_DRAFT,
      selectedJourneyEntryId: null,
      selectedChallengeId: null,
      showPresetPlanOverlay: false,
    }))
  }

  const handleBuildMyMonthBack = () => {
    setState((current) => {
      if (current.buildMyMonthFlowStep === 4) {
        return {
          ...current,
          buildMyMonthFlowStep: 0,
          activeTab: 'home',
          selectedMonthlyPlanId: 'monthly',
        }
      }
      if (current.buildMyMonthFlowStep <= 1) {
        return { ...current, buildMyMonthFlowStep: 0, activeTab: 'home' }
      }
      return {
        ...current,
        buildMyMonthFlowStep: current.buildMyMonthFlowStep - 1,
      }
    })
  }

  const setBuildMyMonthVibe = (vibeId: AppState['buildMyMonthDraft']['vibeId']) => {
    setState((current) => ({
      ...current,
      buildMyMonthDraft: { ...current.buildMyMonthDraft, vibeId },
    }))
  }

  const toggleBuildMyMonthCategory = (categoryId: string) => {
    setState((current) => {
      const categoryIds = current.buildMyMonthDraft.categoryIds.includes(categoryId)
        ? current.buildMyMonthDraft.categoryIds.filter((id) => id !== categoryId)
        : [...current.buildMyMonthDraft.categoryIds, categoryId].slice(0, 4)

      return {
        ...current,
        buildMyMonthDraft: {
          ...current.buildMyMonthDraft,
          categoryIds,
          vibeId: current.buildMyMonthDraft.vibeId ?? 'mixed',
        },
      }
    })
  }

  const setBuildMyMonthFrequency = (
    frequencyPerWeek: NonNullable<AppState['buildMyMonthDraft']['frequencyPerWeek']>,
  ) => {
    setState((current) => ({
      ...current,
      buildMyMonthDraft: { ...current.buildMyMonthDraft, frequencyPerWeek },
    }))
  }

  const setBuildMyMonthDays = (
    dayPreference: NonNullable<AppState['buildMyMonthDraft']['dayPreference']>,
  ) => {
    setState((current) => ({
      ...current,
      buildMyMonthDraft: { ...current.buildMyMonthDraft, dayPreference },
    }))
  }

  const advanceBuildMyMonthFlow = () => {
    setState((current) => {
      if (current.buildMyMonthFlowStep === 3) {
        return {
          ...current,
          buildMyMonthFlowStep: 4,
          monthlyPlanResult: generateMonthlyPlanResult(current.buildMyMonthDraft),
          curatedPlanResult: null,
          randomPlanResult: null,
          selectedMonthlyPlanId: 'monthly',
        }
      }
      return {
        ...current,
        buildMyMonthFlowStep: current.buildMyMonthFlowStep + 1,
      }
    })
  }

  const saveBuildMyMonthFlow = () => {
    setState((current) => ({
      ...current,
      buildMyMonthFlowStep: 0,
      activeTab: 'home',
      selectedMonthlyPlanId: 'monthly',
    }))
  }

  const startAdventureFromMonthlyPlan = (placeId: string) => {
    setState((current) => ({
      ...current,
      buildMyMonthFlowStep: 0,
      selectedMonthlyPlanId: 'monthly',
    }))
    void startAdventure(placeId)
  }

  const openTrainingProgramFlow = () => {
    setState((current) => ({
      ...current,
      trainingProgramFlowStep: 1,
      trainingProgramDraft: EMPTY_TRAINING_PROGRAM_DRAFT,
      selectedJourneyEntryId: null,
      selectedChallengeId: null,
      selectedTrainingProgramId: null,
      showPresetPlanOverlay: false,
    }))
  }

  const handleTrainingProgramBack = () => {
    setState((current) => {
      if (current.trainingProgramFlowStep === 3) {
        return {
          ...current,
          trainingProgramFlowStep: 0,
          activeTab: 'home',
        }
      }
      if (current.trainingProgramFlowStep <= 1) {
        return { ...current, trainingProgramFlowStep: 0, activeTab: 'home' }
      }
      return {
        ...current,
        trainingProgramFlowStep: current.trainingProgramFlowStep - 1,
      }
    })
  }

  const setTrainingProgramSelection = (programId: string) => {
    setState((current) => ({
      ...current,
      trainingProgramDraft: { ...current.trainingProgramDraft, programId },
    }))
  }

  const setTrainingCadence = (
    cadence: NonNullable<AppState['trainingProgramDraft']['cadence']>,
  ) => {
    setState((current) => ({
      ...current,
      trainingProgramDraft: { ...current.trainingProgramDraft, cadence },
    }))
  }

  const advanceTrainingProgramFlow = () => {
    setState((current) => {
      const { programId, cadence } = current.trainingProgramDraft
      if (current.trainingProgramFlowStep === 2 && programId && cadence) {
        const schedule = generateTrainingSchedule(programId, cadence, current)
        return {
          ...current,
          trainingProgramFlowStep: 3,
          activeTrainingSchedule: schedule,
        }
      }
      return {
        ...current,
        trainingProgramFlowStep: current.trainingProgramFlowStep + 1,
      }
    })
  }

  const saveTrainingProgramFlow = () => {
    setState((current) => ({
      ...current,
      trainingProgramFlowStep: 0,
      activeTab: 'home',
    }))
  }

  const continueTrainingFromHome = (programId: string) => {
    openTrainingProgram(programId)
  }

  const openPresetPlanOverlay = () => {
    if (!LIVE_PRODUCT.calendarPresetPlan) return
    setState((current) => ({
      ...current,
      activeTab: 'plan',
      selectedMonthlyPlanId: 'preset',
      showPresetPlanOverlay: true,
      selectedJourneyEntryId: null,
      selectedChallengeId: null,
    }))
  }

  const closePresetPlanOverlay = () => {
    setState((current) => ({ ...current, showPresetPlanOverlay: false }))
  }

  const addAdventurePhoto = (photoDataUrl: string) => {
    setState((current) => ({
      ...current,
      adventurePhotos: fillPhotoSlots(current.adventurePhotos, photoDataUrl),
    }))
  }

  const startAdventureSession = () => {
    setState((current) => {
      if (!current.activeAdventure) return current
      const startedAt = current.activeAdventure.startedAt ?? new Date().toISOString()
      return {
        ...current,
        activeAdventure: {
          ...current.activeAdventure,
          started: true,
          startedAt,
          status: 'active',
        },
        activeAdventureView: 'minimized',
      }
    })
  }

  const focusActiveAdventure = () => {
    setState((current) =>
      current.activeAdventure
        ? { ...current, activeAdventureView: 'focused' }
        : current,
    )
  }

  const minimizeActiveAdventure = () => {
    setState((current) =>
      current.activeAdventure?.started
        ? { ...current, activeAdventureView: 'minimized' }
        : current,
    )
  }

  const cancelAdventure = () => {
    if (useProductionBackend && auth.user && state.activeAdventure) {
      void cancelAdventureOnServer(auth.user.id, state.activeAdventure)
    }

    setState((current) => ({
      ...current,
      ...clearActiveAdventureFields(),
    }))
  }

  const requestCancelAdventure = () => {
    if (hasMeaningfulAdventureProgress(state)) {
      const confirmed = window.confirm(
        'Cancel this adventure? Your timer and any photos will be discarded and nothing will be saved to Journey.',
      )
      if (!confirmed) return
    }
    cancelAdventure()
  }

  const finishActiveAdventureFromBanner = () => {
    void finishAdventure({ recapLabels: ['Loved every second'] })
  }

  const closeCommunityCompose = () => {
    setState((current) => ({ ...current, showCommunityCompose: false }))
  }

  const submitCommunityPost = (post: CommunityPost) => {
    setState((current) => ({
      ...current,
      showCommunityCompose: false,
      activeTab: 'community',
      communityPosts: [post, ...current.communityPosts],
      memorySaveToast: 'Shared with the pack — your post is live locally.',
    }))
  }

  const blockIfActiveAdventure = (): boolean => {
    if (!state.activeAdventure) return false
    setState((current) => ({
      ...current,
      memorySaveToast:
        'Finish or cancel your current adventure before starting another.',
    }))
    return true
  }

  const openAddAdventureFlow = () => {
    if (useProductionBackend && !auth.user) {
      setState((current) => ({
        ...current,
        memorySaveToast: 'Sign in to add your own adventures.',
      }))
      return
    }
    if (blockIfActiveAdventure()) return

    setState((current) => ({
      ...current,
      showAddAdventureFlow: true,
      addAdventureDraft: createDefaultAddAdventureDraft(current),
      selectedJourneyEntryId: null,
      selectedChallengeId: null,
    }))
  }

  const closeAddAdventureFlow = () => {
    setState((current) => ({
      ...current,
      showAddAdventureFlow: false,
      addAdventureDraft: createDefaultAddAdventureDraft(current),
    }))
  }

  const updateAddAdventureDraft = (patch: Partial<AddAdventureDraft>) => {
    setState((current) => ({
      ...current,
      addAdventureDraft: { ...current.addAdventureDraft, ...patch },
    }))
  }

  const toggleAddAdventureDog = (dogId: string) => {
    setState((current) => {
      const selected = new Set(current.addAdventureDraft.selectedDogIds)
      if (selected.has(dogId)) {
        if (selected.size <= 1) return current
        selected.delete(dogId)
      } else {
        selected.add(dogId)
      }
      return {
        ...current,
        addAdventureDraft: {
          ...current.addAdventureDraft,
          selectedDogIds: [...selected],
        },
      }
    })
  }

  const promoteCustomAdventure = async (
    draft: AddAdventureDraft,
    options: { removeScheduledId?: string } = {},
  ) => {
    if (blockIfActiveAdventure()) return

    const startedAt = new Date().toISOString()
    const locationCapture = await captureCurrentLocation()
    const activeDogId =
      draft.selectedDogIds[0] ?? state.activeDogId ?? state.dogs[0]?.id
    const photoSlots = draft.photoDataUrl
      ? fillPhotoSlots(['', '', ''], draft.photoDataUrl)
      : ['', '', '']

    if (useProductionBackend && auth.user && activeDogId) {
      const serverAdventure = await startAdventureOnServer({
        userId: auth.user.id,
        dogId: activeDogId,
        placeId: CUSTOM_ADVENTURE_PLACE_ID,
        durationLabel: 'Open end',
        selectedDogIds: draft.selectedDogIds,
        source: 'custom',
        customTitle: draft.title.trim(),
        customLocationLabel: draft.locationLabel.trim() || undefined,
        userNotes: draft.notes.trim() || undefined,
        started: true,
        startedAt,
      })

      if (serverAdventure) {
        const activeAdventure = applyStartLocation(
          serverAdventure,
          locationCapture,
        )
        if (options.removeScheduledId) {
          await removeScheduledAdventureOnServer(
            options.removeScheduledId,
            auth.user.id,
          )
        }
        const scheduledAdventures = options.removeScheduledId
          ? state.scheduledAdventures.filter((s) => s.id !== options.removeScheduledId)
          : state.scheduledAdventures

        setState((current) => ({
          ...current,
          showAddAdventureFlow: false,
          addAdventureDraft: createDefaultAddAdventureDraft(current),
          activeAdventure,
          activeAdventureView: viewForNewAdventure(activeAdventure),
          adventurePhotos: photoSlots,
          scheduledAdventures,
          selectedJourneyEntryId: null,
          selectedChallengeId: null,
        }))
        return
      }
    }

    const activeAdventure = applyStartLocation(
      createCustomActiveAdventure(draft, {
        started: true,
        startedAt,
      }),
      locationCapture,
    )

    setState((current) => ({
      ...current,
      showAddAdventureFlow: false,
      addAdventureDraft: createDefaultAddAdventureDraft(current),
      activeAdventure,
      activeAdventureView: viewForNewAdventure(activeAdventure),
      adventurePhotos: photoSlots,
      scheduledAdventures: options.removeScheduledId
        ? current.scheduledAdventures.filter((s) => s.id !== options.removeScheduledId)
        : current.scheduledAdventures,
      selectedJourneyEntryId: null,
      selectedChallengeId: null,
    }))
  }

  const submitAddAdventureStartNow = () => {
    void promoteCustomAdventure(state.addAdventureDraft)
  }

  const submitAddAdventureSaveForLater = async () => {
    const draft = state.addAdventureDraft
    const planned = scheduledFromDraft(draft)

    if (useProductionBackend && auth.user) {
      const saved = await saveScheduledAdventureOnServer({
        userId: auth.user.id,
        title: planned.title,
        locationLabel: planned.locationLabel,
        notes: planned.notes,
        selectedDogIds: planned.selectedDogIds,
      })
      if (saved) {
        setState((current) => ({
          ...current,
          showAddAdventureFlow: false,
          addAdventureDraft: createDefaultAddAdventureDraft(current),
          scheduledAdventures: [saved, ...current.scheduledAdventures],
          activeTab: 'plan',
          memorySaveToast: 'Saved for later — find it in Plan under Planned.',
        }))
        return
      }
      setState((current) => ({
        ...current,
        memorySaveToast: 'Could not save. Check your connection and try again.',
      }))
      return
    }

    setState((current) => ({
      ...current,
      showAddAdventureFlow: false,
      addAdventureDraft: createDefaultAddAdventureDraft(current),
      scheduledAdventures: [planned, ...current.scheduledAdventures],
      activeTab: 'plan',
      memorySaveToast: 'Saved for later — find it in Plan under Planned.',
    }))
  }

  const startPlannedAdventure = (scheduledId: string) => {
    const planned = state.scheduledAdventures.find((s) => s.id === scheduledId)
    if (!planned) return
    const draft: AddAdventureDraft = {
      title: planned.title,
      locationLabel: planned.locationLabel ?? '',
      notes: planned.notes ?? '',
      photoDataUrl: planned.photoDataUrl ?? null,
      selectedDogIds: [...planned.selectedDogIds],
    }
    void promoteCustomAdventure(draft, { removeScheduledId: scheduledId })
  }

  const deletePlannedAdventure = async (scheduledId: string) => {
    if (useProductionBackend && auth.user) {
      await removeScheduledAdventureOnServer(scheduledId, auth.user.id)
    }
    setState((current) => ({
      ...current,
      scheduledAdventures: current.scheduledAdventures.filter(
        (s) => s.id !== scheduledId,
      ),
    }))
  }

  const startNeighborhoodWalk = () => {
    if (blockIfActiveAdventure()) return

    setState((current) => {
      const startedAt = new Date().toISOString()
      const activeAdventure = createActiveAdventure(
        NEIGHBORHOOD_WALK_PLACE_ID,
        'Neighborhood Walk',
        'Open end',
        {
          started: true,
          startedAt,
          source: 'neighborhood',
          dogId: current.activeDogId ?? current.dogs[0]?.id,
          selectedDogIds: current.dogs.map((dog) => dog.id),
        },
      )
      return {
        ...current,
        activeAdventure,
        activeAdventureView: viewForNewAdventure(activeAdventure),
        adventurePhotos: ['', '', ''],
        selectedJourneyEntryId: null,
        selectedChallengeId: null,
        showPresetPlanOverlay: false,
        curatedPlanFlowStep: 0,
        buildMyMonthFlowStep: 0,
      }
    })
  }

  const startAdventure = async (placeId: string, durationLabel = 'Open end') => {
    const place = getPlaceById(placeId)
    if (!place) return
    if (blockIfActiveAdventure()) return

    if (
      !state.locationSupported &&
      !isNeighborhoodWalkPlace(place.id) &&
      place.id !== CUSTOM_ADVENTURE_PLACE_ID
    ) {
      startNeighborhoodWalk()
      return
    }

    const activeDogId = state.activeDogId ?? state.dogs[0]?.id

    if (useProductionBackend && auth.user && activeDogId) {
      const serverAdventure = await startAdventureOnServer({
        userId: auth.user.id,
        dogId: activeDogId,
        placeId: place.id,
        durationLabel,
        selectedDogIds: state.dogs.map((dog) => dog.id),
      })

      if (serverAdventure) {
        setState((current) => ({
          ...current,
          activeAdventure: serverAdventure,
          activeAdventureView: viewForNewAdventure(serverAdventure),
          adventurePhotos: ['', '', ''],
          selectedJourneyEntryId: null,
          selectedChallengeId: null,
          showPresetPlanOverlay: false,
          curatedPlanFlowStep: 0,
          buildMyMonthFlowStep: 0,
        }))
        return
      }
    }

    const activeAdventure = createActiveAdventure(
      place.id,
      place.name,
      durationLabel,
      {
        dogId: activeDogId,
        selectedDogIds: state.dogs.map((dog) => dog.id),
      },
    )
    setState((current) => ({
      ...current,
      activeAdventure,
      activeAdventureView: viewForNewAdventure(activeAdventure),
      adventurePhotos: ['', '', ''],
      selectedJourneyEntryId: null,
      selectedChallengeId: null,
      showPresetPlanOverlay: false,
      curatedPlanFlowStep: 0,
      buildMyMonthFlowStep: 0,
    }))
  }

  const goAgainFromMemory = (placeId: string) => {
    const place = getPlaceById(placeId)
    if (!place) return

    const activeAdventure = createActiveAdventure(place.id, place.name, 'Open end', {
      dogId: state.activeDogId ?? state.dogs[0]?.id,
      selectedDogIds: state.dogs.map((dog) => dog.id),
    })
    setState((current) => ({
      ...current,
      selectedJourneyEntryId: null,
      activeAdventure,
      activeAdventureView: viewForNewAdventure(activeAdventure),
      adventurePhotos: ['', '', ''],
    }))
  }

  const finishAdventure = async (payload: AdventureFinishPayload) => {
    if (!state.activeAdventure) {
      setState((current) => ({ ...current, activeTab: 'journey', adventurePhotos: ['', '', ''] }))
      return
    }

    const endLocationCapture = isCustomAdventure(state.activeAdventure)
      ? await captureCurrentLocation()
      : null
    const activeAdventureForFinish = endLocationCapture
      ? applyEndLocation(state.activeAdventure, endLocationCapture)
      : state.activeAdventure
    const place = getPlaceById(activeAdventureForFinish.placeId)
    const capturedPhotos = state.adventurePhotos.filter(Boolean)
    const activeDogId = state.activeDogId ?? state.dogs[0]?.id
    const isNeighborhoodWalk = isNeighborhoodWalkPlace(activeAdventureForFinish.placeId)
    const isCustom = isCustomAdventure(activeAdventureForFinish)
    const durationLabel = getFinishedDurationLabel(activeAdventureForFinish)

    if (useProductionBackend && auth.user && activeDogId && place && !isNeighborhoodWalk) {
      try {
        const adventureDogs = getDogsForAdventure(
          state.dogs,
          activeAdventureForFinish.selectedDogIds,
        )
        const memory = await finishAdventureOnServer({
          userId: auth.user.id,
          dogId: activeDogId,
          activeAdventure: activeAdventureForFinish,
          dogs: adventureDogs,
          photoDataUrls: capturedPhotos,
          payload,
        })
        const candidate = isCustom
          ? createLocationCandidate({
              activeAdventure: activeAdventureForFinish,
              sourceMemoryId: memory.id,
              userId: auth.user.id,
              photoCount: capturedPhotos.length,
            })
          : null
        if (candidate) {
          await saveLocationCandidateOnServer(candidate)
        }
        const savedMemoryEntry = await memoryRowToJourneyEntry(memory)
        const journeyEntries = await fetchMemoriesForUser(auth.user.id, activeDogId)
        const placeCount = await countDistinctPlaces(auth.user.id, activeDogId)
        const rewardMemory =
          journeyEntries.find((entry) => entry.id === savedMemoryEntry.id) ?? savedMemoryEntry
        const nextState = applyRealUserContent({
          ...state,
          ...clearActiveAdventureFields(),
          activeTab: 'journey',
          adventureCount: journeyEntries.length,
          placeCount,
          journeyEntries,
          memorySaveToast: 'Memory saved — worth remembering.',
          monthlyPlanResult:
            state.monthlyPlanResult && place && !isCustom
              ? advanceMonthlyPlanAfterAdventure(state.monthlyPlanResult, place.id)
              : state.monthlyPlanResult,
        })

        setState(nextState)
        setCompletionReward(buildAdventureCompletionSummary({
          beforeState: state,
          afterState: nextState,
          memory: rewardMemory,
          adventure: activeAdventureForFinish,
          dogs: adventureDogs,
          place,
          durationLabel,
          photoCount: capturedPhotos.length,
        }))
        return
      } catch {
        setState((current) => ({
          ...current,
          memorySaveToast: 'Could not save memory. Check your connection and try again.',
        }))
        return
      }
    }

    const currentAdventure = activeAdventureForFinish

    const adventureDogs = getDogsForAdventure(
      state.dogs,
      currentAdventure.selectedDogIds,
    )

    const customMemory = isCustom
      ? createJourneyEntryFromCustom(adventureDogs, {
          title:
            currentAdventure.customTitle ??
            currentAdventure.location,
          locationLabel: currentAdventure.customLocationLabel,
          userNotes: currentAdventure.userNotes,
          photoUrls: capturedPhotos,
          durationLabel,
          recapLabels: payload.recapLabels,
        })
      : null
    const neighborhoodMemory = isNeighborhoodWalk
      ? createJourneyEntryFromNeighborhoodWalk(adventureDogs, {
          photoUrls: capturedPhotos,
          durationLabel,
          recapLabels: payload.recapLabels,
        })
      : null
    const placeMemory =
      !isCustom && !isNeighborhoodWalk && place
        ? createJourneyEntryFromPlace(place, adventureDogs, {
            photoUrls: capturedPhotos,
            durationLabel,
            recapLabels: payload.recapLabels,
          })
        : null
    const savedMemory = customMemory ?? neighborhoodMemory ?? placeMemory

    const journeyEntries = savedMemory
      ? [savedMemory, ...state.journeyEntries]
      : state.journeyEntries

    const adventureCount = journeyEntries.length
    const placeCount = new Set(journeyEntries.map(getDistinctPlaceKey)).size
    const locationCandidate =
      isCustom && customMemory
        ? createLocationCandidate({
            activeAdventure: currentAdventure,
            sourceMemoryId: customMemory.id,
            photoCount: capturedPhotos.length,
          })
        : null

    const nextState = applyRealUserContent({
      ...state,
      ...clearActiveAdventureFields(),
      activeTab: 'journey',
      adventureCount,
      placeCount,
      journeyEntries,
      locationCandidates: locationCandidate
        ? [locationCandidate, ...state.locationCandidates]
        : state.locationCandidates,
      memorySaveToast: 'Memory saved — worth remembering.',
      monthlyPlanResult:
        state.monthlyPlanResult && place && !isCustom
          ? advanceMonthlyPlanAfterAdventure(state.monthlyPlanResult, place.id)
          : state.monthlyPlanResult,
    })

    setState(nextState)
    if (savedMemory) {
      setCompletionReward(buildAdventureCompletionSummary({
        beforeState: state,
        afterState: nextState,
        memory: savedMemory,
        adventure: currentAdventure,
        dogs: adventureDogs,
        place,
        durationLabel,
        photoCount: capturedPhotos.length,
      }))
    }
  }

  const completeOnboarding = async (result: OnboardingResult) => {
    if (useProductionBackend && auth.configured && !auth.user) {
      setAuthError('Sign in to continue.')
      return
    }

    // Geocode-first resolution; falls back to pattern matching when
    // Mapbox is unavailable so onboarding is never blocked.
    const located = await resolveLocationProfileGeocoded(result.locationQuery)

    if (!located.profile.supported) {
      void recordLocationExpansionRequest({
        userId: useProductionBackend ? auth.user?.id : null,
        dogId: null,
        rawLocationInput: result.locationQuery,
        resolved: located.resolved,
        source: 'onboarding',
      })
    }

    if (useProductionBackend && auth.user) {
      await persistOnboardingToSupabase(
        auth.user.id,
        auth.user.email,
        result,
        located.profile,
      )
      await insertEarlyAccessSignup({
        email: auth.user.email ?? '',
        name: result.userName,
        dogName: result.dogs[0]?.name ?? '',
        zipOrCity: result.locationQuery,
        source: 'onboarding',
        userId: auth.user.id,
      })
      await trackUserEvent('early_access_joined', { source: 'onboarding' }, auth.user.id)

      const hydrated = await hydrateProductionState(auth.user.id, state)
      const onboardingPatch = applyOnboardingToAppState(state, result, located)
      setState((current) => ({
        ...current,
        ...hydrated,
        ...onboardingPatch,
        dogs: hydrated.dogs,
        hasUserDogProfile: hydrated.hasUserDogProfile,
        activeDogId: hydrated.activeDogId,
        mode: appMode,
      }))
      saveAppState(
        {
          ...state,
          ...hydrated,
          ...onboardingPatch,
          dogs: hydrated.dogs,
          hasUserDogProfile: hydrated.hasUserDogProfile,
          activeDogId: hydrated.activeDogId,
          mode: appMode,
        },
        appMode,
      )
      return
    }

    setState((current) => {
      const nextState: AppState = {
        ...current,
        ...applyOnboardingToAppState(current, result, located),
        demoEntry: appMode === 'demo' ? 'onboarding' : current.demoEntry,
        mode: appMode,
      }
      saveAppState(nextState, appMode)
      return nextState
    })
    if (appMode === 'demo') {
      navigateTo(ROUTES.demoApp)
    }
  }

  const handleEmailAuth = async (
    mode: 'signup' | 'signin',
    input: { email: string; password: string; userName: string },
  ): Promise<EmailAuthResult> => {
    setAuthLoading(true)
    setAuthError(null)
    try {
      if (mode === 'signup') {
        const data = await signUpWithEmail(input.email, input.password)
        if (data.user) {
          await ensureProfileShell(data.user.id, input.email)
          await trackUserEvent('signup', { email: input.email }, data.user.id)
        }
        if (signupRequiresEmailConfirmation(data)) {
          return 'email_confirmation_required'
        }
        if (!data.session) {
          throw new Error('Could not create your account. Please try again.')
        }
        return 'authenticated'
      }

      const data = await signInWithEmail(input.email, input.password)
      if (!data.session) {
        throw new Error('Sign in failed. Please try again.')
      }
      return 'authenticated'
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed'
      setAuthError(message)
      throw error
    } finally {
      setAuthLoading(false)
    }
  }

  const handlePasswordReset = async (email: string) => {
    setAuthLoading(true)
    setAuthError(null)
    try {
      await resetPasswordForEmail(email)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Could not send password reset email'
      setAuthError(message)
      throw error
    } finally {
      setAuthLoading(false)
    }
  }

  const handleMagicLink = async (email: string) => {
    setAuthLoading(true)
    setAuthError(null)
    try {
      await sendMagicLink(email)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Could not send magic link'
      setAuthError(message)
      throw error
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSignOut = async () => {
    setAuthLoading(true)
    setAuthError(null)
    try {
      await auth.signOut()
      const fresh = resetProductionAppState()
      setState(fresh)
      setDataHydrated(true)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign out failed'
      setAuthError(message)
    } finally {
      setAuthLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setAuthLoading(true)
    setAuthError(null)
    try {
      await auth.signInWithGoogle()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Google sign-in failed'
      setAuthError(message)
      throw error
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSetActiveDog = (dogId: string) => {
    setState((current) => ({ ...current, activeDogId: dogId }))
    if (useProductionBackend && auth.user) {
      void setActiveDog(auth.user.id, dogId)
      void fetchMemoriesForUser(auth.user.id, dogId).then((journeyEntries) => {
        setState((current) => ({
          ...current,
          journeyEntries,
          adventureCount: journeyEntries.length,
        }))
      })
    }
  }

  const handleUpdateDog = (
    dogId: string,
    patch: { name?: string; breed?: string; age?: string; profileEmoji?: string },
  ) => {
    setState((current) => ({
      ...current,
      dogs: current.dogs.map((dog) =>
        dog.id === dogId
          ? {
              ...dog,
              ...patch,
              initial: patch.name ? patch.name.charAt(0).toUpperCase() : dog.initial,
            }
          : dog,
      ),
    }))
    if (useProductionBackend && auth.user) {
      void updateDogForUser(auth.user.id, dogId, patch)
    }
  }

  const handleRemoveDog = (dogId: string) => {
    setState((current) => {
      const dogs = current.dogs.filter((dog) => dog.id !== dogId)
      const activeDogId =
        current.activeDogId === dogId ? (dogs[0]?.id ?? null) : current.activeDogId

      if (useProductionBackend && auth.user) {
        void deleteDogForUser(auth.user.id, dogId).then((ok) => {
          if (ok) void setActiveDog(auth.user!.id, activeDogId ?? null)
        })
      }

      return applyRealUserContent({
        ...current,
        dogs,
        activeDogId,
        hasUserDogProfile: dogs.length > 0,
      })
    })
  }

  useEffect(() => {
    if (state.activeTab === 'profile') return
    if (state.activeTab === 'achievements') return
    const mode = isDemoMode ? 'demo' : 'app'
    if (isNavTabVisible(state.activeTab, mode)) return
    setState((current) => ({ ...current, activeTab: getDefaultNavTab() }))
  }, [state.activeTab, isDemoMode])

  const clearMemorySaveToast = () => {
    setState((current) => ({ ...current, memorySaveToast: null }))
  }

  const closePackInvite = () => {
    setState((current) => ({ ...current, showPackInviteOverlay: false }))
  }

  const openPackInvite = () => {
    setState((current) => ({ ...current, showPackInviteOverlay: true }))
  }

  const submitPackInvite = async (payload: PackInvitePayload) => {
    const roleValue = packRoleValueForInvite(payload.role)

    if (useProductionBackend && !auth.user) {
      throw new Error('Log in again before sending a Pack Access invite.')
    }

    if (useProductionBackend && auth.user) {
      await sendPackInvite(payload)
      const refreshedMembers = await fetchPackAccessMembers(auth.user.id)
      setState((current) => ({
        ...current,
        showPackInviteOverlay: false,
        packAccessMembers: [
          ...refreshedMembers,
          {
            id: `invite-${payload.email}`,
            name: payload.email,
            role: roleLabelForPackRole(roleValue),
            accessLevel: accessLevelForPackRole(roleValue),
            accessDescription: accessDescriptionForPackRole(roleValue),
            lastActivity: 'Invite sent',
            inviteStatus: 'pending',
            contactLabel: payload.email,
          },
        ],
        packAccessToast: `Invite emailed to ${payload.email}.`,
      }))
      return
    }

    setState((current) => ({
      ...current,
      showPackInviteOverlay: false,
      packAccessMembers: [
        ...current.packAccessMembers,
        {
          id: `pack-${Date.now()}`,
          name: payload.email,
          role: roleLabelForPackRole(roleValue),
          accessLevel: accessLevelForPackRole(roleValue),
          accessDescription: accessDescriptionForPackRole(roleValue),
          lastActivity: 'Invite saved',
          inviteStatus: 'pending',
          contactLabel: payload.email,
        },
      ],
      packAccessToast: `Demo invite saved for ${payload.email}.`,
    }))

    if (auth.user) {
      void trackUserEvent(
        'pack_invite_saved',
        {
          role: roleValue,
          delivery: 'demo_pending',
        },
        auth.user.id,
      )
    }
  }

  const submitChallengeRequest = async (cityOrZip: string): Promise<boolean> => {
    if (useProductionBackend && auth.user) {
      return createChallengeRequest({ cityOrZip })
    }
    return true
  }

  useEffect(() => {
    if (!state.packAccessToast) return
    const timer = window.setTimeout(() => {
      setState((current) => ({ ...current, packAccessToast: null }))
    }, 3200)
    return () => window.clearTimeout(timer)
  }, [state.packAccessToast])

  if (!splashComplete) {
    return <SplashScreen />
  }

  if (!dataHydrated && useProductionBackend) {
    return (
      <div className="auth-viewport">
        <div className="content-studio">
          <div className="cs-empty">Loading your pack…</div>
        </div>
      </div>
    )
  }

  if (
    !state.onboardingComplete ||
    (useProductionBackend && auth.configured && !auth.user)
  ) {
    const initialAuthMode = getAppEntryAuthMode()
    const initialStep =
      useProductionBackend && auth.user && !state.onboardingComplete
        ? 3
        : initialAuthMode === 'signin'
          ? 2
          : 1

    return (
      <OnboardingFlow
        onComplete={completeOnboarding}
        initialStep={initialStep}
        initialAuthMode={initialAuthMode}
        authConfigured={useProductionBackend}
        authUserId={auth.user?.id ?? null}
        authLoading={authLoading}
        authError={authError}
        onEmailAuth={handleEmailAuth}
        onGoogleAuth={handleGoogleAuth}
        onMagicLink={handleMagicLink}
        onPasswordReset={handlePasswordReset}
      />
    )
  }

  const activeAdventureBannerNode = showActiveAdventureBanner(
    state.activeAdventure,
    state.activeAdventureView,
  ) ? (
    <ActiveAdventureBanner
      state={state}
      onResume={focusActiveAdventure}
      onFinish={finishActiveAdventureFromBanner}
      onCancel={requestCancelAdventure}
    />
  ) : null

  const activeAdventureOverlayNode = shouldShowFocusedAdventure(
    state.activeAdventure,
    state.activeAdventureView,
  ) ? (
    <div className="active-adventure-overlay">
      <ActiveAdventureScreen
        state={state}
        onStart={startAdventureSession}
        onCancel={requestCancelAdventure}
        onFinish={finishAdventure}
        onMinimize={
          state.activeAdventure?.started ? minimizeActiveAdventure : undefined
        }
        onAddPhoto={addAdventurePhoto}
      />
    </div>
  ) : null

  if (state.showAddAdventureFlow) {
    return (
      <AddAdventureFlow
        state={state}
        draft={state.addAdventureDraft}
        onBack={closeAddAdventureFlow}
        onTitleChange={(title) => updateAddAdventureDraft({ title })}
        onLocationChange={(locationLabel) =>
          updateAddAdventureDraft({ locationLabel })
        }
        onNotesChange={(notes) => updateAddAdventureDraft({ notes })}
        onToggleDog={toggleAddAdventureDog}
        onPhotoChange={(photoDataUrl) => updateAddAdventureDraft({ photoDataUrl })}
        onStartNow={submitAddAdventureStartNow}
        onSaveForLater={() => void submitAddAdventureSaveForLater()}
      />
    )
  }

  if (state.buildMyMonthFlowStep > 0) {
    return (
      <BuildMyMonthFlow
        state={state}
        step={state.buildMyMonthFlowStep}
        draft={state.buildMyMonthDraft}
        result={state.monthlyPlanResult}
        onBack={handleBuildMyMonthBack}
        onSelectVibe={setBuildMyMonthVibe}
        onToggleCategory={toggleBuildMyMonthCategory}
        onSelectFrequency={setBuildMyMonthFrequency}
        onSelectDays={setBuildMyMonthDays}
        onNext={advanceBuildMyMonthFlow}
        onSave={saveBuildMyMonthFlow}
        onStartFirstAdventure={startAdventureFromMonthlyPlan}
      />
    )
  }

  if (state.trainingProgramFlowStep > 0) {
    return (
      <TrainingProgramFlow
        state={state}
        step={state.trainingProgramFlowStep}
        draft={state.trainingProgramDraft}
        schedule={state.activeTrainingSchedule}
        onBack={handleTrainingProgramBack}
        onSelectProgram={setTrainingProgramSelection}
        onSelectCadence={setTrainingCadence}
        onNext={advanceTrainingProgramFlow}
        onSave={saveTrainingProgramFlow}
        onOpenLesson={openTrainingProgram}
      />
    )
  }

  if (state.curatedPlanFlowStep > 0) {
    return (
      <CuratedPlanFlow
        state={state}
        step={state.curatedPlanFlowStep}
        draft={state.curatedPlanDraft}
        result={state.curatedPlanResult}
        onBack={handleCuratedPlanBack}
        onToggleOptimize={setCuratedOptimize}
        onSelectTime={setCuratedTime}
        onToggleLove={toggleCuratedLove}
        onNext={advanceCuratedPlanFlow}
        onFinish={finishCuratedPlanFlow}
        onStartWeek={startWeekFromCuratedPlan}
        onStartAdventure={(placeId) => {
          if (placeId === 'neighborhood-walk') {
            startNeighborhoodWalk()
            return
          }
          startAdventure(placeId)
        }}
      />
    )
  }

  if (state.showPackInviteOverlay && LIVE_PRODUCT.packAccess) {
    return (
      <PackInviteOverlay onClose={closePackInvite} onSubmit={submitPackInvite} />
    )
  }

  if (state.showJourneyLevelOverlay) {
    return <JourneyLevelDetailView state={state} onBack={closeJourneyLevelDetail} />
  }

  if (state.showJourneyMapOverlay) {
    return (
      <JourneyMapView
        state={state}
        onBack={closeJourneyMap}
        onOpenMemory={openJourneyMemory}
      />
    )
  }

  if (state.showPresetPlanOverlay && LIVE_PRODUCT.calendarPresetPlan) {
    return <PresetPlanOverlay onClose={closePresetPlanOverlay} isDemoMode={isDemoMode} />
  }

  if (state.showCommunityCompose && isDemoMode) {
    return (
      <CommunityComposeOverlay
        state={state}
        onClose={closeCommunityCompose}
        onSubmit={submitCommunityPost}
      />
    )
  }

  if (state.selectedTrainingProgramId) {
    const program = getTrainingProgramById(state.selectedTrainingProgramId)
    if (program) {
      return (
        <>
          <AppShell
            activeTab={state.activeTab}
            onTabChange={setActiveTab}
            isDemoMode={isDemoMode}
            showNavigation={false}
            activeAdventureBanner={activeAdventureBannerNode}
            scrollKey={`training-${state.selectedTrainingProgramId}`}
          >
            <TrainingProgramDetailView
              program={program}
              state={state}
              onBack={closeTrainingProgram}
              onCompleteLesson={completeTrainingLesson}
              onResetLesson={resetTrainingLesson}
            />
          </AppShell>
          {activeAdventureOverlayNode}
        </>
      )
    }
  }

  if (state.selectedChallengeId) {
    const challenge = getChallengeById(state.selectedChallengeId)
    if (challenge) {
      return (
        <>
          <AppShell
            activeTab={state.activeTab}
            onTabChange={setActiveTab}
            isDemoMode={isDemoMode}
            showNavigation={false}
            activeAdventureBanner={activeAdventureBannerNode}
            scrollKey={`challenge-${state.selectedChallengeId}`}
          >
            <ChallengePathDetailView
              challenge={challenge}
              state={state}
              onBack={closeChallengeDetail}
              onJoinChallenge={joinChallenge}
              onLeaveChallenge={leaveChallenge}
              onStartAdventure={startAdventure}
              onStartNeighborhoodWalk={startNeighborhoodWalk}
              onGoToPlan={() => setActiveTab('plan')}
              onOpenMemory={openJourneyMemory}
            />
          </AppShell>
          {activeAdventureOverlayNode}
        </>
      )
    }
  }

  if (state.selectedAchievementId) {
    const achievement = state.achievements.find(
      (item) => item.id === state.selectedAchievementId,
    )
    const personalize = shouldPersonalizeContent(state)
    if (achievement) {
      return (
        <AchievementDetailView
          achievement={achievement}
          dogs={personalize ? state.dogs : []}
          onBack={closeAchievementDetail}
        />
      )
    }
  }

  if (state.selectedJourneyEntryId) {
    const entry = state.journeyEntries.find(
      (item) => item.id === state.selectedJourneyEntryId,
    )
    const personalize = shouldPersonalizeContent(state)
    if (entry) {
      return (
        <JourneyMemoryView
          entry={entry}
          dogs={state.dogs}
          hasUserDogProfile={personalize}
          packAccessMembers={state.packAccessMembers}
          onBack={closeJourneyMemory}
          onGoAgain={goAgainFromMemory}
        />
      )
    }
  }

  const screenTab =
    state.activeTab === 'profile'
      ? 'profile'
      : state.activeTab === 'achievements'
        ? 'achievements'
      : isNavTabVisible(state.activeTab, isDemoMode ? 'demo' : 'app')
        ? state.activeTab
        : getDefaultNavTab()

  const renderScreen = () => {
    switch (screenTab) {
      case 'home':
        return (
          <HomeScreen
            state={state}
            isDemoMode={isDemoMode}
            onSelectActivity={setSelectedActivity}
            onStartAdventure={startAdventure}
            onStartNeighborhoodWalk={startNeighborhoodWalk}
            onOpenProfile={() => setActiveTab('profile')}
            onOpenChallenge={openChallengeDetail}
            onOpenMemory={openJourneyMemory}
            onGoToPlan={() => setActiveTab('plan')}
            onOpenBuildMyMonth={openBuildMyMonthFlow}
            onStartMonthlyPlanAdventure={startAdventureFromMonthlyPlan}
            onContinueTraining={continueTrainingFromHome}
            onOpenAddAdventure={openAddAdventureFlow}
            onOpenTrainingProgramFlow={openTrainingProgramFlow}
            onGoToCommunity={() => setActiveTab('community')}
            onGoToChallenges={() => setActiveTab('milestones')}
          />
        )
      case 'plan':
        return (
          <PlanScreen
            state={state}
            isDemoMode={isDemoMode}
            onSelectCategory={setSelectedPlanCategory}
            onZipChange={setZipCode}
            onApplyLocation={applyLocationFromZip}
            onStartAdventure={startAdventure}
            onStartNeighborhoodWalk={startNeighborhoodWalk}
            onOpenAddAdventure={openAddAdventureFlow}
            onStartPlannedAdventure={startPlannedAdventure}
            onDeletePlannedAdventure={(id) => void deletePlannedAdventure(id)}
            onOpenBuildMyMonth={openBuildMyMonthFlow}
            onGenerateRandomPlan={generateRandomPlanForDogs}
            onOpenPresetPlan={openPresetPlanOverlay}
            onOpenChallenge={openChallengeDetail}
            onJoinChallenge={joinChallenge}
            onOpenTrainingProgram={openTrainingProgramFlow}
          />
        )
      case 'journey':
        return (
          <JourneyScreen
            state={state}
            isDemoMode={isDemoMode}
            onOpenMemory={openJourneyMemory}
            onOpenMap={openJourneyMap}
            onGoToPlan={() => setActiveTab('plan')}
            onDismissToast={clearMemorySaveToast}
          />
        )
      case 'community':
        if (!isNavTabVisible('community', isDemoMode ? 'demo' : 'app')) {
          return null
        }
        return <CommunityScreen />
      case 'achievements':
        return (
          <AchievementsScreen
            state={state}
            onOpenAchievement={openAchievementDetail}
          />
        )
      case 'milestones':
        return (
          <MilestonesScreen
            state={state}
            isDemoMode={isDemoMode}
            onOpenChallenge={openChallengeDetail}
            onJoinChallenge={joinChallenge}
            onOpenAchievements={() => setActiveTab('achievements')}
            onRequestChallenge={submitChallengeRequest}
          />
        )
      case 'profile':
        return (
          <ProfileScreen
            state={state}
            isDemoMode={isDemoMode}
            accountEmail={auth.user?.email ?? null}
            onSetActiveDog={handleSetActiveDog}
            onUpdateDog={handleUpdateDog}
            onRemoveDog={handleRemoveDog}
            onOpenPackInvite={openPackInvite}
            onZipChange={setZipCode}
            onApplyLocation={applyLocationFromZip}
            onSignOut={useProductionBackend ? handleSignOut : undefined}
          />
        )
      default:
        return null
    }
  }

  return (
    <>
      <AppShell
        activeTab={state.activeTab}
        onTabChange={setActiveTab}
        isDemoMode={isDemoMode}
        activeAdventureBanner={activeAdventureBannerNode}
        scrollKey={screenTab}
      >
        {renderScreen()}
        {LIVE_PRODUCT.packAccess && state.packAccessToast ? (
          <div className="memory-toast memory-toast--shell" role="status">
            {state.packAccessToast}
          </div>
        ) : null}
      </AppShell>
      {activeAdventureOverlayNode}
      {completionReward ? (
        <AdventureCompletionReward
          summary={completionReward}
          onClose={() => setCompletionReward(null)}
          onViewMemory={viewCompletedMemory}
          onFindNextAdventure={findNextAdventureFromCompletion}
        />
      ) : null}
    </>
  )
}

function App() {
  const pathname = usePathname()
  const demoRoute = getDemoRoute(pathname)

  useEffect(() => {
    const shouldNoIndex =
      pathname.startsWith('/demo') || pathname.startsWith('/internal')
    let meta = document.querySelector('meta[name="robots"]')
    if (shouldNoIndex) {
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute('name', 'robots')
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', 'noindex, nofollow')
    } else if (meta) {
      meta.remove()
    }
  }, [pathname])

  useEffect(() => {
    document.documentElement.classList.toggle('landing-route', isMarketingRoute(pathname))
    return () => {
      document.documentElement.classList.remove('landing-route')
    }
  }, [pathname])

  if (isContentStudioRoute(pathname)) {
    return <ContentStudio />
  }

  if (isFeedbackDashboardRoute(pathname)) {
    return <FeedbackDashboard />
  }

  if (isEarlyAccessRoute(pathname)) {
    return <EarlyAccessScreen />
  }

  if (isLandingRoute(pathname)) {
    return <LandingPage />
  }

  if (isStartRoute(pathname)) {
    return <StartPage />
  }

  if (demoRoute === 'launcher') {
    return (
      <DemoLauncher
        onOpenFullDemo={() => {
          saveSeededDemoState()
          navigateTo(ROUTES.demoApp)
        }}
        onTryOnboarding={() => {
          saveDemoOnboardingState()
          navigateTo(ROUTES.demoOnboarding)
        }}
        onResetDemo={() => {
          clearDemoState()
          navigateTo(ROUTES.demoLaunch)
        }}
      />
    )
  }

  // Production app at /app; demo sandbox at /demo and /demo/app
  if (!isProductionAppRoute(pathname) && demoRoute === null) {
    return <LandingPage />
  }

  return <AppExperience key={pathname} demoRoute={demoRoute} />
}

export default App
