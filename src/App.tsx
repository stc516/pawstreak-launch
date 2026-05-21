import { useEffect, useState } from 'react'
import type { AppState, TabId } from './data/demo'
import { createActiveAdventure } from './data/demo'
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
import { PresetPlanOverlay } from './screens/overlays/PresetPlanOverlay'
import { PlanScreen } from './screens/app/PlanScreen'
import {
  EMPTY_CURATED_PLAN_DRAFT,
  generateCuratedPlanResult,
} from './lib/curatedPlan'
import { generateRandomPlan } from './lib/randomPlan'

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
  ])

  const setActiveTab = (activeTab: TabId) => {
    setState((current) => ({
      ...current,
      activeTab,
      selectedJourneyEntryId: null,
      selectedChallengeId: null,
      showPresetPlanOverlay: false,
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
      showPresetPlanOverlay: false,
    }))
  }

  const closeChallengeDetail = () => {
    setState((current) => ({ ...current, selectedChallengeId: null }))
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
    setState((current) => ({
      ...current,
      curatedPlanDraft: { ...current.curatedPlanDraft, optimizeId },
    }))
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

  const finishAdventure = () => {
    setState((current) => {
      if (!current.activeAdventure) {
        return { ...current, activeTab: 'journey', adventurePhotos: ['', '', ''] }
      }

      const place = getPlaceById(current.activeAdventure.placeId)
      const capturedPhotos = current.adventurePhotos.filter(Boolean)
      const journeyEntries = place
        ? [
            createJourneyEntryFromPlace(place, current.dogs, capturedPhotos),
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
      }
    })
  }

  const completeOnboarding = () => {
    setState((current) => ({
      ...current,
      onboardingComplete: true,
      activeTab: 'home',
    }))
  }

  if (!state.onboardingComplete) {
    return <OnboardingFlow onComplete={completeOnboarding} />
  }

  if (state.activeAdventure) {
    return (
      <ActiveAdventureScreen
        state={state}
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
        onSelectOptimize={setCuratedOptimize}
        onSelectTime={setCuratedTime}
        onToggleLove={toggleCuratedLove}
        onNext={advanceCuratedPlanFlow}
        onFinish={finishCuratedPlanFlow}
      />
    )
  }

  if (state.showPresetPlanOverlay) {
    return <PresetPlanOverlay onClose={closePresetPlanOverlay} />
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

  if (state.selectedJourneyEntryId) {
    const entry = state.journeyEntries.find(
      (item) => item.id === state.selectedJourneyEntryId,
    )
    if (entry) {
      return (
        <JourneyMemoryView
          entry={entry}
          onBack={closeJourneyMemory}
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
          />
        )
      case 'community':
        return <CommunityScreen state={state} />
      case 'milestones':
        return (
          <MilestonesScreen
            state={state}
            onOpenChallenge={openChallengeDetail}
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
