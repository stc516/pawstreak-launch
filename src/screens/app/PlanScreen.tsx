import type { AppState } from '../../data/demo'
import { getDisplayDogLabel } from '../../lib/profileDisplay'
import { CardImage } from '../../components/CardImage'
import { getAdventureDisplayImageUrl } from '../../lib/adventureDisplayImage'
import {
  getPlacesForPlanCategory,
  getPlanMagicMeta,
} from '../../data/places'
import { getRecommendationPrefs } from '../../lib/onboardingProfile'
import {
  getRoadTripDriveTime,
  getRoadTripWhyToday,
  openRoadTripDirections,
} from '../../lib/roadTrip'

interface PlanScreenProps {
  state: AppState
  isDemoMode?: boolean
  onSelectCategory: (categoryId: string) => void
  onZipChange: (zipCode: string) => void
  onApplyLocation: () => void
  onStartAdventure: (placeId: string, durationLabel?: string) => void
  onOpenCuratedPlanFlow: () => void
  onGenerateRandomPlan: () => void
  onOpenPresetPlan: () => void
}

export function PlanScreen({
  state,
  isDemoMode = false,
  onSelectCategory,
  onZipChange,
  onApplyLocation,
  onStartAdventure,
  onOpenCuratedPlanFlow,
  onGenerateRandomPlan,
  onOpenPresetPlan,
}: PlanScreenProps) {
  const places = getPlacesForPlanCategory(
    state.selectedPlanCategoryId,
    getRecommendationPrefs(state),
  )

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
          <button
            type="button"
            className="zip-btn tap-target"
            onClick={onApplyLocation}
          >
            Find spots
          </button>
        </div>
      </div>

      <div className="coming-soon">
        <div>
          <div className="cs-left">Not in SD or OC?</div>
          <div className="cs-req">Request your area →</div>
        </div>
        <div className="cs-badge">Coming soon</div>
      </div>

      {!state.locationSupported ? (
        <div className="plan-area-fallback detail-card-warm">
          {state.mapRegion.subtitle}
        </div>
      ) : null}

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

      {places.map((place) => {
        const isRoadTrip = place.category === 'Road trip'
        const driveTime = isRoadTrip
          ? getRoadTripDriveTime(place, state.locationSupported)
          : null
        const cardImageUrl = getAdventureDisplayImageUrl(state.journeyEntries, place)

        return (
        <div key={place.id} className={`pcard${isRoadTrip ? ' pcard--road-trip' : ''}`}>
          <CardImage
            className="pcard-thumb"
            imageUrl={cardImageUrl}
            imageAlt={place.imageAlt ?? place.name}
            imageTone={place.imageTone}
          />
          <div className="pinfo">
            <div className="pname">{place.name}</div>
            {isRoadTrip ? (
              <div className="road-trip-details">
                <div className="road-trip-row">
                  <span className="road-trip-key">Destination</span>
                  <span>{place.city}{place.addressLabel ? ` · ${place.addressLabel}` : ''}</span>
                </div>
                {driveTime ? (
                  <div className="road-trip-row">
                    <span className="road-trip-key">Drive time</span>
                    <span>{driveTime}</span>
                  </div>
                ) : null}
                <div className="road-trip-row">
                  <span className="road-trip-key">Distance</span>
                  <span>{place.distanceLabel}</span>
                </div>
                <div className="road-trip-row">
                  <span className="road-trip-key">Dog rules</span>
                  <span>{place.leashInfo}</span>
                </div>
                <div className="road-trip-why">{getRoadTripWhyToday(place)}</div>
                {place.suggestedStops?.length ? (
                  <div className="road-trip-stops">
                    Suggested stops: {place.suggestedStops.join(' · ')}
                  </div>
                ) : null}
                <button
                  type="button"
                  className="road-trip-directions tap-target"
                  onClick={() => openRoadTripDirections(place)}
                >
                  Open directions
                </button>
              </div>
            ) : (
              <div className="pmeta">{getPlanMagicMeta(place)}</div>
            )}
          </div>
          <button
            type="button"
            className="pgo tap-target"
            onClick={() => onStartAdventure(place.id)}
          >
            Go
          </button>
        </div>
        )
      })}

      <div className="plan-box">
        <div className="plan-title">
          Set up a monthly plan for {getDisplayDogLabel(state)}
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

        {isDemoMode ? (
          <p className="plan-calendar-note">
            Calendar sync is mocked for now. Real reminders come later.
          </p>
        ) : null}

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
