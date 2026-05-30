import { useMemo } from 'react'
import type { AppState } from '../../data/demo'
import { getDisplayDogLabel, getProfileDogs } from '../../lib/profileDisplay'
import {
  getHeroFitLine,
  getHomeHeadline,
  getMemoryWarmLabel,
} from '../../lib/homeCopy'
import { getFeaturedChallenge, resolveJoinedChallenges } from '../../lib/challengeEngine'
import { getHomeProgressStats } from '../../lib/homeStats'
import { getFeaturedTrainingProgram } from '../../lib/trainingEngine'
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
  onJoinChallenge: (challengeId: string) => void
  onOpenTrainingProgram: (programId: string) => void
  onOpenMemory?: (entryId: string) => void
  onGoToPlan: () => void
  onGoToChallenges: () => void
}

const SECONDARY_QUICK_ACTIONS = [
  { id: 'beach', label: 'Beach', emoji: '🏖️', activityId: 'beach' },
  { id: 'trail', label: 'Trail', emoji: '🌲', activityId: 'trail' },
  { id: 'training', label: 'Training', emoji: '🎓', kind: 'training' as const },
] as const

export function HomeScreen({
  state,
  onSelectActivity,
  onStartAdventure,
  onStartNeighborhoodWalk,
  onOpenProfile,
  onOpenChallenge,
  onJoinChallenge,
  onOpenTrainingProgram,
  onOpenMemory,
  onGoToPlan,
  onGoToChallenges,
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
  const curatedChallenge = useMemo(() => getFeaturedChallenge(state), [state])
  const featuredTraining = useMemo(() => getFeaturedTrainingProgram(state), [state])
  const curatedPlaces = useMemo(
    () => getMapPreviewPlaces(getRecommendationPrefs(state)),
    [state],
  )
  const recentMemories = state.journeyEntries.slice(0, 3)

  const handleStartHeroAdventure = () => {
    onSelectActivity(heroActivityId)
    onStartAdventure(heroPlace.id, 'Open end')
  }

  const handleSecondaryQuickAction = (action: (typeof SECONDARY_QUICK_ACTIONS)[number]) => {
    if ('kind' in action && action.kind === 'training') {
      if (featuredTraining) {
        onOpenTrainingProgram(featuredTraining.id)
      } else {
        onGoToChallenges()
      }
      return
    }

    if (!('activityId' in action)) return

    onSelectActivity(action.activityId)
    const place = getHeroPlace(action.activityId, getRecommendationPrefs(state))
    onStartAdventure(place.id, 'Open end')
  }

  const handleCuratedPlaceGo = (placeId: string) => {
    if (placeId === 'neighborhood-walk') {
      onStartNeighborhoodWalk()
      return
    }
    onStartAdventure(placeId, 'Open end')
  }

  const showCuratedChallenge =
    !activeChallenge && curatedChallenge && !curatedChallenge.progress.joined

  return (
    <div className="home-screen home-screen--depth home-screen--compact">
      <div className="aheader home-screen-header">
        <div className="alogo home-logo">
          Paw<span>Streak</span>
        </div>
        <button type="button" className="two-dogs tap-target home-dog-pill" onClick={onOpenProfile}>
          {profileDogs.map((dog) => (
            <div key={dog.id} className={`dog-av ${dog.avatarClass}`}>
              {dog.photoUrl ? (
                <img src={dog.photoUrl} alt="" className="dog-av-img" />
              ) : (
                dog.initial
              )}
            </div>
          ))}
          <span className="dog-names">{dogLabel}</span>
        </button>
      </div>

      {!state.locationSupported ? (
        <div className="home-area-fallback detail-card-warm">
          We&apos;re still building your area. Suggested adventures are ready below.
        </div>
      ) : null}

      <p className="home-headline home-headline--compact">{getHomeHeadline(dogLabel, dogCount)}</p>

      <section className="home-progress home-progress--compact detail-card-warm" aria-label="Your progress">
        <div className="home-progress-stat">
          <div className="home-progress-value">{progress.streak}</div>
          <div className="home-progress-label">day streak</div>
        </div>
        <div className="home-progress-stat">
          <div className="home-progress-value">{progress.adventuresCompleted}</div>
          <div className="home-progress-label">adventures</div>
        </div>
        <div className="home-progress-stat">
          <div className="home-progress-value">{progress.memoriesSaved}</div>
          <div className="home-progress-label">memories</div>
        </div>
      </section>

      <section className="home-quick home-quick--compact" aria-label="Quick start">
        <div className="home-section-label">Quick start</div>
        <div className="home-quick-primary">
          <button
            type="button"
            className="home-quick-primary-btn tap-target"
            onClick={onStartNeighborhoodWalk}
          >
            <span aria-hidden="true">🏘️</span>
            Quick Walk
          </button>
          <button
            type="button"
            className="home-quick-primary-btn home-quick-primary-btn--accent tap-target"
            onClick={handleStartHeroAdventure}
          >
            <span aria-hidden="true">✨</span>
            Quick Adventure
          </button>
        </div>
        <div className="home-action-strip">
          {SECONDARY_QUICK_ACTIONS.map((action) => (
            <button
              key={action.id}
              type="button"
              className="home-action-chip tap-target"
              onClick={() => handleSecondaryQuickAction(action)}
            >
              <span aria-hidden="true">{action.emoji}</span>
              {action.label}
            </button>
          ))}
        </div>
      </section>

      <section className="home-hero home-hero-compact detail-card-warm" aria-label="Today's adventure">
        <CardImage
          className="home-hero-compact-photo"
          imageUrl={heroImageUrl}
          imageAlt={heroPlace.imageAlt ?? heroPlace.name}
          imageTone={heroPlace.imageTone ?? 'warm'}
        />
        <div className="home-hero-compact-body">
          <div className="home-hero-compact-kicker">Today&apos;s pick</div>
          <div className="home-hero-compact-title">{heroPlace.name}</div>
          <p className="home-hero-compact-copy">{getHeroFitLine(heroPlace, profileDogs)}</p>
          <button type="button" className="home-hero-compact-cta tap-target" onClick={handleStartHeroAdventure}>
            Start adventure
          </button>
        </div>
      </section>

      {curatedPlaces.length > 0 ? (
        <section className="home-curated" aria-label="Curated Adventures">
          <div className="home-section-label">Curated Adventures</div>
          <div className="home-curated-strip">
            {curatedPlaces.slice(0, 3).map((place) => {
              const imageUrl = getAdventureDisplayImageUrl(state.journeyEntries, place)
              return (
                <article key={place.id} className="home-curated-card detail-card-warm">
                  <CardImage
                    className="home-curated-card-photo"
                    imageUrl={imageUrl}
                    imageAlt={place.imageAlt ?? place.name}
                    imageTone={place.imageTone}
                  />
                  <div className="home-curated-card-body">
                    <div className="home-curated-card-name">{place.name.split(',')[0]}</div>
                    <div className="home-curated-card-meta">{getPlanMagicMeta(place)}</div>
                    <button
                      type="button"
                      className="home-curated-card-go tap-target"
                      onClick={() => handleCuratedPlaceGo(place.id)}
                    >
                      Go
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
          <button type="button" className="home-curated-more tap-target" onClick={onGoToPlan}>
            See all on Plan
          </button>
        </section>
      ) : null}

      {activeChallenge ? (
        <section className="home-challenge home-challenge-compact detail-card-warm" aria-label="Active challenge">
          <div className="home-challenge-kicker">Active challenge</div>
          <div className="home-challenge-title">{activeChallenge.title}</div>
          <div className="home-challenge-sub">{activeChallenge.subtitle}</div>
          <div className="home-challenge-progress-row">
            <span>
              {activeChallenge.progress.completedNodes}/{activeChallenge.progress.totalNodes} stops
            </span>
            <span>{activeChallenge.progress.percentComplete}%</span>
          </div>
          <div className="home-challenge-bar">
            <div
              className="home-challenge-bar-fill"
              style={{ width: activeChallenge.progress.fillWidth }}
            />
          </div>
          <button
            type="button"
            className="home-challenge-cta tap-target"
            onClick={() => onOpenChallenge(activeChallenge.id)}
          >
            View challenge
          </button>
        </section>
      ) : null}

      {showCuratedChallenge && curatedChallenge ? (
        <section className="home-challenge home-challenge-compact detail-card-warm" aria-label="Curated challenge">
          <div className="home-challenge-kicker">Curated challenge</div>
          <div className="home-challenge-title">{curatedChallenge.title}</div>
          <div className="home-challenge-sub">{curatedChallenge.subtitle}</div>
          <button
            type="button"
            className="home-challenge-cta tap-target"
            onClick={() => onJoinChallenge(curatedChallenge.id)}
          >
            Join challenge
          </button>
        </section>
      ) : null}

      {recentMemories.length > 0 ? (
        <section className="home-memories home-memories--compact" aria-label="Recent memories">
          <h2 className="home-section-label">Recent memories</h2>
          <div className="home-memory-strip">
            {recentMemories.map((entry, index) => {
              const place = entry.placeId ? getPlaceById(entry.placeId) : undefined
              const imageUrl = getJourneyEntryDisplayImageUrl(state.journeyEntries, entry)
              return (
                <button
                  key={entry.id}
                  type="button"
                  className="home-memory-tile tap-target"
                  onClick={() => onOpenMemory?.(entry.id)}
                >
                  <CardImage
                    className="home-memory-tile-photo"
                    imageUrl={imageUrl}
                    imageAlt={entry.place}
                    imageTone={place?.imageTone ?? 'warm'}
                  />
                  <div className="home-memory-tile-body">
                    <div className="home-memory-tile-kicker">{getMemoryWarmLabel(index)}</div>
                    <div className="home-memory-tile-place">{entry.place}</div>
                    <div className="home-memory-tile-line">
                      {entry.magicLine ?? entry.date}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </section>
      ) : null}
    </div>
  )
}
