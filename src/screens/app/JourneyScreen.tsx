import { useEffect } from 'react'
import type { AppState } from '../../data/demo'
import { SAN_DIEGO_BEACH_QUEST_PATH } from '../../data/challengePaths'
import { getDisplayFlashbackSubtitle, getDisplayJourneyTitle } from '../../lib/profileDisplay'
import { getJourneyMapSummary } from '../../lib/productionState'
import {
  filterJourneyEntries,
  getJourneyFilterEmptyState,
} from '../../lib/journeyFilter'
import { ChallengePathExperience } from '../../components/ChallengePathExperience'
import { CardImage } from '../../components/CardImage'
import { getPlaceById } from '../../data/places'
import { getJourneyEntryDisplayImageUrl } from '../../lib/adventureDisplayImage'

interface JourneyScreenProps {
  state: AppState
  isDemoMode?: boolean
  onSelectFilter: (filterId: string) => void
  onOpenMemory: (entryId: string) => void
  onOpenMap: () => void
  onGoToPlan: () => void
  onStartAdventure: (placeId: string) => void
  onStartNeighborhoodWalk?: () => void
  onDismissToast: () => void
}

export function JourneyScreen({
  state,
  isDemoMode = false,
  onSelectFilter,
  onOpenMemory,
  onOpenMap,
  onGoToPlan,
  onStartAdventure,
  onStartNeighborhoodWalk,
  onDismissToast,
}: JourneyScreenProps) {
  useEffect(() => {
    if (!state.memorySaveToast) return
    const timer = window.setTimeout(onDismissToast, 3200)
    return () => window.clearTimeout(timer)
  }, [state.memorySaveToast, onDismissToast])

  const filteredEntries = filterJourneyEntries(
    state.journeyEntries,
    state.selectedJourneyFilterId,
  )
  const emptyState = getJourneyFilterEmptyState(state.selectedJourneyFilterId)
  const journeyMap = getJourneyMapSummary(state)
  const hasMemories = state.journeyEntries.length > 0

  return (
    <>
      {state.memorySaveToast ? (
        <div className="memory-toast" role="status">
          {state.memorySaveToast}
        </div>
      ) : null}

      <div className="aheader">
        <div className="alogo">{getDisplayJourneyTitle(state)}</div>
      </div>

      <ChallengePathExperience
        path={SAN_DIEGO_BEACH_QUEST_PATH}
        journeyEntries={state.journeyEntries}
        isDemoMode={isDemoMode}
        onStartAdventure={onStartAdventure}
        onStartNeighborhoodWalk={onStartNeighborhoodWalk}
        onOpenMemory={onOpenMemory}
      />

      <div className="jfilters">
        {state.journeyFilters.map((filter) => (
          <button
            key={filter.id}
            type="button"
            className={`jf tap-target${state.selectedJourneyFilterId === filter.id ? ' on' : ''}`}
            onClick={() => onSelectFilter(filter.id)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <button type="button" className="jmap jmap--tap tap-target detail-card-warm" onClick={onOpenMap}>
        <i className="ti ti-map-2" aria-hidden="true" />
        <div className="jmap-title">{journeyMap.title}</div>
        <div className="jmap-sub">{journeyMap.subtitle}</div>
      </button>

      {hasMemories ? (
        <div className="flash detail-card-warm">
          <div className="flash-ico">✨</div>
          <div>
            <div className="flash-title">{state.flashback.title}</div>
            <div className="flash-sub">{getDisplayFlashbackSubtitle(state)}</div>
          </div>
        </div>
      ) : null}

      <div className="sec sec--warm">
        {hasMemories ? "This week's adventures" : 'Your memories'}
      </div>

      {filteredEntries.length === 0 && emptyState && (!hasMemories || state.selectedJourneyFilterId !== 'all') ? (
        <div className="journey-empty detail-card-warm">
          <div className="journey-empty-title">{emptyState.title}</div>
          <div className="journey-empty-body">{emptyState.body}</div>
          <button
            type="button"
            className="journey-empty-cta tap-target"
            onClick={onGoToPlan}
          >
            {emptyState.cta}
          </button>
        </div>
      ) : null}

      <div className="journey-grid">
        {filteredEntries.map((entry) => {
          const place = entry.placeId ? getPlaceById(entry.placeId) : undefined
          const tagLine = entry.tags.slice(0, 2).join(' · ')
          const cardImageUrl = getJourneyEntryDisplayImageUrl(state.journeyEntries, entry)

          return (
            <button
              key={entry.id}
              type="button"
              className="mcard mcard--grid mcard--tap tap-target"
              onClick={() => onOpenMemory(entry.id)}
            >
              <div className="mcard-media">
                <CardImage
                  className="mcard-img"
                  imageUrl={cardImageUrl}
                  imageAlt={place?.imageAlt ?? entry.place}
                  imageTone={place?.imageTone ?? 'warm'}
                />
              </div>
              <div className="mcard-body">
                <div className="mcard-place">{entry.place}</div>
                {entry.magicLine ? (
                  <div className="mcard-magic">{entry.magicLine}</div>
                ) : null}
                {tagLine ? <div className="mcard-tagline">{tagLine}</div> : null}
                <div className="mcard-date">
                  {entry.date}
                  {entry.durationLabel ? ` · ${entry.durationLabel}` : ''}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </>
  )
}
