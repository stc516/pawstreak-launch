import { useEffect, useMemo } from 'react'
import type { AppState } from '../../data/demo'
import { getDisplayJourneyTitle } from '../../lib/profileDisplay'
import { getJourneyMapSummary } from '../../lib/productionState'
import { getFeaturedChallenge } from '../../lib/challengeEngine'
import { JourneyStoryPath } from '../../components/JourneyStoryPath'
import { JourneyPlannedSection } from '../../components/JourneyPlannedSection'
import { ChallengePathExperience } from '../../components/ChallengePathExperience'

interface JourneyScreenProps {
  state: AppState
  isDemoMode?: boolean
  onOpenMemory: (entryId: string) => void
  onOpenMap: () => void
  onGoToPlan: () => void
  onOpenAddAdventure: () => void
  onStartPlannedAdventure: (id: string) => void
  onDeletePlannedAdventure: (id: string) => void
  onStartAdventure: (placeId: string) => void
  onStartNeighborhoodWalk?: () => void
  onOpenChallenge?: (challengeId: string) => void
  onDismissToast: () => void
}

export function JourneyScreen({
  state,
  onOpenMemory,
  onOpenMap,
  onGoToPlan,
  onOpenAddAdventure,
  onStartPlannedAdventure,
  onDeletePlannedAdventure,
  onStartAdventure,
  onStartNeighborhoodWalk,
  onOpenChallenge,
  onDismissToast,
}: JourneyScreenProps) {
  useEffect(() => {
    if (!state.memorySaveToast) return
    const timer = window.setTimeout(onDismissToast, 3200)
    return () => window.clearTimeout(timer)
  }, [state.memorySaveToast, onDismissToast])

  const journeyMap = getJourneyMapSummary(state)
  const hasMemories = state.journeyEntries.length > 0
  const featuredChallenge = useMemo(() => getFeaturedChallenge(state), [state])
  const activeChallenge = featuredChallenge?.progress.joined ? featuredChallenge : undefined

  return (
    <>
      {state.memorySaveToast ? (
        <div className="memory-toast" role="status">
          {state.memorySaveToast}
        </div>
      ) : null}

      <div className="aheader journey-story-hero">
        <div className="alogo">{getDisplayJourneyTitle(state)}</div>
        <p className="journey-story-hero-copy">
          {hasMemories
            ? 'Every chapter is a real adventure — photos, dates, and memories that add up to a life together.'
            : 'Your story starts with one adventure. Save it here and watch the path grow.'}
        </p>
      </div>

      <section className="journey-add-adventure detail-card-warm">
        <button
          type="button"
          className="journey-add-adventure-btn tap-target"
          onClick={onOpenAddAdventure}
          data-testid="journey-add-adventure"
        >
          <span className="journey-add-adventure-icon" aria-hidden="true">
            <i className="ti ti-plus" />
          </span>
          <span className="journey-add-adventure-copy">
            <span className="journey-add-adventure-title">Add your own adventure</span>
            <span className="journey-add-adventure-sub">
              Golf, camping, brewery day — title it and go when you are ready
            </span>
          </span>
          <span className="journey-add-adventure-arrow" aria-hidden="true">
            <i className="ti ti-arrow-right" />
          </span>
        </button>
      </section>

      <JourneyPlannedSection
        state={state}
        onStartPlanned={onStartPlannedAdventure}
        onDeletePlanned={onDeletePlannedAdventure}
      />

      <JourneyStoryPath
        state={state}
        onOpenMemory={onOpenMemory}
        onStartAdventure={() => onGoToPlan()}
        onGoToPlan={onGoToPlan}
      />

      {activeChallenge ? (
        <section className="journey-challenge-path detail-card-warm">
          <div className="journey-challenge-path-header">
            <div>
              <div className="journey-challenge-path-kicker">Challenge path</div>
              <h2 className="journey-challenge-path-title">{activeChallenge.title}</h2>
              <p className="journey-challenge-path-sub">{activeChallenge.subtitle}</p>
            </div>
            {onOpenChallenge ? (
              <button
                type="button"
                className="journey-challenge-path-link tap-target"
                onClick={() => onOpenChallenge(activeChallenge.id)}
              >
                Details
              </button>
            ) : null}
          </div>
          <ChallengePathExperience
            challenge={activeChallenge}
            state={state}
            onStartAdventure={onStartAdventure}
            onStartNeighborhoodWalk={onStartNeighborhoodWalk}
            onGoToPlan={onGoToPlan}
            onOpenMemory={onOpenMemory}
          />
        </section>
      ) : null}

      <button type="button" className="jmap jmap--tap tap-target detail-card-warm" onClick={onOpenMap}>
        <i className="ti ti-map-2" aria-hidden="true" />
        <div className="jmap-title">{journeyMap.title}</div>
        <div className="jmap-sub">{journeyMap.subtitle}</div>
      </button>
    </>
  )
}
