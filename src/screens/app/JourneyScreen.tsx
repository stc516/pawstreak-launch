import { useEffect } from 'react'
import type { AppState } from '../../data/demo'
import { getDisplayDogLabel } from '../../lib/profileDisplay'
import { getJourneyMapSummary } from '../../lib/productionState'
import { JourneyStoryPath } from '../../components/JourneyStoryPath'

interface JourneyScreenProps {
  state: AppState
  isDemoMode?: boolean
  onOpenMemory: (entryId: string) => void
  onOpenMap: () => void
  onGoToPlan: () => void
  onDismissToast: () => void
}

export function JourneyScreen({
  state,
  onOpenMemory,
  onOpenMap,
  onGoToPlan,
  onDismissToast,
}: JourneyScreenProps) {
  useEffect(() => {
    if (!state.memorySaveToast) return
    const timer = window.setTimeout(onDismissToast, 3200)
    return () => window.clearTimeout(timer)
  }, [state.memorySaveToast, onDismissToast])

  const journeyMap = getJourneyMapSummary(state)
  const hasMemories = state.journeyEntries.length > 0
  const dogLabel = getDisplayDogLabel(state)

  return (
    <>
      {state.memorySaveToast ? (
        <div className="memory-toast" role="status">
          {state.memorySaveToast}
        </div>
      ) : null}

      <div className="aheader journey-story-hero">
        <div className="alogo">This Month With {dogLabel}</div>
        <p className="journey-story-hero-copy">
          {hasMemories
            ? 'Completed outings, tiny moments, and saved memories from the month.'
            : 'Finish an adventure and your first memory path will appear here.'}
        </p>
      </div>

      <JourneyStoryPath
        state={state}
        onOpenMemory={onOpenMemory}
        onStartAdventure={() => onGoToPlan()}
        onGoToPlan={onGoToPlan}
      />

      <button type="button" className="jmap jmap--tap tap-target detail-card-warm" onClick={onOpenMap}>
        <i className="ti ti-map-2" aria-hidden="true" />
        <div className="jmap-title">{journeyMap.title}</div>
        <div className="jmap-sub">{journeyMap.subtitle}</div>
      </button>
    </>
  )
}
