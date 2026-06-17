import { useMemo, useRef, useState } from 'react'
import type { AppState } from '../../data/demo'
import { getDisplayDogLabel } from '../../lib/profileDisplay'
import { CardImage } from '../../components/CardImage'
import { PlanAdventureMap } from '../../components/PlanAdventureMap'
import { JourneyPlannedSection } from '../../components/JourneyPlannedSection'
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
import { GENERIC_ADVENTURE_TYPES } from '../../lib/genericAdventures'
import { getPlaceById } from '../../data/places'

interface PlanScreenProps {
  state: AppState
  isDemoMode?: boolean
  onSelectCategory: (categoryId: string) => void
  onZipChange: (zipCode: string) => void
  onApplyLocation: () => Promise<{ supported: boolean; resolved: boolean; label: string } | void>
  onStartAdventure: (placeId: string, durationLabel?: string) => void
  onStartNeighborhoodWalk?: () => void
  onOpenAddAdventure?: () => void
  onStartPlannedAdventure: (scheduledId: string) => void
  onDeletePlannedAdventure: (scheduledId: string) => void
  onOpenBuildMyMonth: () => void
  onGenerateRandomPlan: () => void
  onOpenPresetPlan: () => void
  onOpenChallenge?: (challengeId: string) => void
  onJoinChallenge?: (challengeId: string) => void
  onOpenTrainingProgram?: () => void
}

export function PlanScreen({
  state,
  onSelectCategory,
  onZipChange,
  onApplyLocation,
  onStartAdventure,
  onStartNeighborhoodWalk,
  onOpenAddAdventure,
  onStartPlannedAdventure,
  onDeletePlannedAdventure,
  onOpenBuildMyMonth,
  onGenerateRandomPlan,
  onOpenPresetPlan,
  onOpenTrainingProgram,
}: PlanScreenProps) {
  const prefs = getRecommendationPrefs(state)
  const [proximityBucket, setProximityBucket] = useState<PlanProximityBucket>('15min')
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null)
  const [typedPlan, setTypedPlan] = useState('')
  const [typedPlanPreview, setTypedPlanPreview] = useState<string | null>(null)
  const [findStatus, setFindStatus] = useState<{
    tone: 'loading' | 'success' | 'fallback' | 'error'
    message: string
  } | null>(null)
  const placeCardRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const locationSupported = state.locationSupported
  const places = useMemo(
    () => getPlanNearbyPlaces(state.selectedPlanCategoryId, proximityBucket, prefs, state),
    [state, state.selectedPlanCategoryId, proximityBucket, prefs],
  )
  const mapPlaces = useMemo(
    () =>
      locationSupported
        ? places.filter((place) => place.lat != null && place.lng != null)
        : [],
    [places, locationSupported],
  )
  const suggestedPicks = useMemo(() => getMapPreviewPlaces(prefs, state), [prefs, state])
  const dogLabel = getDisplayDogLabel(state)
  const locationRegion = /orange\s*county/i.test(state.locationLabel)
    ? 'Orange County'
    : /san\s*diego/i.test(state.locationLabel)
      ? 'San Diego'
      : null
  const savedPlaces = useMemo(
    () =>
      state.locationSupported
        ? state.favoritePlaces.filter((favorite) => {
            const place = getPlaceById(favorite.placeId)
            if (!place) return false
            if (place.category === 'Road trip') return true
            if (!locationRegion) return true
            return place.region === locationRegion
          })
        : [],
    [locationRegion, state.favoritePlaces, state.locationSupported],
  )
  const selectedPlace = useMemo(
    () =>
      selectedPlaceId
        ? [...places, ...suggestedPicks].find((place) => place.id === selectedPlaceId) ??
          getPlaceById(selectedPlaceId)
        : null,
    [places, selectedPlaceId, suggestedPicks],
  )

  const handleTypedPlanPreview = () => {
    const request = typedPlan.trim()
    if (!request) return
    setTypedPlanPreview(
      `${request} · ${state.locationSupported ? 'matched to local cards where possible' : 'built as a generic adventure idea for your area'}`,
    )
  }

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

  const handleApplyLocation = async () => {
    const query = state.zipCode.trim()
    if (!query) {
      setFindStatus({
        tone: 'error',
        message: 'Enter a city, ZIP, or neighborhood and PawStreak will keep the plan usable.',
      })
      return
    }

    setFindStatus({
      tone: 'loading',
      message: `Finding dog-friendly spots near ${query}…`,
    })

    try {
      const result = await onApplyLocation()
      if (!result) return

      if (!result.resolved && !result.supported) {
        setFindStatus({
          tone: 'error',
          message: `We could not confidently resolve ${query}. Try a city + state or ZIP. Generic adventure ideas still work.`,
        })
        return
      }

      if (result.supported) {
        setFindStatus({
          tone: 'success',
          message: `Loaded curated dog-friendly spots near ${result.label}.`,
        })
        return
      }

      setFindStatus({
        tone: 'fallback',
        message: `${result.label} is not in a curated market yet, so we are showing generic adventure ideas instead of fake nearby places.`,
      })
    } catch {
      setFindStatus({
        tone: 'error',
        message: 'Location lookup had a hiccup. Try again, or use the generic adventure ideas below.',
      })
    }
  }

  return (
    <>
      <div className="aheader plan-screen-header">
        <div className="alogo">Plan something good for {dogLabel}</div>
        <p className="plan-screen-sub">Build a month, pick today&apos;s outing, or set a training goal.</p>
      </div>

      <section className="plan-hub detail-card-warm" aria-label="Planning hub">
        <div className="plan-hub-kicker">Planning system</div>
        <h2 className="plan-hub-title">One planning system for every kind of outing</h2>
        <div className="plan-hub-actions">
          <button type="button" className="plan-hub-action tap-target" onClick={onOpenBuildMyMonth}>
            <span aria-hidden="true">🗓️</span>
            <span>
              <strong>Build My Month</strong>
              <small>Pick outing count, categories, vibe, dogs, and get a month path</small>
            </span>
          </button>
          <button type="button" className="plan-hub-action tap-target" onClick={onGenerateRandomPlan}>
            <span aria-hidden="true">🎲</span>
            <span>
              <strong>Surprise Me</strong>
              <small>Get one fast idea from your current location and dog context</small>
            </span>
          </button>
          <button type="button" className="plan-hub-action tap-target" onClick={onOpenTrainingProgram}>
            <span aria-hidden="true">🎯</span>
            <span>
              <strong>Training Goal Plan</strong>
              <small>Turn leash focus, calm patio work, or confidence into sessions</small>
            </span>
          </button>
          <button type="button" className="plan-hub-action tap-target" onClick={onOpenPresetPlan}>
            <span aria-hidden="true">🔔</span>
            <span>
              <strong>Reminder path</strong>
              <small>Preview how planned outings become calendar nudges</small>
            </span>
          </button>
        </div>
        <div className="plan-type-box">
          <label className="plan-type-label" htmlFor="typed-plan-input">Type a Plan</label>
          <p className="plan-type-help">
            Describe what you want, then turn it into a custom adventure or monthly plan.
          </p>
          <textarea
            id="typed-plan-input"
            className="plan-type-input"
            value={typedPlan}
            onChange={(event) => setTypedPlan(event.target.value)}
            placeholder="Example: calm patio practice after work with Bailey"
          />
          <button
            type="button"
            className="st-btn st-btn--forest tap-target"
            onClick={handleTypedPlanPreview}
            disabled={!typedPlan.trim()}
          >
            Preview plan
          </button>
          {typedPlanPreview ? (
            <div className="plan-type-preview" role="status">
              {typedPlanPreview}
            </div>
          ) : null}
          <button
            type="button"
            className="plan-type-custom tap-target"
            onClick={onOpenAddAdventure}
            data-testid="journey-add-adventure"
          >
            <span aria-hidden="true">
              <i className="ti ti-plus" />
            </span>
            Create custom adventure
          </button>
        </div>
      </section>

      {state.randomPlanResult ? (
        <section
          className="plan-random-result detail-card-warm"
          aria-label="Surprise plan result"
          data-testid="plan-random-result"
        >
          <div className="plan-random-kicker">Surprise plan</div>
          <h2 className="plan-random-title">{state.randomPlanResult.title}</h2>
          <p className="plan-random-copy">{state.randomPlanResult.emotionalCopy}</p>
          <p className="plan-random-cadence">{state.randomPlanResult.weeklyCadence}</p>
          <div className="plan-random-tags">
            {state.randomPlanResult.adventureTypes.map((type) => (
              <span key={type} className="plan-random-tag">
                {type}
              </span>
            ))}
          </div>
          <div className="plan-random-spots">
            {state.randomPlanResult.recommendedSpots.map((spot) => (
              <div key={spot.name} className="plan-random-spot">
                <strong>{spot.name}</strong>
                <span>{spot.reason}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <JourneyPlannedSection
        state={state}
        onStartPlanned={onStartPlannedAdventure}
        onDeletePlanned={onDeletePlannedAdventure}
      />

      <PlanAdventureMap
        places={mapPlaces}
        selectedPlaceId={selectedPlaceId}
        mapCenter={state.mapCenter}
        mapTitle={state.mapRegion.title}
        mapSubtitle={
          locationSupported
            ? 'Each pin is a real place nearby · Tap to find it below'
            : state.mapRegion.subtitle
        }
        emptyTitle={locationSupported ? undefined : 'Generic ideas for your area'}
        emptyCopy={
          locationSupported
            ? undefined
            : 'Curated map pins are not available here yet, so PawStreak will keep this plan local and flexible.'
        }
        zipCode={state.zipCode}
        isFindingLocation={findStatus?.tone === 'loading'}
        locationStatusMessage={findStatus?.message ?? null}
        locationStatusTone={findStatus?.tone}
        onSelectPlace={handleSelectMapPlace}
        onZipChange={onZipChange}
        onApplyLocation={() => void handleApplyLocation()}
      />

      {selectedPlace ? (
        <section className="plan-place-detail detail-card-warm" data-testid="plan-place-detail">
          <CardImage
            className="plan-place-detail-art"
            imageUrl={getAdventureDisplayImageUrl([], selectedPlace)}
            imageAlt={selectedPlace.name}
            imageTone={selectedPlace.imageTone}
          />
          <div className="plan-place-detail-body">
            <div className="plan-place-detail-kicker">{selectedPlace.category}</div>
            <h2 className="plan-place-detail-title">{selectedPlace.name}</h2>
            <p className="plan-place-detail-meta">
              {selectedPlace.city} · {selectedPlace.distanceLabel}
            </p>
            {selectedPlace.addressLabel ? (
              <p className="plan-place-detail-line">{selectedPlace.addressLabel}</p>
            ) : null}
            <p className="plan-place-detail-line">Best time: {selectedPlace.bestTime}</p>
            <p className="plan-place-detail-line">{selectedPlace.dogFriendlyNotes}</p>
            <p className="plan-place-detail-line">{selectedPlace.whyDogsLoveIt}</p>
            <p className="plan-place-detail-line">
              Helps with: Explorer progress, category challenges, and earned memory badges.
            </p>
            <button
              type="button"
              className="st-btn st-btn--primary tap-target"
              onClick={() => handlePlaceGo(selectedPlace.id)}
            >
              Start this adventure
            </button>
          </div>
        </section>
      ) : null}

      {!locationSupported ? (
        <>
          <div className="plan-area-fallback detail-card-warm" data-testid="plan-area-fallback">
            {state.mapRegion.subtitle}
          </div>

          <div className="sec plan-suggested-sec">Adventure ideas</div>
          <p className="plan-suggested-lead">
            Pick an adventure type and make it yours with {dogLabel}.
          </p>
          <div className="plan-card-list" data-testid="plan-generic-adventures">
            {GENERIC_ADVENTURE_TYPES.map((type) => (
              <div key={type.id} className="pcard pcard--compact">
                <div className="plan-generic-emoji" aria-hidden="true">
                  {type.emoji}
                </div>
                <div className="pinfo">
                  <div className="pname">{type.label}</div>
                  <div className="pmeta">{type.prompt}</div>
                </div>
                <button
                  type="button"
                  className="pgo tap-target"
                  onClick={() => {
                    if (type.action === 'quick-walk') {
                      onStartNeighborhoodWalk?.()
                      return
                    }
                    onOpenAddAdventure?.()
                  }}
                >
                  Go
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
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
      <button type="button" className="plan-build-curated-plan tap-target" onClick={onOpenBuildMyMonth}>
        Build My Month
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
                onClick={(event) => {
                  event.stopPropagation()
                  handlePlaceGo(place.id)
                }}
              >
                Go
              </button>
            </div>
          )
        })}
      </div>
        </>
      )}

      {savedPlaces.length > 0 ? (
        <>
          <div className="sec">Saved places</div>
          <div className="plan-saved-list">
            {savedPlaces.map((favorite) => (
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
