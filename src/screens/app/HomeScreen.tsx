import type { AppState } from '../../data/demo'
import { getDisplayDogLabel, getProfileDogs } from '../../lib/profileDisplay'
import { getHomeHeroQuestion } from '../../lib/homeCopy'
import {
  getBeachQuestProgress,
  getHomeProgressStats,
  SAN_DIEGO_BEACH_QUEST,
} from '../../lib/homeStats'
import { CardImage } from '../../components/CardImage'
import { getHeroPlace } from '../../data/places'
import { getRecommendationPrefs } from '../../lib/onboardingProfile'
import { getAdventureDisplayImageUrl } from '../../lib/adventureDisplayImage'

interface HomeScreenProps {
  state: AppState
  onSelectActivity: (activityId: string) => void
  onStartAdventure: (placeId: string, durationLabel: string) => void
  onStartNeighborhoodWalk: () => void
  onOpenProfile: () => void
  onOpenChallenge: (challengeId: string) => void
}

const QUICK_ACTIONS = [
  { id: 'neighborhood', label: 'Neighborhood Walk', emoji: '🏘️', kind: 'neighborhood' as const },
  { id: 'beach', label: 'Beach Day', emoji: '🏖️', kind: 'activity' as const, activityId: 'beach' },
  { id: 'dog-park', label: 'Dog Park', emoji: '🐕', kind: 'activity' as const, activityId: 'dog-park' },
  { id: 'trail', label: 'Trail Adventure', emoji: '🌲', kind: 'activity' as const, activityId: 'trail' },
  { id: 'coffee', label: 'Coffee Run', emoji: '☕', kind: 'activity' as const, activityId: 'coffee' },
] as const

export function HomeScreen({
  state,
  onSelectActivity,
  onStartAdventure,
  onStartNeighborhoodWalk,
  onOpenProfile,
  onOpenChallenge,
}: HomeScreenProps) {
  const profileDogs = getProfileDogs(state)
  const dogLabel = getDisplayDogLabel(state)
  const dogCount = profileDogs.length
  const heroActivityId = state.selectedActivityId || 'beach'
  const heroPlace = getHeroPlace(heroActivityId, getRecommendationPrefs(state))
  const progress = getHomeProgressStats(state)
  const beachQuest = getBeachQuestProgress(state)

  const handleStartHeroAdventure = () => {
    onSelectActivity(heroActivityId)
    onStartAdventure(heroPlace.id, 'Open end')
  }

  const handleQuickAction = (action: (typeof QUICK_ACTIONS)[number]) => {
    if (action.kind === 'neighborhood') {
      onStartNeighborhoodWalk()
      return
    }

    onSelectActivity(action.activityId)
    const place = getHeroPlace(action.activityId, getRecommendationPrefs(state))
    onStartAdventure(place.id, 'Open end')
  }

  const heroImageUrl = getAdventureDisplayImageUrl(state.journeyEntries, heroPlace)

  return (
    <div className="home-screen">
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
          We&apos;re still building your area. You can request it, but here are suggested
          adventures for now.
        </div>
      ) : null}

      <section className="home-hero detail-card-warm">
        <CardImage
          className="home-hero-img"
          imageUrl={heroImageUrl}
          imageAlt={heroPlace.imageAlt ?? heroPlace.name}
          imageTone={heroPlace.imageTone ?? 'warm'}
        />
        <div className="home-hero-body">
          <div className="home-hero-kicker">Today&apos;s Adventure</div>
          <p className="home-hero-copy">{getHomeHeroQuestion(dogLabel, dogCount)}</p>
          <div className="home-hero-place">{heroPlace.name}</div>
          <button
            type="button"
            className="home-hero-cta tap-target"
            onClick={handleStartHeroAdventure}
          >
            Start Adventure
          </button>
        </div>
      </section>

      <section className="home-quick">
        <div className="home-quick-label">Quick actions</div>
        <div className="home-quick-grid">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.id}
              type="button"
              className="home-quick-btn tap-target"
              onClick={() => handleQuickAction(action)}
            >
              <span className="home-quick-emoji" aria-hidden="true">
                {action.emoji}
              </span>
              <span className="home-quick-label-text">{action.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="home-progress detail-card-warm">
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
          <div className="home-progress-label">memories saved</div>
        </div>
      </section>

      <section className="home-challenge detail-card-warm">
        <CardImage
          className="home-challenge-img"
          imageUrl={SAN_DIEGO_BEACH_QUEST.imageUrl}
          imageAlt="San Diego beach adventure"
          imageTone="coastal"
        />
        <div className="home-challenge-body">
          <div className="home-challenge-kicker">Featured challenge</div>
          <div className="home-challenge-title">{SAN_DIEGO_BEACH_QUEST.title}</div>
          <div className="home-challenge-sub">{SAN_DIEGO_BEACH_QUEST.subtitle}</div>
          <div className="home-challenge-progress-row">
            <span className="home-challenge-count">
              {beachQuest.completed}/{beachQuest.total} complete
            </span>
            <span className="home-challenge-percent">
              {Math.round((beachQuest.completed / beachQuest.total) * 100)}%
            </span>
          </div>
          <div className="home-challenge-bar">
            <div
              className="home-challenge-bar-fill"
              style={{ width: beachQuest.fillWidth }}
            />
          </div>
          <button
            type="button"
            className="home-challenge-cta tap-target"
            onClick={() => onOpenChallenge(SAN_DIEGO_BEACH_QUEST.challengeId)}
          >
            View path
          </button>
        </div>
      </section>
    </div>
  )
}
