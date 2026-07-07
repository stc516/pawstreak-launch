import { useEffect } from 'react'
import type { AppState } from '../../data/demo'
import { getDisplayDogLabel } from '../../lib/profileDisplay'
import { getJourneyMapSummary } from '../../lib/productionState'
import { JourneyStoryPath } from '../../components/JourneyStoryPath'

interface JourneyScreenProps {
  state: AppState
  isDemoMode?: boolean
  onOpenMemory: (entryId: string) => void
  onGoToPlan: () => void
  onDismissToast: () => void
  onCreateStory?: () => void
}

export function JourneyScreen({
  state,
  onOpenMemory,
  onGoToPlan,
  onDismissToast,
  onCreateStory,
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
            ? 'Places you visited, days you shared, and memories from the month.'
            : 'Your first saved outing turns this into an adventure map.'}
        </p>
        {onCreateStory ? (
          <button type="button" className="share-inline-btn tap-target" onClick={onCreateStory}>
            <i className="ti ti-share" aria-hidden="true" />
            Create Story
          </button>
        ) : null}
      </div>

      {!hasMemories ? (
        <section className="journey-first-run detail-card-warm" aria-label="Start your journey">
          <div className="journey-first-run-icon" aria-hidden="true">
            <i className="ti ti-route" />
          </div>
          <div className="journey-first-run-copy">
            <h2>Start with one real outing</h2>
            <p>
              After each adventure, PawStreak saves the place, photos, and little details so you
              can see the days you&apos;ve given {dogLabel}.
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

      <section className="jmap detail-card-warm" aria-label="Adventure map summary">
        <i className="ti ti-map-2" aria-hidden="true" />
        <div className="jmap-title">Adventure map summary</div>
        <div className="jmap-sub">
          {hasMemories ? `${journeyMap.title} · Saved memories are listed above.` : journeyMap.subtitle}
        </div>
      </section>
    </>
  )
}
