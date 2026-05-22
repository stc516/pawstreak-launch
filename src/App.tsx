import { useEffect, useState } from 'react'
import type { AppState, CommunityPost, TabId } from './data/demo'
import { createActiveAdventure } from './data/demo'
import type { AdventureFinishPayload } from './lib/adventureFinish'
import {
  createJourneyEntryFromPlace,
  getPlaceById,
} from './data/places'
import { loadAppState, saveAppState } from './lib/storage'
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
import { ChallengeDetailView } from './screens/overlays/ChallengeDetailView'
import { CuratedPlanFlow } from './screens/overlays/CuratedPlanFlow'
import { AchievementDetailView } from './screens/overlays/AchievementDetailView'
import { CommunityComposeOverlay } from './screens/overlays/CommunityComposeOverlay'
import { PresetPlanOverlay } from './screens/overlays/PresetPlanOverlay'
import { PlanScreen } from './screens/app/PlanScreen'
import {
  EMPTY_CURATED_PLAN_DRAFT,
  generateCuratedPlanResult,
} from './lib/curatedPlan'
import { generateRandomPlan } from './lib/randomPlan'
import type { OnboardingResult } from './lib/onboardingProfile'
import { applyOnboardingToAppState } from './lib/onboardingProfile'

function App() {
  const [state, setState] = useState<AppState>(() => loadAppState())

  useEffect(() => {
    saveAppState(state)
  }, [state])

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
    setState((current) => ({ ...current, selectedJourneyFilterId }))
  }

  const openJourneyMemory = (selectedJourneyEntryId: string) => {
    setState((current) => ({
      ...current,
      selectedJourneyEntryId,
      selectedChallengeId: null,
      showPresetPlanOverlay: false,
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
      return {
        ...current,
        activeAdventure: { ...current.activeAdventure, started: true },
      }
    })
  }

  const cancelAdventure = () => {
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

  const startAdventure = (placeId: string, durationLabel = 'Open end') => {
    const place = getPlaceById(placeId)
    if (!place) return

    setState((current) => ({
      ...current,
      activeAdventure: createActiveAdventure(
        place.id,
        place.name,
        durationLabel,
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
      activeAdventure: createActiveAdventure(place.id, place.name, 'Open end'),
      adventurePhotos: ['', '', ''],
    }))
  }

  const finishAdventure = (payload: AdventureFinishPayload) => {
    setState((current) => {
      if (!current.activeAdventure) {
        return { ...current, activeTab: 'journey', adventurePhotos: ['', '', ''] }
      }

      const place = getPlaceById(current.activeAdventure.placeId)
      const capturedPhotos = current.adventurePhotos.filter(Boolean)
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

      return {
        ...current,
        activeAdventure: null,
        activeTab: 'journey',
        adventureCount: current.adventureCount + 1,
        journeyEntries,
        adventurePhotos: ['', '', ''],
        memorySaveToast: 'Memory saved — worth remembering.',
      }
    })
  }

  const completeOnboarding = (result: OnboardingResult) => {
    setState((current) => ({
      ...current,
      ...applyOnboardingToAppState(current, result),
    }))
  }

  const clearMemorySaveToast = () => {
    setState((current) => ({ ...current, memorySaveToast: null }))
  }

  if (!state.onboardingComplete) {
    return <OnboardingFlow onComplete={completeOnboarding} />
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
    if (challenge) {
      return (
        <ChallengeDetailView
          challenge={challenge}
          onBack={closeChallengeDetail}
        />
      )
    }
  }

  if (state.selectedAchievementId) {
    const achievement = state.achievements.find(
      (item) => item.id === state.selectedAchievementId,
    )
    if (achievement) {
      return (
        <AchievementDetailView
          achievement={achievement}
          onBack={closeAchievementDetail}
        />
      )
    }
  }

  if (state.selectedJourneyEntryId) {
    const entry = state.journeyEntries.find(
      (item) => item.id === state.selectedJourneyEntryId,
    )
    if (entry) {
      return (
        <JourneyMemoryView
          entry={entry}
          dogs={state.dogs}
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
            onDismissToast={clearMemorySaveToast}
          />
        )
      case 'community':
        return (
          <CommunityScreen
            state={state}
            onToggleLike={toggleCommunityLike}
            onAddComment={addCommunityComment}
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
          />
        )
      case 'profile':
        return <ProfileScreen state={state} />
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
    <AppShell activeTab={state.activeTab} onTabChange={setActiveTab}>
      {renderScreen()}
    </AppShell>
  )
}

export default App
