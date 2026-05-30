import { useMemo, useRef, useState } from 'react'
import type { AppState } from '../../data/demo'
import { getDisplayDogLabel } from '../../lib/profileDisplay'
import { CardImage } from '../../components/CardImage'
import { PlanAdventureMap } from '../../components/PlanAdventureMap'
import { getAdventureDisplayImageUrl } from '../../lib/adventureDisplayImage'
import { getPlanMagicMeta } from '../../data/places'
import { PLAN_EVENTS } from '../../data/planEvents'
import { getRecommendationPrefs } from '../../lib/onboardingProfile'
import {
  getPlanChallengeOpportunities,
  getPlanNearbyPlaces,
  PLAN_PROXIMITY_OPTIONS,
  type PlanProximityBucket,
} from '../../lib/planDiscovery'
import { getFeaturedTrainingProgram } from '../../lib/trainingEngine'
import { getRoadTripDriveTime, openRoadTripDirections } from '../../lib/roadTrip'
import { LIVE_PRODUCT } from '../../lib/liveProductFeatures'

interface PlanScreenProps {
  state: AppState
  isDemoMode?: boolean
  onSelectCategory: (categoryId: string) => void
  onZipChange: (zipCode: string) => void
  onApplyLocation: () => void
  onStartAdventure: (placeId: string, durationLabel?: string) => void
  onStartNeighborhoodWalk?: () => void
  onOpenCuratedPlanFlow: () => void
  onGenerateRandomPlan: () => void
  onOpenPresetPlan: () => void
  onOpenChallenge?: (challengeId: string) => void
  onJoinChallenge?: (challengeId: string) => void
  onOpenTrainingProgram?: (programId: string) => void
}

export function PlanScreen({
  state,
  isDemoMode = false,
  onSelectCategory,
  onZipChange,
  onApplyLocation,
  onStartAdventure,
  onStartNeighborhoodWalk,
  onOpenCuratedPlanFlow,
  onGenerateRandomPlan,
  onOpenPresetPlan,
  onOpenChallenge,
  onJoinChallenge,
  onOpenTrainingProgram,
}: PlanScreenProps) {
  const prefs = getRecommendationPrefs(state)
  const [proximityBucket, setProximityBucket] = useState<PlanProximityBucket>('15min')
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null)
  const placeCardRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const places = useMemo(
    () => getPlanNearbyPlaces(state.selectedPlanCategoryId, proximityBucket, prefs),
    [state.selectedPlanCategoryId, proximityBucket, prefs],
  )
  const mapPlaces = useMemo(
    () => places.filter((place) => place.lat != null && place.lng != null),
    [places],
  )
  const challengeOpportunities = useMemo(() => getPlanChallengeOpportunities(state), [state])
  const featuredTraining = useMemo(() => getFeaturedTrainingProgram(state), [state])
  const dogLabel = getDisplayDogLabel(state)

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

  const monthlyPlanOptions = state.monthlyPlanOptions.filter(
    (option) => LIVE_PRODUCT.calendarPresetPlan || option.id !== 'preset',
  )

  const handleSelectMapPlace = (placeId: string) => {
    setSelectedPlaceId(placeId)
    requestAnimationFrame(() => {
      placeCardRefs.current[placeId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    })
  }

  const handleProximityChange = (bucket: PlanProximityBucket) => {
    setProximityBucket(bucket)
    setSelectedPlaceId(null)
  }

  const handleCategorySelect = (categoryId: string) => {
    onSelectCategory(categoryId)
    setSelectedPlaceId(null)
  }

  return (
    <>
      <div className="aheader plan-screen-header">
        <div className="alogo">Plan an adventure</div>
        <p className="plan-screen-sub">Where can we go with {dogLabel} right now?</p>
      </div>

      <PlanAdventureMap
        places={mapPlaces}
        selectedPlaceId={selectedPlaceId}
        mapTitle={state.mapRegion.title}
        mapSubtitle={state.mapRegion.subtitle}
        zipCode={state.zipCode}
        onSelectPlace={handleSelectMapPlace}
        onZipChange={onZipChange}
        onApplyLocation={onApplyLocation}
      />

      {!state.locationSupported ? (
        <div className="plan-area-fallback detail-card-warm">{state.mapRegion.subtitle}</div>
      ) : null}

      <div className="sec">What&apos;s close right now</div>
      <div className="plan-proximity-strip">
        {PLAN_PROXIMITY_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`plan-proximity-chip tap-target${proximityBucket === option.id ? ' on' : ''}`}
            onClick={() => handleProximityChange(option.id)}
          >
            <span aria-hidden="true">{option.emoji}</span>
            {option.label}
          </button>
        ))}
      </div>

      <div className="sec">Nearby adventures</div>

      <div className="chips chips--plan chips--compact">
        {state.planCategories.map((category) => (
          <button
            key={category.id}
            type="button"
            className={`chip tap-target${state.selectedPlanCategoryId === category.id ? ' on' : ''}`}
            onClick={() => handleCategorySelect(category.id)}
          >
            <span className="clbl">{category.label}</span>
          </button>
        ))}
      </div>

      <div className="plan-card-list">
        {places.map((place) => {
          const isRoadTrip = place.category === 'Road trip'
          const driveTime = isRoadTrip
            ? getRoadTripDriveTime(place, state.locationSupported)
            : null
          const cardImageUrl = getAdventureDisplayImageUrl(state.journeyEntries, place)

          return (
            <div
              key={place.id}
              ref={(node) => {
                placeCardRefs.current[place.id] = node
              }}
              className={`pcard pcard--compact${isRoadTrip ? ' pcard--road-trip' : ''}${selectedPlaceId === place.id ? ' pcard--map-selected' : ''}`}
              onClick={() => setSelectedPlaceId(place.id)}
            >
              <CardImage
                className="pcard-thumb"
                imageUrl={cardImageUrl}
                imageAlt={place.imageAlt ?? place.name}
                imageTone={place.imageTone}
              />
              <div className="pinfo">
                <div className="pname">{place.name}</div>
                {isRoadTrip ? (
                  <div className="road-trip-details road-trip-details--compact">
                    <div className="road-trip-row">
                      <span>{place.city}</span>
                      {driveTime ? <span>{driveTime}</span> : null}
                    </div>
                    <button
                      type="button"
                      className="road-trip-directions tap-target"
                      onClick={() => openRoadTripDirections(place)}
                    >
                      Directions
                    </button>
                  </div>
                ) : (
                  <div className="pmeta">{getPlanMagicMeta(place)}</div>
                )}
              </div>
              <button
                type="button"
                className="pgo tap-target"
                onClick={() => {
                  if (place.id === 'neighborhood-walk') {
                    onStartNeighborhoodWalk?.()
                    return
                  }
                  onStartAdventure(place.id)
                }}
              >
                Go
              </button>
            </div>
          )
        })}
      </div>

      {challengeOpportunities.length > 0 ? (
        <>
          <div className="sec">Challenge opportunities</div>
          <div className="plan-challenge-list">
            {challengeOpportunities.map((challenge) => (
              <article
                key={challenge.id}
                className={`plan-challenge-card plan-challenge-card--${challenge.accent} detail-card-warm`}
              >
                <div className="plan-challenge-copy">
                  <div className="plan-challenge-title">
                    <span aria-hidden="true">{challenge.emoji}</span> {challenge.title}
                  </div>
                  <div className="plan-challenge-sub">{challenge.subtitle}</div>
                </div>
                <div className="plan-challenge-actions">
                  <button
                    type="button"
                    className="plan-challenge-join tap-target"
                    onClick={() => onJoinChallenge?.(challenge.id)}
                  >
                    Join
                  </button>
                  <button
                    type="button"
                    className="plan-challenge-preview tap-target"
                    onClick={() => onOpenChallenge?.(challenge.id)}
                  >
                    Preview
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      ) : null}

      {featuredTraining ? (
        <>
          <div className="sec">Training Opportunities</div>
          <button
            type="button"
            className="plan-training-row detail-card-warm tap-target"
            onClick={() => onOpenTrainingProgram?.(featuredTraining.id)}
          >
            <span className="plan-training-emoji" aria-hidden="true">{featuredTraining.emoji}</span>
            <span className="plan-training-copy">
              <span className="plan-training-title">{featuredTraining.title}</span>
              <span className="plan-training-sub">
                {featuredTraining.progress.lessonsCompleted}/{featuredTraining.progress.lessonsTotal}{' '}
                lessons · {featuredTraining.subtitle}
              </span>
            </span>
          </button>
        </>
      ) : null}

      <div className="sec">Events</div>
      <div className="plan-events-list">
        {PLAN_EVENTS.map((event) => (
          <article key={event.id} className="plan-event-card detail-card-warm">
            <span className="plan-event-emoji" aria-hidden="true">{event.emoji}</span>
            <div className="plan-event-copy">
              <div className="plan-event-title">{event.title}</div>
              <div className="plan-event-meta">
                {event.schedule} · {event.location}
              </div>
            </div>
          </article>
        ))}
      </div>

      {state.favoritePlaces.length > 0 ? (
        <>
          <div className="sec">Saved places</div>
          <div className="plan-saved-list">
            {state.favoritePlaces.map((favorite) => (
              <button
                key={favorite.id}
                type="button"
                className="plan-saved-row tap-target detail-card-warm"
                onClick={() => onStartAdventure(favorite.placeId)}
              >
                <span className="plan-saved-emoji" aria-hidden="true">{favorite.emoji}</span>
                <span className="plan-saved-copy">
                  <span className="plan-saved-name">{favorite.name}</span>
                  <span className="plan-saved-meta">{favorite.visits}</span>
                </span>
              </button>
            ))}
          </div>
        </>
      ) : null}

      <div className="plan-box plan-box--compact">
        <div className="plan-title">Monthly plan for {dogLabel}</div>
        {monthlyPlanOptions.map((option) => (
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
            Internal reminders and planned adventures — no external calendar sync yet.
          </p>
        ) : null}

        {state.curatedPlanResult && state.selectedMonthlyPlanId === 'curated' ? (
          <div className="plan-saved curated-saved detail-card-warm">
            <div className="plan-saved-title">{state.curatedPlanResult.title}</div>
            <div className="plan-saved-goals">
              Built around {state.curatedPlanResult.goalSummary}
            </div>
            <div className="plan-saved-copy">{state.curatedPlanResult.emotionalCopy}</div>
            <div className="plan-saved-cadence">{state.curatedPlanResult.weeklyCadence}</div>
            <div className="plan-saved-first">
              First up: {state.curatedPlanResult.firstAdventure.name}
            </div>
          </div>
        ) : null}

        {state.randomPlanResult && state.selectedMonthlyPlanId === 'random' ? (
          <div className="plan-saved plan-saved--random">
            <div className="plan-saved-title">{state.randomPlanResult.title}</div>
            <div className="plan-saved-copy">{state.randomPlanResult.emotionalCopy}</div>
            <div className="plan-saved-cadence">{state.randomPlanResult.weeklyCadence}</div>
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
