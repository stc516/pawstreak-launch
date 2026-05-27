import { useEffect, useState } from 'react'
import type { AppState, CommunityPost, TabId } from './data/demo'
import { createActiveAdventure } from './data/demo'
import type { AdventureFinishPayload } from './lib/adventureFinish'
import {
  createJourneyEntryFromPlace,
  getPlaceById,
} from './data/places'
import { loadAppState, saveAppState, clearDemoState, saveSeededDemoState, saveDemoOnboardingState } from './lib/storage'
import { getDemoRoute, navigateTo } from './lib/demoRoute'
import { usePathname } from './lib/usePathname'
import {
  isContentStudioRoute,
  isEarlyAccessRoute,
  isFeedbackDashboardRoute,
} from './lib/internalRoute'
import { isLandingRoute, isProductionAppRoute, ROUTES } from './lib/routes'
import { LandingPage } from './screens/landing/LandingPage'
import { ContentStudio } from './screens/internal/ContentStudio'
import { FeedbackDashboard } from './screens/internal/FeedbackDashboard'
import { EarlyAccessScreen } from './screens/EarlyAccessScreen'
import { DemoLauncher } from './screens/demo/DemoLauncher'
import type { DemoRoute } from './lib/demoRoute'
import { shouldPersonalizeContent, getDisplayDogLabel } from './lib/profileDisplay'
import { SAMPLE_IMAGES } from './data/sampleImages'
import { fillPhotoSlots } from './lib/imageUtils'
import { AppShell } from './components/AppShell'
import { ActiveAdventureScreen } from './screens/app/ActiveAdventureScreen'
import { HomeScreen } from './screens/app/HomeScreen'
import { CommunityScreen } from './screens/app/CommunityScreen'
import { JourneyScreen } from './screens/app/JourneyScreen'
import { MilestonesScreen } from './screens/app/MilestonesScreen'
import { ProfileScreen } from './screens/app/ProfileScreen'
import { OnboardingFlow } from './screens/onboarding/OnboardingFlow'
import { JourneyMemoryView } from './screens/overlays/JourneyMemoryView'
import { JourneyLevelDetailView } from './screens/overlays/JourneyLevelDetailView'
import { JourneyMapView } from './screens/overlays/JourneyMapView'
import { ChallengeDetailView } from './screens/overlays/ChallengeDetailView'
import { CuratedPlanFlow } from './screens/overlays/CuratedPlanFlow'
import { AchievementDetailView } from './screens/overlays/AchievementDetailView'
import { CommunityComposeOverlay } from './screens/overlays/CommunityComposeOverlay'
import { PackInviteOverlay } from './screens/overlays/PackInviteOverlay'
import type { PackInvitePayload } from './screens/overlays/PackInviteOverlay'
import { PresetPlanOverlay } from './screens/overlays/PresetPlanOverlay'
import { PlanScreen } from './screens/app/PlanScreen'
import {
  EMPTY_CURATED_PLAN_DRAFT,
  generateCuratedPlanResult,
} from './lib/curatedPlan'
import { generateRandomPlan } from './lib/randomPlan'
import type { OnboardingResult } from './lib/onboardingProfile'
import { applyOnboardingToAppState } from './lib/onboardingProfile'
import {
  accessDescriptionFor,
  roleLabelForInvite,
} from './data/packAccess'
import { useAuth } from './context/AuthContext'
import {
  cancelAdventureOnServer,
  finishAdventureOnServer,
  hydrateProductionState,
  persistOnboardingToSupabase,
  startAdventureOnServer,
} from './lib/appDataSync'
import { applyRealUserContent } from './lib/productionState'
import { setActiveDog, updateDogForUser } from './lib/db/dogs'
import { fetchMemoriesForUser, countDistinctPlaces, memoryRowToJourneyEntry } from './lib/db/memories'
import { insertEarlyAccessSignup } from './lib/db/earlyAccess'
import { trackUserEvent } from './lib/db/userEvents'
import { ensureProfileShell } from './lib/db/profiles'
import { signInWithEmail, signUpWithEmail } from './lib/auth'

function AppExperience({ demoRoute }: { demoRoute: DemoRoute | null }) {
  const auth = useAuth()
  const appMode = demoRoute !== null ? 'demo' : 'app'
  const isDemoMode = appMode === 'demo' && demoRoute === 'app'
  const useProductionBackend = appMode === 'app' && auth.configured
  const [state, setState] = useState<AppState>(() => loadAppState(appMode, demoRoute))
  const [authError, setAuthError] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(false)
  const [dataHydrated, setDataHydrated] = useState(!useProductionBackend)

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
        !current.challenges.some(
          (challenge) => challenge.id === current.selectedChallengeId,
        )
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

      if (Object.keys(patch).length === 0) {
        return current
      }

      return { ...current, ...patch }
    })
  }, [
    state.journeyEntries,
    state.challenges,
    state.selectedJourneyEntryId,
    state.selectedChallengeId,
    state.selectedAchievementId,
  ])

  const setActiveTab = (activeTab: TabId) => {
    setState((current) => ({
      ...current,
      activeTab,
      selectedJourneyEntryId: null,
      selectedChallengeId: null,
      selectedAchievementId: null,
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

  const setSelectedJourneyFilter = (selectedJourneyFilterId: string) => {
    if (selectedJourneyFilterId === 'map-view') {
      setState((current) => ({
        ...current,
        selectedJourneyFilterId: 'map-view',
        showJourneyMapOverlay: true,
        selectedJourneyEntryId: null,
        selectedChallengeId: null,
        showPresetPlanOverlay: false,
      }))
      return
    }

    setState((current) => ({
      ...current,
      selectedJourneyFilterId,
      showJourneyMapOverlay: false,
    }))
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
      selectedJourneyEntryId,
      selectedChallengeId: null,
      showPresetPlanOverlay: false,
      showJourneyMapOverlay: false,
    }))
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
      showPresetPlanOverlay: false,
    }))
  }

  const closeChallengeDetail = () => {
    setState((current) => ({ ...current, selectedChallengeId: null }))
  }

  const openAchievementDetail = (selectedAchievementId: string) => {
    setState((current) => ({
      ...current,
      selectedAchievementId,
      selectedChallengeId: null,
      selectedJourneyEntryId: null,
      showPresetPlanOverlay: false,
    }))
  }

  const closeAchievementDetail = () => {
    setState((current) => ({ ...current, selectedAchievementId: null }))
  }

  const openJourneyLevelDetail = () => {
    setState((current) => ({
      ...current,
      showJourneyLevelOverlay: true,
      selectedChallengeId: null,
      selectedAchievementId: null,
      selectedJourneyEntryId: null,
      showPresetPlanOverlay: false,
      showJourneyMapOverlay: false,
    }))
  }

  const closeJourneyLevelDetail = () => {
    setState((current) => ({ ...current, showJourneyLevelOverlay: false }))
  }

  const openCuratedPlanFlow = () => {
    setState((current) => ({
      ...current,
      activeTab: 'plan',
      curatedPlanFlowStep: 1,
      curatedPlanDraft: EMPTY_CURATED_PLAN_DRAFT,
      selectedJourneyEntryId: null,
      selectedChallengeId: null,
      showPresetPlanOverlay: false,
    }))
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

      return {
        ...current,
        curatedPlanFlowStep: 0,
        selectedMonthlyPlanId: 'curated',
        activeAdventure: createActiveAdventure(first.placeId, first.name, '30 min'),
        adventurePhotos: ['', '', ''],
      }
    })
  }

  const generateRandomPlanForDogs = () => {
    setState((current) => ({
      ...current,
      activeTab: 'plan',
      selectedMonthlyPlanId: 'random',
      randomPlanResult: generateRandomPlan(current.dogs),
      curatedPlanResult: null,
      curatedPlanFlowStep: 0,
    }))
  }

  const openPresetPlanOverlay = () => {
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
      }
    })
  }

  const cancelAdventure = () => {
    if (useProductionBackend && auth.user && state.activeAdventure) {
      void cancelAdventureOnServer(auth.user.id, state.activeAdventure)
    }

    setState((current) => ({
      ...current,
      activeAdventure: null,
      adventurePhotos: ['', '', ''],
    }))
  }

  const toggleCommunityLike = (postId: string) => {
    setState((current) => ({
      ...current,
      communityPosts: current.communityPosts.map((post) => {
        if (post.id !== postId) return post
        const likedByUser = !post.likedByUser
        return {
          ...post,
          likedByUser,
          likes: Math.max(0, post.likes + (likedByUser ? 1 : -1)),
        }
      }),
    }))
  }

  const addCommunityComment = (postId: string, text: string) => {
    setState((current) => ({
      ...current,
      communityPosts: current.communityPosts.map((post) => {
        if (post.id !== postId) return post
        const comment = {
          id: `comment-${Date.now()}`,
          author: 'You',
          initial: current.dogs[0]?.initial ?? 'Y',
          text,
        }
        return {
          ...post,
          comments: post.comments + 1,
          commentList: [...(post.commentList ?? []), comment],
        }
      }),
    }))
  }

  const openCommunityCompose = () => {
    setState((current) => ({
      ...current,
      showCommunityCompose: true,
      selectedJourneyEntryId: null,
      selectedChallengeId: null,
      selectedAchievementId: null,
    }))
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

  const addQuickCommunityPost = (caption: string) => {
    setState((current) => {
      const post: CommunityPost = {
        id: `quick-post-${Date.now()}`,
        photoUrl: SAMPLE_IMAGES.beach,
        avatarClass: 'cp-av1',
        initial: current.dogs[0]?.initial ?? 'Y',
        name: getDisplayDogLabel(current),
        meta: 'Just now · quick share',
        caption,
        location: 'San Diego · out with the pack',
        likes: 0,
        comments: 0,
        likedByUser: false,
        commentList: [],
        isUserPost: true,
      }

      return {
        ...current,
        activeTab: 'community',
        communityPosts: [post, ...current.communityPosts],
        memorySaveToast: 'Posted to the pack — saved locally.',
      }
    })
  }

  const startAdventure = async (placeId: string, durationLabel = 'Open end') => {
    const place = getPlaceById(placeId)
    if (!place) return

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
          adventurePhotos: ['', '', ''],
          selectedJourneyEntryId: null,
          selectedChallengeId: null,
          showPresetPlanOverlay: false,
          curatedPlanFlowStep: 0,
        }))
        return
      }
    }

    setState((current) => ({
      ...current,
      activeAdventure: createActiveAdventure(
        place.id,
        place.name,
        durationLabel,
        {
          dogId: activeDogId,
          selectedDogIds: current.dogs.map((dog) => dog.id),
        },
      ),
      adventurePhotos: ['', '', ''],
      selectedJourneyEntryId: null,
      selectedChallengeId: null,
      showPresetPlanOverlay: false,
      curatedPlanFlowStep: 0,
    }))
  }

  const goAgainFromMemory = (placeId: string) => {
    const place = getPlaceById(placeId)
    if (!place) return

    setState((current) => ({
      ...current,
      selectedJourneyEntryId: null,
      activeAdventure: createActiveAdventure(place.id, place.name, 'Open end', {
        dogId: current.activeDogId ?? current.dogs[0]?.id,
        selectedDogIds: current.dogs.map((dog) => dog.id),
      }),
      adventurePhotos: ['', '', ''],
    }))
  }

  const finishAdventure = async (payload: AdventureFinishPayload) => {
    if (!state.activeAdventure) {
      setState((current) => ({ ...current, activeTab: 'journey', adventurePhotos: ['', '', ''] }))
      return
    }

    const place = getPlaceById(state.activeAdventure.placeId)
    const capturedPhotos = state.adventurePhotos.filter(Boolean)
    const activeDogId = state.activeDogId ?? state.dogs[0]?.id

    if (useProductionBackend && auth.user && activeDogId && place) {
      try {
        const memory = await finishAdventureOnServer({
          userId: auth.user.id,
          dogId: activeDogId,
          activeAdventure: state.activeAdventure,
          dogs: state.dogs,
          photoDataUrls: capturedPhotos,
          payload,
        })
        await memoryRowToJourneyEntry(memory)
        const journeyEntries = await fetchMemoriesForUser(auth.user.id, activeDogId)
        const placeCount = await countDistinctPlaces(auth.user.id, activeDogId)

        setState((current) =>
          applyRealUserContent({
            ...current,
            activeAdventure: null,
            activeTab: 'journey',
            adventureCount: journeyEntries.length,
            placeCount,
            journeyEntries,
            adventurePhotos: ['', '', ''],
            memorySaveToast: 'Memory saved — worth remembering.',
          }),
        )
        return
      } catch {
        setState((current) => ({
          ...current,
          memorySaveToast: 'Could not save memory. Check your connection and try again.',
        }))
        return
      }
    }

    setState((current) => {
      if (!current.activeAdventure) {
        return { ...current, activeTab: 'journey', adventurePhotos: ['', '', ''] }
      }

      const journeyEntries = place
        ? [
            createJourneyEntryFromPlace(place, current.dogs, {
              photoUrls: capturedPhotos,
              durationLabel: current.activeAdventure.durationLabel,
              recapLabels: payload.recapLabels,
            }),
            ...current.journeyEntries,
          ]
        : current.journeyEntries

      const adventureCount = journeyEntries.length
      const placeCount = new Set(
        journeyEntries.map((entry) => entry.placeId).filter(Boolean),
      ).size

      return applyRealUserContent({
        ...current,
        activeAdventure: null,
        activeTab: 'journey',
        adventureCount,
        placeCount,
        journeyEntries,
        adventurePhotos: ['', '', ''],
        memorySaveToast: 'Memory saved — worth remembering.',
      })
    })
  }

  const completeOnboarding = async (result: OnboardingResult) => {
    if (useProductionBackend && auth.user) {
      await persistOnboardingToSupabase(auth.user.id, auth.user.email, result)
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
      setState((current) => ({
        ...current,
        ...hydrated,
        ...applyOnboardingToAppState(current, result),
        mode: appMode,
      }))
      saveAppState(
        {
          ...state,
          ...hydrated,
          ...applyOnboardingToAppState(state, result),
          mode: appMode,
        },
        appMode,
      )
      return
    }

    setState((current) => {
      const nextState: AppState = {
        ...current,
        ...applyOnboardingToAppState(current, result),
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
  ) => {
    setAuthLoading(true)
    setAuthError(null)
    try {
      if (mode === 'signup') {
        const data = await signUpWithEmail(input.email, input.password)
        if (data.user) {
          await ensureProfileShell(data.user.id, input.email)
          await trackUserEvent('signup', { email: input.email }, data.user.id)
        }
      } else {
        await signInWithEmail(input.email, input.password)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed'
      setAuthError(message)
      throw error
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
    patch: { name?: string; breed?: string; profileEmoji?: string },
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

  const clearMemorySaveToast = () => {
    setState((current) => ({ ...current, memorySaveToast: null }))
  }

  const openPackInvite = () => {
    setState((current) => ({ ...current, showPackInviteOverlay: true }))
  }

  const closePackInvite = () => {
    setState((current) => ({ ...current, showPackInviteOverlay: false }))
  }

  const submitPackInvite = (payload: PackInvitePayload) => {
    setState((current) => ({
      ...current,
      showPackInviteOverlay: false,
      packAccessMembers: [
        ...current.packAccessMembers,
        {
          id: `pack-${Date.now()}`,
          name: payload.name,
          role: roleLabelForInvite(payload.role),
          accessLevel:
            payload.role === 'Dog Mom / Dog Dad'
              ? 'Family access'
              : payload.role === 'Walker / Sitter'
                ? 'Helper access'
                : `${payload.role} access`,
          accessDescription: accessDescriptionFor(payload.accessLevels),
          lastActivity: 'Invite saved locally',
        },
      ],
      packAccessToast: 'Invite saved locally — real invites coming later.',
    }))
  }

  useEffect(() => {
    if (!state.packAccessToast) return
    const timer = window.setTimeout(() => {
      setState((current) => ({ ...current, packAccessToast: null }))
    }, 3200)
    return () => window.clearTimeout(timer)
  }, [state.packAccessToast])

  if (!dataHydrated && useProductionBackend) {
    return (
      <div className="content-studio">
        <div className="cs-empty">Loading your pack…</div>
      </div>
    )
  }

  if (
    !state.onboardingComplete ||
    (useProductionBackend && auth.configured && !auth.user)
  ) {
    const initialStep =
      useProductionBackend && auth.user && !state.onboardingComplete ? 3 : 1

    return (
      <OnboardingFlow
        onComplete={completeOnboarding}
        initialStep={initialStep}
        authConfigured={useProductionBackend}
        authLoading={authLoading}
        authError={authError}
        onEmailAuth={handleEmailAuth}
        onGoogleAuth={handleGoogleAuth}
      />
    )
  }

  if (state.activeAdventure) {
    return (
      <ActiveAdventureScreen
        state={state}
        onStart={startAdventureSession}
        onCancel={cancelAdventure}
        onFinish={finishAdventure}
        onTabChange={setActiveTab}
        onAddPhoto={addAdventurePhoto}
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
      />
    )
  }

  if (state.showPackInviteOverlay) {
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

  if (state.showPresetPlanOverlay) {
    return <PresetPlanOverlay onClose={closePresetPlanOverlay} />
  }

  if (state.showCommunityCompose) {
    return (
      <CommunityComposeOverlay
        state={state}
        onClose={closeCommunityCompose}
        onSubmit={submitCommunityPost}
      />
    )
  }

  if (state.selectedChallengeId) {
    const challenge = state.challenges.find(
      (item) => item.id === state.selectedChallengeId,
    )
    const personalize = shouldPersonalizeContent(state)
    if (challenge) {
      return (
        <ChallengeDetailView
          challenge={challenge}
          dogs={personalize ? state.dogs : []}
          onBack={closeChallengeDetail}
        />
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

  const renderScreen = () => {
    switch (state.activeTab) {
      case 'home':
        return (
          <HomeScreen
            state={state}
            onSelectActivity={setSelectedActivity}
            onStartAdventure={startAdventure}
            onOpenProfile={() => setActiveTab('profile')}
            onOpenJourney={() => setActiveTab('journey')}
          />
        )
      case 'plan':
        return (
          <PlanScreen
            state={state}
            onSelectCategory={setSelectedPlanCategory}
            onZipChange={setZipCode}
            onStartAdventure={startAdventure}
            onOpenCuratedPlanFlow={openCuratedPlanFlow}
            onGenerateRandomPlan={generateRandomPlanForDogs}
            onOpenPresetPlan={openPresetPlanOverlay}
          />
        )
      case 'journey':
        return (
          <JourneyScreen
            state={state}
            onSelectFilter={setSelectedJourneyFilter}
            onOpenMemory={openJourneyMemory}
            onOpenMap={openJourneyMap}
            onGoToPlan={() => setActiveTab('plan')}
            onDismissToast={clearMemorySaveToast}
          />
        )
      case 'community':
        return (
          <CommunityScreen
            state={state}
            onToggleLike={toggleCommunityLike}
            onAddComment={addCommunityComment}
            onQuickShare={addQuickCommunityPost}
            onOpenCompose={openCommunityCompose}
            onDismissToast={clearMemorySaveToast}
          />
        )
      case 'milestones':
        return (
          <MilestonesScreen
            state={state}
            onOpenChallenge={openChallengeDetail}
            onOpenAchievement={openAchievementDetail}
            onOpenJourneyLevel={openJourneyLevelDetail}
          />
        )
      case 'profile':
        return (
          <ProfileScreen
            state={state}
            onOpenPackInvite={openPackInvite}
            onSetActiveDog={handleSetActiveDog}
            onUpdateDog={handleUpdateDog}
            onSignOut={useProductionBackend ? auth.signOut : undefined}
          />
        )
      default:
        return (
          <div className="placeholder-screen">
            <div className="sec">Coming soon</div>
            <p className="placeholder-copy">This screen is not built yet.</p>
          </div>
        )
    }
  }

  return (
    <AppShell activeTab={state.activeTab} onTabChange={setActiveTab} isDemoMode={isDemoMode}>
      {renderScreen()}
      {state.packAccessToast ? (
        <div className="memory-toast memory-toast--shell" role="status">
          {state.packAccessToast}
        </div>
      ) : null}
    </AppShell>
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
    document.documentElement.classList.toggle('landing-route', isLandingRoute(pathname))
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
