import { useEffect } from 'react'
import type { AppState } from '../../data/demo'
import { getDisplayFlashbackSubtitle, getDisplayJourneyTitle } from '../../lib/profileDisplay'
import {
  filterJourneyEntries,
  getJourneyFilterEmptyState,
} from '../../lib/journeyFilter'
import { CardImage } from '../../components/CardImage'
import { getPlaceById } from '../../data/places'

interface JourneyScreenProps {
  state: AppState
  onSelectFilter: (filterId: string) => void
  onOpenMemory: (entryId: string) => void
  onOpenMap: () => void
  onGoToPlan: () => void
  onDismissToast: () => void
}

export function JourneyScreen({
  state,
  onSelectFilter,
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

  const filteredEntries = filterJourneyEntries(
    state.journeyEntries,
    state.selectedJourneyFilterId,
  )
  const emptyState = getJourneyFilterEmptyState(state.selectedJourneyFilterId)

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
        <div className="jmap-title">{state.journeyMap.title}</div>
        <div className="jmap-sub">{state.journeyMap.subtitle}</div>
      </button>

      <div className="flash detail-card-warm">
        <div className="flash-ico">✨</div>
        <div>
          <div className="flash-title">{state.flashback.title}</div>
          <div className="flash-sub">{getDisplayFlashbackSubtitle(state)}</div>
        </div>
      </div>

      <div className="sec">This week</div>

      {filteredEntries.length === 0 && emptyState ? (
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

      {filteredEntries.map((entry) => {
        const place = entry.placeId ? getPlaceById(entry.placeId) : undefined

        return (
          <button
            key={entry.id}
            type="button"
            className="mcard mcard--tap tap-target"
            onClick={() => onOpenMemory(entry.id)}
          >
            <CardImage
              className="mcard-img"
              imageUrl={entry.photoUrls?.[0] ?? place?.imageUrl}
              imageAlt={place?.imageAlt ?? entry.place}
              imageTone={place?.imageTone ?? 'warm'}
            />
            <div className="mcard-body">
              <div className="mcard-row">
                <div className="mcard-place">{entry.place}</div>
                <div className="mcard-date">{entry.date}</div>
              </div>
              {entry.magicLine ? (
                <div className="mcard-magic">{entry.magicLine}</div>
              ) : null}
              <div className="mcard-tags">
                {entry.tags.map((tag) => (
                  <span key={tag} className="mt">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mcard-share">
                <i className="ti ti-share" aria-hidden="true" />
                Share · Post to community
              </div>
            </div>
          </button>
        )
      })}
    </>
  )
}
