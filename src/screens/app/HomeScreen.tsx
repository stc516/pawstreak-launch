import { useMemo } from 'react'
import type { AppState } from '../../data/demo'
import { getDisplayDogLabel, getProfileDogs } from '../../lib/profileDisplay'
import {
  getHeroEyebrow,
  getHeroFitLine,
  getHomeWelcomeGreeting,
  getMemoryWarmLabel,
} from '../../lib/homeCopy'
import { resolveJoinedChallenges } from '../../lib/challengeEngine'
import { getHomeProgressStats } from '../../lib/homeStats'
import { getMapPreviewPlaces } from '../../lib/planDiscovery'
import { getPlanMagicMeta } from '../../data/places'
import { CardImage } from '../../components/CardImage'
import { getHeroPlace, getPlaceById } from '../../data/places'
import { getRecommendationPrefs } from '../../lib/onboardingProfile'
import {
  getAdventureDisplayImageUrl,
  getJourneyEntryDisplayImageUrl,
} from '../../lib/adventureDisplayImage'

interface HomeScreenProps {
  state: AppState
  isDemoMode?: boolean
  onSelectActivity: (activityId: string) => void
  onStartAdventure: (placeId: string, durationLabel: string) => void
  onStartNeighborhoodWalk: () => void
  onOpenProfile: () => void
  onOpenChallenge: (challengeId: string) => void
  onOpenMemory?: (entryId: string) => void
  onGoToPlan: () => void
}

const QUICK_GRID_ACTIONS = [
  { id: 'walk', label: 'Walk', icon: 'ti-walk', handler: 'walk' as const },
  { id: 'adventure', label: 'Adventure', icon: 'ti-compass', handler: 'adventure' as const },
  { id: 'beach', label: 'Beach', icon: 'ti-beach', handler: 'beach' as const },
  { id: 'trail', label: 'Trail', icon: 'ti-trees', handler: 'trail' as const },
] as const

export function HomeScreen({
  state,
  onSelectActivity,
  onStartAdventure,
  onStartNeighborhoodWalk,
  onOpenProfile,
  onOpenChallenge,
  onOpenMemory,
  onGoToPlan,
}: HomeScreenProps) {
  const profileDogs = getProfileDogs(state)
  const dogLabel = getDisplayDogLabel(state)
  const dogCount = profileDogs.length
  const heroActivityId = state.selectedActivityId || 'beach'
  const heroPlace = getHeroPlace(heroActivityId, getRecommendationPrefs(state))
  const heroImageUrl = getAdventureDisplayImageUrl(state.journeyEntries, heroPlace)
  const progress = getHomeProgressStats(state)
  const joinedChallenges = useMemo(() => resolveJoinedChallenges(state), [state])
  const activeChallenge = joinedChallenges[0]
  const suggestedPlaces = useMemo(
    () => getMapPreviewPlaces(getRecommendationPrefs(state)),
    [state],
  )
  const recentMemories = state.journeyEntries.slice(0, 3)
  const welcomeGreeting = getHomeWelcomeGreeting()
  const heroEyebrow = getHeroEyebrow(dogLabel, dogCount)

  const handleStartHeroAdventure = () => {
    onSelectActivity(heroActivityId)
    onStartAdventure(heroPlace.id, 'Open end')
  }

  const handleQuickGridAction = (handler: (typeof QUICK_GRID_ACTIONS)[number]['handler']) => {
    if (handler === 'walk') {
      onStartNeighborhoodWalk()
      return
    }
    if (handler === 'adventure') {
      handleStartHeroAdventure()
      return
    }
    const activityId = handler === 'beach' ? 'beach' : 'trail'
    onSelectActivity(activityId)
    const place = getHeroPlace(activityId, getRecommendationPrefs(state))
    onStartAdventure(place.id, 'Open end')
  }

  const handleSuggestedPlaceGo = (placeId: string) => {
    if (placeId === 'neighborhood-walk') {
      onStartNeighborhoodWalk()
      return
    }
    onStartAdventure(placeId, 'Open end')
  }

  return (
    <div className="home-screen home-screen--stitch">
      <header className="st-appbar home-screen-header">
        <div className="st-display alogo home-logo">
          Paw<span>Streak</span>
        </div>
        <div className="st-appbar-actions">
          <button
            type="button"
            className="st-icon-btn tap-target"
            aria-label="Open profile and settings"
            onClick={onOpenProfile}
          >
            <i className="ti ti-settings" aria-hidden="true" />
          </button>
          <button type="button" className="st-avatar-btn tap-target home-dog-pill" onClick={onOpenProfile}>
            {profileDogs.slice(0, 2).map((dog) => (
              <div key={dog.id} className={`dog-av ${dog.avatarClass}`}>
                {dog.photoUrl ? (
                  <img src={dog.photoUrl} alt="" className="dog-av-img" />
                ) : (
                  dog.initial
                )}
              </div>
            ))}
            {profileDogs.length > 0 ? (
              <span className="dog-names">{dogLabel}</span>
            ) : null}
          </button>
        </div>
      </header>

      {!state.locationSupported ? (
        <div className="home-area-fallback st-card st-card--elevated">
          We&apos;re still building your area. Suggested Spots are ready below.
        </div>
      ) : null}

      <section className="st-welcome">
        <h2 className="st-headline-lg home-headline">
          {welcomeGreeting},
          <br />
          {dogLabel}
        </h2>
        <p className="st-welcome-meta">
          {progress.streak} day streak · {progress.adventuresCompleted} adventures ·{' '}
          {progress.memoriesSaved} memories
        </p>
      </section>

      <section className="st-hero-pick home-hero" aria-label="Today's adventure">
        <div className="st-hero-pick-glow" aria-hidden="true" />
        <div className="st-hero-pick-card">
          <div className="st-hero-pick-media">
            <CardImage
              className="home-hero-compact-photo"
              imageUrl={heroImageUrl}
              imageAlt={heroPlace.imageAlt ?? heroPlace.name}
              imageTone={heroPlace.imageTone ?? 'warm'}
            />
            <span className="st-hero-pick-badge">{heroEyebrow}</span>
          </div>
          <div className="st-hero-pick-body">
            <h3 className="st-headline-md home-hero-compact-title">{heroPlace.name}</h3>
            <p className="st-body-md home-hero-compact-copy">
              {getHeroFitLine(heroPlace, profileDogs)}
            </p>
            <button
              type="button"
              className="st-btn st-btn--primary home-hero-compact-cta tap-target"
              onClick={handleStartHeroAdventure}
            >
              Start adventure
            </button>
          </div>
        </div>
      </section>

      <section className="st-quick-grid" aria-label="Quick start">
        {QUICK_GRID_ACTIONS.map((action) => (
          <button
            key={action.id}
            type="button"
            className="st-quick-tile tap-target"
            onClick={() => handleQuickGridAction(action.handler)}
          >
            <i className={`ti ${action.icon}`} aria-hidden="true" />
            {action.label}
          </button>
        ))}
      </section>

      {suggestedPlaces.length > 0 ? (
        <section className="home-suggested-spots" aria-label="Suggested Spots">
          <div className="st-section-head">
            <h2 className="st-headline-md">Suggested Spots</h2>
            <button type="button" className="st-link-btn tap-target" onClick={onGoToPlan}>
              See all on Plan
            </button>
          </div>
          <div className="st-suggested-spots-strip st-hide-scroll">
            {suggestedPlaces.slice(0, 3).map((place) => {
              const imageUrl = getAdventureDisplayImageUrl(state.journeyEntries, place)
              return (
                <button
                  key={place.id}
                  type="button"
                  className="st-suggested-spots-tile tap-target"
                  onClick={() => handleSuggestedPlaceGo(place.id)}
                >
                  <CardImage
                    className="st-suggested-spots-tile-photo"
                    imageUrl={imageUrl}
                    imageAlt={place.imageAlt ?? place.name}
                    imageTone={place.imageTone}
                  />
                  <div className="st-suggested-spots-tile-name">{place.name.split(',')[0]}</div>
                  <div className="st-suggested-spots-tile-meta">{getPlanMagicMeta(place)}</div>
                </button>
              )
            })}
          </div>
        </section>
      ) : null}

      {activeChallenge ? (
        <section aria-label="Active challenge">
          <div className="st-section-head">
            <h2 className="st-headline-md">Active Challenge</h2>
          </div>
          <div className="st-challenge-row detail-card-warm">
            <div className="st-challenge-row-icon" aria-hidden="true">
              {activeChallenge.emoji}
              <span className="st-challenge-row-badge">
                {activeChallenge.progress.completedNodes}/{activeChallenge.progress.totalNodes}
              </span>
            </div>
            <div className="st-challenge-row-body">
              <div className="st-challenge-row-title">{activeChallenge.title}</div>
              <div className="st-challenge-row-sub">{activeChallenge.subtitle}</div>
              <div className="st-challenge-row-bar">
                <div
                  className="st-challenge-row-bar-fill"
                  style={{ width: activeChallenge.progress.fillWidth }}
                />
              </div>
            </div>
            <button
              type="button"
              className="st-btn st-btn--forest tap-target"
              onClick={() => onOpenChallenge(activeChallenge.id)}
            >
              View
            </button>
          </div>
        </section>
      ) : null}

      {recentMemories.length > 0 ? (
        <section className="home-memories" aria-label="Recent memories">
          <div className="st-section-head">
            <h2 className="st-headline-md">Recent Memories</h2>
          </div>
          <div className="st-memory-grid">
            {recentMemories.map((entry, index) => {
              const place = entry.placeId ? getPlaceById(entry.placeId) : undefined
              const imageUrl = getJourneyEntryDisplayImageUrl(state.journeyEntries, entry)
              return (
                <button
                  key={entry.id}
                  type="button"
                  className="st-memory-tile tap-target"
                  aria-label={`${getMemoryWarmLabel(index)}: ${entry.place}`}
                  onClick={() => onOpenMemory?.(entry.id)}
                >
                  <CardImage
                    className="home-memory-tile-photo"
                    imageUrl={imageUrl}
                    imageAlt={entry.place}
                    imageTone={place?.imageTone ?? 'warm'}
                  />
                </button>
              )
            })}
          </div>
        </section>
      ) : null}
    </div>
  )
}
