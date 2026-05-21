import { useEffect, useState } from 'react'
import type { AppState, TabId } from './data/demo'
import { createActiveAdventure } from './data/demo'
import { loadAppState, saveAppState } from './lib/storage'
import { AppShell } from './components/AppShell'
import { ActiveAdventureScreen } from './screens/app/ActiveAdventureScreen'
import { HomeScreen } from './screens/app/HomeScreen'
import { JourneyScreen } from './screens/app/JourneyScreen'
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

  const startAdventure = (location: string) => {
    setState((current) => ({
      ...current,
      activeTab: 'plan',
      activeAdventure: createActiveAdventure(location),
    }))
  }

  const finishAdventure = () => {
    setState((current) => ({
      ...current,
      activeAdventure: null,
      activeTab: 'journey',
    }))
  }

  if (state.activeAdventure) {
    return (
      <ActiveAdventureScreen
        state={state}
        onFinish={finishAdventure}
        onTabChange={setActiveTab}
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
          />
        )
      case 'plan':
        return (
          <PlanScreen
            state={state}
            onSelectCategory={setSelectedPlanCategory}
            onZipChange={setZipCode}
            onStartAdventure={startAdventure}
          />
        )
      case 'journey':
        return (
          <JourneyScreen
            state={state}
            onSelectFilter={setSelectedJourneyFilter}
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
    <AppShell activeTab={state.activeTab} onTabChange={setActiveTab}>
      {renderScreen()}
    </AppShell>
  )
}

export default App
