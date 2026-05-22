import type { AppState } from '../../data/demo'
import { dogNamesLabel } from '../../data/demo'
import {
  getPlaceEmoji,
  getPlacesForPlanCategory,
  getPlanMagicMeta,
} from '../../data/places'

interface PlanScreenProps {
  state: AppState
  onSelectCategory: (categoryId: string) => void
  onZipChange: (zipCode: string) => void
  onStartAdventure: (placeId: string, durationLabel?: string) => void
  onOpenCuratedPlanFlow: () => void
  onGenerateRandomPlan: () => void
  onOpenPresetPlan: () => void
}

export function PlanScreen({
  state,
  onSelectCategory,
  onZipChange,
  onStartAdventure,
  onOpenCuratedPlanFlow,
  onGenerateRandomPlan,
  onOpenPresetPlan,
}: PlanScreenProps) {
  const places = getPlacesForPlanCategory(state.selectedPlanCategoryId)

  const handleMonthlyPlanClick = (planId: string) => {
    if (planId === 'curated') {
      onOpenCuratedPlanFlow()
      return
    }
    if (planId === 'random') {
      onGenerateRandomPlan()
      return
    }
    if (planId === 'preset') {
      onOpenPresetPlan()
      return
    }
  }

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
            className={`chip tap-target${state.selectedPlanCategoryId === category.id ? ' on' : ''}`}
            onClick={() => onSelectCategory(category.id)}
          >
            <span className="clbl">{category.label}</span>
          </button>
        ))}
      </div>

      {places.map((place) => (
        <div key={place.id} className="pcard">
          <div className="pico">{getPlaceEmoji(place.category)}</div>
          <div className="pinfo">
            <div className="pname">{place.name}</div>
            <div className="pmeta">{getPlanMagicMeta(place)}</div>
          </div>
          <button
            type="button"
            className="pgo tap-target"
            onClick={() => onStartAdventure(place.id)}
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
          <button
            key={option.id}
            type="button"
            className={`popt tap-target${state.selectedMonthlyPlanId === option.id ? ' on' : ''}`}
            onClick={() => handleMonthlyPlanClick(option.id)}
          >
            <i className={`ti ${option.icon}`} aria-hidden="true" />
            <div>
              <div>{option.title}</div>
              <div className="popt-sub">{option.subtitle}</div>
            </div>
          </button>
        ))}

        {state.curatedPlanResult &&
        state.selectedMonthlyPlanId === 'curated' ? (
          <div className="plan-saved curated-saved detail-card-warm">
            <div className="plan-saved-title">{state.curatedPlanResult.title}</div>
            <div className="plan-saved-goals">
              Built around {state.curatedPlanResult.goalSummary}
            </div>
            <div className="plan-saved-copy">{state.curatedPlanResult.emotionalCopy}</div>
            <div className="plan-saved-cadence">
              {state.curatedPlanResult.weeklyCadence}
            </div>
            <div className="plan-saved-first">
              First up: {state.curatedPlanResult.firstAdventure.name}
            </div>
          </div>
        ) : null}

        {state.randomPlanResult && state.selectedMonthlyPlanId === 'random' ? (
          <div className="plan-saved plan-saved--random">
            <div className="plan-saved-title">{state.randomPlanResult.title}</div>
            <div className="plan-saved-copy">{state.randomPlanResult.emotionalCopy}</div>
            <div className="plan-saved-cadence">
              {state.randomPlanResult.weeklyCadence}
            </div>
            <div className="plan-saved-tags">
              {state.randomPlanResult.adventureTypes.map((type) => (
                <span key={type} className="rc on plan-saved-tag">
                  {type}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </>
  )
}
