import type { AppState } from '../../data/demo'

interface JourneyScreenProps {
  state: AppState
  onSelectFilter: (filterId: string) => void
}

export function JourneyScreen({ state, onSelectFilter }: JourneyScreenProps) {
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
            className={`jf${state.selectedJourneyFilterId === filter.id ? ' on' : ''}`}
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

      {state.journeyEntries.map((entry) => (
        <div key={entry.id} className="mcard">
          <div className="mcard-img">
            <i className="ti ti-photo" aria-hidden="true" />
          </div>
          <div className="mcard-body">
            <div className="mcard-row">
              <div className="mcard-place">{entry.place}</div>
              <div className="mcard-date">{entry.date}</div>
            </div>
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
        </div>
      ))}
    </>
  )
}
