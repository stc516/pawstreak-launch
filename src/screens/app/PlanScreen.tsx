import { useState } from 'react'
import type { AppState } from '../../data/demo'
import { getDisplayDogLabel } from '../../lib/profileDisplay'
import { CardImage } from '../../components/CardImage'
import { getAdventureDisplayImageUrl } from '../../lib/adventureDisplayImage'
import {
  getHeroPlace,
  NEIGHBORHOOD_WALK_PLACE,
} from '../../data/places'
import { getRecommendationPrefs } from '../../lib/onboardingProfile'
import { LIVE_PRODUCT } from '../../lib/liveProductFeatures'

interface PlanScreenProps {
  state: AppState
  onSelectCategory: (categoryId: string) => void
  onZipChange: (zipCode: string) => void
  onApplyLocation: () => void
  onStartAdventure: (placeId: string, durationLabel?: string) => void
  onStartNeighborhoodWalk?: () => void
  onOpenCuratedPlanFlow: () => void
  onGenerateRandomPlan: () => void
  onOpenPresetPlan: () => void
}

const ADVENTURE_PICKS = [
  {
    id: 'neighborhood',
    title: 'Neighborhood Walk',
    subtitle: 'Close by · easy win',
    emoji: '🏘️',
    kind: 'neighborhood' as const,
  },
  {
    id: 'beach',
    title: 'Beach',
    subtitle: 'Room to run',
    emoji: '🏖️',
    kind: 'activity' as const,
    activityId: 'beach',
  },
  {
    id: 'trail',
    title: 'Trail',
    subtitle: 'Fresh air + new smells',
    emoji: '🌲',
    kind: 'activity' as const,
    activityId: 'trail',
  },
  {
    id: 'dog-park',
    title: 'Dog Park',
    subtitle: 'Meet the pack',
    emoji: '🐕',
    kind: 'activity' as const,
    activityId: 'dog-park',
  },
  {
    id: 'coffee',
    title: 'Coffee Run',
    subtitle: 'Patio-friendly stop',
    emoji: '☕',
    kind: 'activity' as const,
    activityId: 'coffee',
  },
] as const

export function PlanScreen({
  state,
  onZipChange,
  onApplyLocation,
  onStartAdventure,
  onStartNeighborhoodWalk,
  onOpenCuratedPlanFlow,
  onGenerateRandomPlan,
  onOpenPresetPlan,
}: PlanScreenProps) {
  const [showMore, setShowMore] = useState(false)
  const dogLabel = getDisplayDogLabel(state)
  const prefs = getRecommendationPrefs(state)

  const handlePick = (pick: (typeof ADVENTURE_PICKS)[number]) => {
    if (pick.kind === 'neighborhood') {
      if (onStartNeighborhoodWalk) {
        onStartNeighborhoodWalk()
        return
      }
      onStartAdventure(NEIGHBORHOOD_WALK_PLACE.id)
      return
    }

    const place = getHeroPlace(pick.activityId, prefs)
    onStartAdventure(place.id)
  }

  const monthlyPlanOptions = state.monthlyPlanOptions.filter(
    (option) => LIVE_PRODUCT.calendarPresetPlan || option.id !== 'preset',
  )

  return (
    <>
      <div className="aheader">
        <div>
          <div className="alogo">Choose an adventure</div>
          <p className="plan-screen-sub">Pick one for {dogLabel}</p>
        </div>
      </div>

      <div className="plan-pick-grid">
        {ADVENTURE_PICKS.map((pick) => {
          const place =
            pick.kind === 'neighborhood'
              ? NEIGHBORHOOD_WALK_PLACE
              : getHeroPlace(pick.activityId, prefs)
          const imageUrl = getAdventureDisplayImageUrl(state.journeyEntries, place)

          return (
            <button
              key={pick.id}
              type="button"
              className="plan-pick-card tap-target"
              onClick={() => handlePick(pick)}
            >
              <CardImage
                className="plan-pick-photo"
                imageUrl={imageUrl}
                imageAlt={place.imageAlt ?? place.name}
                imageTone={place.imageTone ?? 'warm'}
              />
              <div className="plan-pick-body">
                <span className="plan-pick-emoji" aria-hidden="true">
                  {pick.emoji}
                </span>
                <div>
                  <div className="plan-pick-title">{pick.title}</div>
                  <div className="plan-pick-sub">{pick.subtitle}</div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <button
        type="button"
        className="plan-more-toggle tap-target"
        onClick={() => setShowMore((open) => !open)}
        aria-expanded={showMore}
      >
        {showMore ? 'Hide planner tools' : 'More ways to plan'}
      </button>

      {showMore ? (
        <div className="plan-more-panel">
          <div className="mapbox mapbox--compact">
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
              <button type="button" className="zip-btn tap-target" onClick={onApplyLocation}>
                Find spots
              </button>
            </div>
          </div>

          <div className="plan-box plan-box--compact">
            <div className="plan-title">Monthly planning</div>
            {monthlyPlanOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`popt tap-target${state.selectedMonthlyPlanId === option.id ? ' on' : ''}`}
                onClick={() => {
                  if (option.id === 'curated') onOpenCuratedPlanFlow()
                  else if (option.id === 'random') onGenerateRandomPlan()
                  else if (option.id === 'preset') onOpenPresetPlan()
                }}
              >
                <i className={`ti ${option.icon}`} aria-hidden="true" />
                <div>
                  <div>{option.title}</div>
                  <div className="popt-sub">{option.subtitle}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </>
  )
}
