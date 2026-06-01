import { useMemo, useRef, useState } from 'react'
import type { AppState } from '../../data/demo'
import { getDisplayDogLabel } from '../../lib/profileDisplay'
import { CardImage } from '../../components/CardImage'
import { PlanAdventureMap } from '../../components/PlanAdventureMap'
import { getAdventureDisplayImageUrl } from '../../lib/adventureDisplayImage'
import { getPlanMagicMeta } from '../../data/places'
import { getRecommendationPrefs } from '../../lib/onboardingProfile'
import {
  getMapPreviewPlaces,
  getPlanNearbyPlaces,
  PLAN_PROXIMITY_OPTIONS,
  type PlanProximityBucket,
} from '../../lib/planDiscovery'
import { getRoadTripDriveTime, openRoadTripDirections } from '../../lib/roadTrip'

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
  onSelectCategory,
  onZipChange,
  onApplyLocation,
  onStartAdventure,
  onStartNeighborhoodWalk,
  onOpenCuratedPlanFlow,
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
  const suggestedPicks = useMemo(() => getMapPreviewPlaces(prefs), [prefs])
  const dogLabel = getDisplayDogLabel(state)

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

  const handlePlaceGo = (placeId: string) => {
    if (placeId === 'neighborhood-walk') {
      onStartNeighborhoodWalk?.()
      return
    }
    onStartAdventure(placeId)
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
        mapCenter={state.mapCenter}
        mapTitle={state.mapRegion.title}
        mapSubtitle="Each pin is a real place nearby · Tap to find it below"
        zipCode={state.zipCode}
        onSelectPlace={handleSelectMapPlace}
        onZipChange={onZipChange}
        onApplyLocation={onApplyLocation}
      />

      {!state.locationSupported ? (
        <div className="plan-area-fallback detail-card-warm">{state.mapRegion.subtitle}</div>
      ) : null}

      <div className="sec plan-suggested-sec">Suggested Spots</div>
      <p className="plan-suggested-lead">Real outings for {dogLabel} this week.</p>
      <div className="plan-suggested-strip">
        {suggestedPicks.map((place) => {
          const imageUrl = getAdventureDisplayImageUrl(state.journeyEntries, place)
          return (
            <article key={place.id} className="plan-suggested-card detail-card-warm">
              <CardImage
                className="plan-suggested-card-photo"
                imageUrl={imageUrl}
                imageAlt={place.imageAlt ?? place.name}
                imageTone={place.imageTone}
              />
              <div className="plan-suggested-card-body">
                <div className="plan-suggested-card-name">{place.name.split(',')[0]}</div>
                <div className="plan-suggested-card-meta">{getPlanMagicMeta(place)}</div>
                <button
                  type="button"
                  className="plan-suggested-card-go tap-target"
                  onClick={() => handlePlaceGo(place.id)}
                >
                  Go
                </button>
              </div>
            </article>
          )
        })}
      </div>
      <button type="button" className="plan-build-curated-plan tap-target" onClick={onOpenCuratedPlanFlow}>
        Build a Curated Plan
      </button>

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
                onClick={() => handlePlaceGo(place.id)}
              >
                Go
              </button>
            </div>
          )
        })}
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
    </>
  )
}
