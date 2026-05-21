import type { AppState } from '../../data/demo'
import { CardImage } from '../../components/CardImage'
import { getPlaceById } from '../../data/places'

interface JourneyScreenProps {
  state: AppState
  onSelectFilter: (filterId: string) => void
  onOpenMemory: (entryId: string) => void
}

export function JourneyScreen({
  state,
  onSelectFilter,
  onOpenMemory,
}: JourneyScreenProps) {
  return (
    <>
      <div className="aheader">
        <div className="alogo">{state.journeyTitle}</div>
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

      <div className="jmap">
        <i className="ti ti-map-2" aria-hidden="true" />
        <div className="jmap-title">{state.journeyMap.title}</div>
        <div className="jmap-sub">{state.journeyMap.subtitle}</div>
      </div>

      <div className="flash">
        <div className="flash-ico">✨</div>
        <div>
          <div className="flash-title">{state.flashback.title}</div>
          <div className="flash-sub">{state.flashback.subtitle}</div>
        </div>
      </div>

      <div className="sec">This week</div>

      {state.journeyEntries.map((entry) => {
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
              imageUrl={place?.imageUrl}
              imageAlt={place?.imageAlt}
              imageTone={place?.imageTone}
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
