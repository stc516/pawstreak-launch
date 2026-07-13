import { useMemo, useRef, useState } from 'react'
import type { AppState } from '../../data/demo'
import { getDisplayDogLabel, getProfileDogs } from '../../lib/profileDisplay'
import { CardImage } from '../../components/CardImage'
import { DogAdventureSticker } from '../../components/DogAdventureSticker'
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
import { BrandLogoCircle } from '../../components/BrandLogoCircle'

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
  onCreateStory?: () => void
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
  onOpenTrainingProgram,
  onCreateStory,
}: PlanScreenProps) {
  const prefs = getRecommendationPrefs(state)
  const [proximityBucket, setProximityBucket] = useState<PlanProximityBucket>('15min')
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null)
  const [typedPlan, setTypedPlan] = useState('')
  const [typedPlanPreview, setTypedPlanPreview] = useState<string | null>(null)
  const [showAllPlaces, setShowAllPlaces] = useState(false)
  const [findStatus, setFindStatus] = useState<{
    tone: 'loading' | 'success' | 'fallback' | 'error'
    message: string
  } | null>(null)
  const placeCardRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const locationSupported = state.locationSupported
  const places = useMemo(
    () => getPlanNearbyPlaces(state.selectedPlanCategoryId, proximityBucket, prefs, state),
    [state, proximityBucket, prefs],
  )
  const mapPlaces = useMemo(
    () =>
      locationSupported
        ? places.filter((place) => place.lat != null && place.lng != null)
        : [],
    [places, locationSupported],
  )
  const suggestedPicks = useMemo(() => getMapPreviewPlaces(prefs, state), [prefs, state])
  const visiblePlaces = showAllPlaces ? places : places.slice(0, 6)
  const dogLabel = getDisplayDogLabel(state)
  const leadDog = getProfileDogs(state)[0]
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
    setShowAllPlaces(false)
  }

  const handleCategorySelect = (categoryId: string) => {
    onSelectCategory(categoryId)
    setSelectedPlaceId(null)
    setShowAllPlaces(false)
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
        <div className="app-screen-title">
          <div className="app-brand-lockup app-brand-lockup--screen">
            <BrandLogoCircle size={28} />
            <span>PawStreak</span>
          </div>
          <div className="alogo">What are we doing today?</div>
          <p className="plan-screen-sub">
            Pick something that makes {dogLabel} lose their mind—in a good way.
          </p>
        </div>
        {onCreateStory ? (
          <button type="button" className="share-inline-btn tap-target" onClick={onCreateStory}>
            <i className="ti ti-share" aria-hidden="true" />
            Create Story
          </button>
        ) : null}
      </div>

      <section className="explore-hype" aria-label={`${dogLabel} is ready to explore`}>
        <div className="explore-hype-dog">
          {leadDog?.photoUrl ? (
            <img src={leadDog.photoUrl} alt={leadDog.name} />
          ) : (
            <span aria-hidden="true">{leadDog?.profileEmoji ?? '🐕'}</span>
          )}
          <i className="explore-hype-bandana" aria-hidden="true" />
        </div>
        <div className="explore-hype-copy">
          <span>Adventure mode</span>
          <strong>{dogLabel} is ready. Pick the mission.</strong>
        </div>
        <div className="explore-hype-words" aria-hidden="true">
          <span>RUN</span><span>SNIFF</span><span>SPLASH</span>
        </div>
        <div className="explore-hype-paws" aria-hidden="true">🐾 🐾 🐾</div>
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
          >
            <DogAdventureSticker dog={leadDog} className="dog-adventure-sticker--hero" />
          </CardImage>
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
              Helps with: Routine Breaker progress, category challenges, and earned memory badges.
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
                  Let&apos;s go
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
      <div className="sec">Distance</div>
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

      <div className="sec">Filters</div>

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
        {visiblePlaces.map((place) => {
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
              >
                <DogAdventureSticker dog={leadDog} className="dog-adventure-sticker--compact" />
              </CardImage>
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
                Let&apos;s go
              </button>
            </div>
          )
        })}
      </div>
      {places.length > visiblePlaces.length ? (
        <button
          type="button"
          className="plan-see-more tap-target detail-card-warm"
          onClick={() => setShowAllPlaces(true)}
        >
          See more spots
        </button>
      ) : null}
        </>
      )}

      <section className="plan-hub detail-card-warm" aria-label="Better Dog Days">
        <div className="plan-hub-kicker">Better Dog Days</div>
        <h2 className="plan-hub-title">Plan the next good day</h2>
        <div className="plan-hub-actions">
          <button type="button" className="plan-hub-action tap-target" onClick={onOpenBuildMyMonth}>
            <span aria-hidden="true"><i className="ti ti-calendar" /></span>
            <span>
              <strong>Build My Month</strong>
              <small>Plan a few outings across beaches, trails, patios, and parks</small>
            </span>
          </button>
          <button type="button" className="plan-hub-action tap-target" onClick={onOpenAddAdventure}>
            <span aria-hidden="true"><i className="ti ti-plus" /></span>
            <span>
              <strong>Add Your Own</strong>
              <small>Save a place or outing PawStreak does not know yet</small>
            </span>
          </button>
          <button type="button" className="plan-hub-action tap-target" onClick={onOpenTrainingProgram}>
            <span aria-hidden="true"><i className="ti ti-school" /></span>
            <span>
              <strong>Training</strong>
              <small>Add leash focus, calm patio work, or confidence practice</small>
            </span>
          </button>
          <button type="button" className="plan-hub-action tap-target" onClick={onGenerateRandomPlan}>
            <span aria-hidden="true"><i className="ti ti-sparkles" /></span>
            <span>
              <strong>Pick for Me</strong>
              <small>Get one fast dog-friendly idea from your location and dog context</small>
            </span>
          </button>
        </div>
        <div className="plan-type-box">
          <label className="plan-type-label" htmlFor="typed-plan-input">Describe your dog day</label>
          <p className="plan-type-help">
            Say what kind of outing you want, then turn it into a custom adventure or monthly plan.
          </p>
          <textarea
            id="typed-plan-input"
            className="plan-type-input"
            value={typedPlan}
            onChange={(event) => setTypedPlan(event.target.value)}
            placeholder={`Example: calm patio practice after work with ${dogLabel}`}
          />
          <button
            type="button"
            className="st-btn st-btn--forest tap-target"
            onClick={handleTypedPlanPreview}
            disabled={!typedPlan.trim()}
          >
            Preview idea
          </button>
          {typedPlanPreview ? (
            <div className="plan-type-preview" role="status">
              {typedPlanPreview}
            </div>
          ) : null}
        </div>
      </section>

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
