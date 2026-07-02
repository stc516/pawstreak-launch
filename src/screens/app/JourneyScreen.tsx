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
        <div className="journey-story-kicker">Your adventure map</div>
        <p className="journey-story-hero-copy">
          {hasMemories
            ? 'Places you went, days you shared, memories you saved.'
            : 'Your first saved outing turns this into an adventure map.'}
        </p>
      </div>

      {!hasMemories ? (
        <section className="journey-first-run detail-card-warm" aria-label="Start your journey">
          <div className="journey-first-run-icon" aria-hidden="true">
            <i className="ti ti-route" />
          </div>
          <div className="journey-first-run-copy">
            <h2>Start with one real outing</h2>
            <p>
              After each adventure, PawStreak saves the place, photos, and details so you can see
              the days you&apos;ve given {dogLabel}.
            </p>
            <button type="button" className="st-btn st-btn--forest tap-target" onClick={onGoToPlan}>
              Find a first spot
            </button>
          </div>
        </section>
      ) : null}

      <JourneyStoryPath
        state={state}
        onOpenMemory={onOpenMemory}
        onStartAdventure={() => onGoToPlan()}
        onGoToPlan={onGoToPlan}
      />

      <button type="button" className="jmap jmap--tap tap-target detail-card-warm" onClick={onOpenMap}>
        <i className="ti ti-map-2" aria-hidden="true" />
        <div className="jmap-title">Adventure map</div>
        <div className="jmap-sub">
          {hasMemories ? `${journeyMap.title} · Every pin is a day you shared.` : journeyMap.subtitle}
        </div>
      </button>
    </>
  )
}
