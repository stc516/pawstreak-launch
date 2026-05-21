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
import { PlanScreen } from './screens/app/PlanScreen'

function App() {
  const [state, setState] = useState<AppState>(() => loadAppState())

  useEffect(() => {
    saveAppState(state)
  }, [state])

  const setActiveTab = (activeTab: TabId) => {
    setState((current) => ({ ...current, activeTab }))
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

  const setSelectedMonthlyPlan = (selectedMonthlyPlanId: string) => {
    setState((current) => ({ ...current, selectedMonthlyPlanId }))
  }

  const openJourneyMemory = (selectedJourneyEntryId: string) => {
    setState((current) => ({ ...current, selectedJourneyEntryId }))
  }

  const closeJourneyMemory = () => {
    setState((current) => ({ ...current, selectedJourneyEntryId: null }))
  }

  const addAdventurePhoto = (photoDataUrl: string) => {
    setState((current) => ({
      ...current,
      adventurePhotos: fillPhotoSlots(current.adventurePhotos, photoDataUrl),
    }))
  }

  const startAdventure = (placeId: string) => {
    const place = getPlaceById(placeId)
    if (!place) return

    setState((current) => ({
      ...current,
      activeTab: 'plan',
      activeAdventure: createActiveAdventure(place.id, place.name),
      adventurePhotos: ['', '', ''],
    }))
  }

  const finishAdventure = () => {
    setState((current) => {
      if (!current.activeAdventure) {
        return { ...current, activeTab: 'journey', adventurePhotos: ['', '', ''] }
      }

      const place = getPlaceById(current.activeAdventure.placeId)
      const journeyEntries = place
        ? [createJourneyEntryFromPlace(place, current.dogs), ...current.journeyEntries]
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

  if (state.selectedJourneyEntryId) {
    const entry = state.journeyEntries.find(
      (item) => item.id === state.selectedJourneyEntryId,
    )
    if (entry) {
      return (
        <JourneyMemoryView
          state={state}
          entry={entry}
          onBack={closeJourneyMemory}
        />
      )
    }
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
            onSelectMonthlyPlan={setSelectedMonthlyPlan}
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
        return <MilestonesScreen state={state} />
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
