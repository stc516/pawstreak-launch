import type { AppState } from '../../data/demo'
import { dogNamesLabel } from '../../data/demo'

interface PlanScreenProps {
  state: AppState
  onSelectCategory: (categoryId: string) => void
  onZipChange: (zipCode: string) => void
  onStartAdventure: (location: string) => void
}

export function PlanScreen({
  state,
  onSelectCategory,
  onZipChange,
  onStartAdventure,
}: PlanScreenProps) {
  return (
    <>
      <div className="aheader">
        <div className="alogo">Plan an adventure</div>
      </div>

      <div className="mapbox">
        <i className="ti ti-map-pin" aria-hidden="true" />
        <div className="mapbox-title">{state.mapRegion.title}</div>
        <div className="mapbox-sub">{state.mapRegion.subtitle}</div>
        <div className="mapbox-zip">
          <input
            className="zip-input"
            type="text"
            inputMode="numeric"
            placeholder="Enter your zip code"
            value={state.zipCode}
            onChange={(event) => onZipChange(event.target.value)}
          />
          <div className="zip-btn">Find spots</div>
        </div>
      </div>

      <div className="coming-soon">
        <div>
          <div className="cs-left">Not in SD or OC?</div>
          <div className="cs-req">Request your area →</div>
        </div>
        <div className="cs-badge">Coming soon</div>
      </div>

      <div className="chips chips--plan">
        {state.planCategories.map((category) => (
          <button
            key={category.id}
            type="button"
            className={`chip${state.selectedPlanCategoryId === category.id ? ' on' : ''}`}
            onClick={() => onSelectCategory(category.id)}
          >
            <span className="clbl">{category.label}</span>
          </button>
        ))}
      </div>

      {state.planPlaces.map((place) => (
        <div key={place.id} className="pcard">
          <div className="pico">{place.emoji}</div>
          <div className="pinfo">
            <div className="pname">{place.name}</div>
            <div className="pmeta">{place.meta}</div>
          </div>
          <button
            type="button"
            className="pgo"
            onClick={() => onStartAdventure(place.name)}
          >
            Go
          </button>
        </div>
      ))}

      <div className="plan-box">
        <div className="plan-title">
          Set up a monthly plan for {dogNamesLabel(state.dogs)}
        </div>
        {state.monthlyPlanOptions.map((option) => (
          <div key={option.id} className="popt">
            <i className={`ti ${option.icon}`} aria-hidden="true" />
            <div>
              <div>{option.title}</div>
              <div className="popt-sub">{option.subtitle}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
