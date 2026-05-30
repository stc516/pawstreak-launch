import { useMemo } from 'react'
import type { AppState } from '../../data/demo'
import { getActiveAchievement } from '../../lib/achievementEngine'
import { getDisplayDogLabel, getProfileDogs } from '../../lib/profileDisplay'
import {
  getHeroFitLine,
  getHomeDogActivityLine,
  getHomeHeadline,
  getHomeHeroQuestion,
  getMemoryWarmLabel,
} from '../../lib/homeCopy'
import { getFeaturedChallenge } from '../../lib/challengeEngine'
import { getHomeProgressStats } from '../../lib/homeStats'
import { getHomeUpcomingItems } from '../../lib/homeUpcoming'
import { resolveDogProgression } from '../../lib/dogProgressionEngine'
import { getFeaturedTrainingProgram } from '../../lib/trainingEngine'
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
  onOpenAchievement: (achievementId: string) => void
  onOpenTrainingProgram: (programId: string) => void
  onOpenMemory?: (entryId: string) => void
  onGoToPlan: () => void
  onGoToChallenges: () => void
}

const QUICK_ACTIONS = [
  { id: 'neighborhood', label: 'Neighborhood Walk', emoji: '🏘️', kind: 'neighborhood' as const },
  { id: 'beach', label: 'Beach', emoji: '🏖️', kind: 'activity' as const, activityId: 'beach' },
  { id: 'trail', label: 'Trail', emoji: '🌲', kind: 'activity' as const, activityId: 'trail' },
  { id: 'dog-park', label: 'Dog Park', emoji: '🐕', kind: 'activity' as const, activityId: 'dog-park' },
  { id: 'coffee', label: 'Coffee Run', emoji: '☕', kind: 'activity' as const, activityId: 'coffee' },
  { id: 'training', label: 'Training Session', emoji: '🎓', kind: 'training' as const },
] as const

const HERO_ACTIVITY_LABELS: Record<string, string> = {
  beach: 'Beach day',
  'dog-park': 'Dog park',
  trail: 'Trail',
  coffee: 'Coffee run',
  neighborhood: 'Neighborhood walk',
}

export function HomeScreen({
  state,
  onSelectActivity,
  onStartAdventure,
  onStartNeighborhoodWalk,
  onOpenProfile,
  onOpenChallenge,
  onOpenAchievement,
  onOpenTrainingProgram,
  onOpenMemory,
  onGoToPlan,
  onGoToChallenges,
}: HomeScreenProps) {
  const profileDogs = getProfileDogs(state)
  const dogLabel = getDisplayDogLabel(state)
  const dogCount = profileDogs.length
  const heroActivityId = state.selectedActivityId || 'beach'
  const heroActivityLabel =
    HERO_ACTIVITY_LABELS[heroActivityId] ?? "Today's adventure"
  const heroPlace = getHeroPlace(heroActivityId, getRecommendationPrefs(state))
  const heroImageUrl = getAdventureDisplayImageUrl(state.journeyEntries, heroPlace)
  const progress = getHomeProgressStats(state)
  const featuredChallenge = useMemo(() => getFeaturedChallenge(state), [state])
  const storyProgress = useMemo(() => resolveDogProgression(state), [state])
  const currentChapter = storyProgress.nodes.find((node) => node.state === 'current')
  const activeAchievement = useMemo(() => getActiveAchievement(state), [state])
  const featuredTraining = useMemo(() => getFeaturedTrainingProgram(state), [state])
  const upcomingItems = useMemo(() => getHomeUpcomingItems(state), [state])
  const recentMemories = state.journeyEntries.slice(0, 3)

  const handleStartHeroAdventure = () => {
    onSelectActivity(heroActivityId)
    onStartAdventure(heroPlace.id, 'Open end')
  }

  const handleQuickAction = (action: (typeof QUICK_ACTIONS)[number]) => {
    if (action.kind === 'training') {
      if (featuredTraining) {
        onOpenTrainingProgram(featuredTraining.id)
      } else {
        onGoToChallenges()
      }
      return
    }

    if (action.kind === 'neighborhood') {
      onStartNeighborhoodWalk()
      return
    }

    onSelectActivity(action.activityId)
    const place = getHeroPlace(action.activityId, getRecommendationPrefs(state))
    onStartAdventure(place.id, 'Open end')
  }

  return (
    <div className="home-screen home-screen--depth">
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
          We&apos;re still building your area. Here are suggested adventures for now.
        </div>
      ) : null}

      <p className="home-headline">{getHomeHeadline(dogLabel, dogCount)}</p>

      <section className="home-hero detail-card-warm" aria-label="Today's adventure">
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
          <p className="home-hero-why">{getHeroFitLine(heroPlace, profileDogs)}</p>
          <p className="home-hero-meta">
            {getHomeDogActivityLine(dogLabel, dogCount, heroActivityLabel)}
          </p>
          <button type="button" className="home-hero-cta tap-target" onClick={handleStartHeroAdventure}>
            Start Adventure
          </button>
        </div>
      </section>

      <section className="home-progress detail-card-warm" aria-label="Your progress">
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

      <section className="home-continue detail-card-warm" aria-label="Continue your journey">
        <h2 className="home-section-label">Continue your journey</h2>

        {currentChapter ? (
          <button type="button" className="home-continue-row tap-target" onClick={onGoToPlan}>
            <span className="home-continue-icon" aria-hidden="true">
              {currentChapter.emoji}
            </span>
            <span className="home-continue-copy">
              <span className="home-continue-title">{currentChapter.title}</span>
              <span className="home-continue-sub">
                {storyProgress.summary.chaptersCompleted}/{storyProgress.summary.chaptersTotal}{' '}
                chapters · {storyProgress.summary.rank}
              </span>
            </span>
          </button>
        ) : null}

        {featuredChallenge?.progress.joined ? (
          <button
            type="button"
            className="home-continue-row tap-target"
            onClick={() => onOpenChallenge(featuredChallenge.id)}
          >
            <span className="home-continue-icon" aria-hidden="true">🎯</span>
            <span className="home-continue-copy">
              <span className="home-continue-title">{featuredChallenge.title}</span>
              <span className="home-continue-sub">
                {featuredChallenge.progress.completedNodes}/{featuredChallenge.progress.totalNodes}{' '}
                stops · {featuredChallenge.progress.percentComplete}% complete
              </span>
            </span>
          </button>
        ) : null}

        {activeAchievement ? (
          <button
            type="button"
            className="home-continue-row tap-target"
            onClick={() => onOpenAchievement(activeAchievement.id)}
          >
            <span className="home-continue-icon" aria-hidden="true">{activeAchievement.emoji}</span>
            <span className="home-continue-copy">
              <span className="home-continue-title">{activeAchievement.title}</span>
              <span className="home-continue-sub">
                {activeAchievement.progress.current}/{activeAchievement.progress.target} ·{' '}
                {activeAchievement.subtitle}
              </span>
            </span>
          </button>
        ) : null}

        {featuredTraining ? (
          <button
            type="button"
            className="home-continue-row tap-target"
            onClick={() => onOpenTrainingProgram(featuredTraining.id)}
          >
            <span className="home-continue-icon" aria-hidden="true">{featuredTraining.emoji}</span>
            <span className="home-continue-copy">
              <span className="home-continue-title">{featuredTraining.title}</span>
              <span className="home-continue-sub">
                {featuredTraining.progress.lessonsCompleted}/{featuredTraining.progress.lessonsTotal}{' '}
                lessons · {featuredTraining.progress.percentComplete}% complete
              </span>
            </span>
          </button>
        ) : null}
      </section>

      <section className="home-upcoming" aria-label="Upcoming">
        <h2 className="home-section-label">Upcoming</h2>
        <div className="home-upcoming-list">
          {upcomingItems.map((item) => (
            <div key={item.id} className="home-upcoming-row detail-card-warm">
              <span className="home-upcoming-icon" aria-hidden="true">{item.emoji}</span>
              <span className="home-upcoming-copy">
                <span className="home-upcoming-label">{item.label}</span>
                <span className="home-upcoming-detail">{item.detail}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="home-quick" aria-label="Quick start">
        <div className="home-quick-label">Quick start</div>
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

      {featuredChallenge ? (
        <section className="home-challenge detail-card-warm" aria-label="Featured challenge">
          <CardImage
            className="home-challenge-img"
            imageUrl={featuredChallenge.heroImageUrl}
            imageAlt={featuredChallenge.title}
            imageTone={featuredChallenge.accent === 'coastal' ? 'coastal' : 'warm'}
          />
          <div className="home-challenge-body">
            <div className="home-challenge-kicker">Featured challenge</div>
            <div className="home-challenge-title">{featuredChallenge.title}</div>
            <div className="home-challenge-sub">{featuredChallenge.subtitle}</div>
            <div className="home-challenge-progress-row">
              <span>
                {featuredChallenge.progress.completedNodes}/{featuredChallenge.progress.totalNodes}{' '}
                complete
              </span>
              <span>{featuredChallenge.progress.percentComplete}%</span>
            </div>
            <div className="home-challenge-bar">
              <div
                className="home-challenge-bar-fill"
                style={{ width: featuredChallenge.progress.fillWidth }}
              />
            </div>
            <button
              type="button"
              className="home-challenge-cta tap-target"
              onClick={() => onOpenChallenge(featuredChallenge.id)}
            >
              {featuredChallenge.progress.joined ? 'View path' : 'Join challenge'}
            </button>
          </div>
        </section>
      ) : null}

      {recentMemories.length > 0 ? (
        <section className="home-memories" aria-label="Recent memories">
          <h2 className="home-section-label">Recent memories</h2>
          <div className="home-memory-strip home-memory-strip--large">
            {recentMemories.map((entry, index) => {
              const place = entry.placeId ? getPlaceById(entry.placeId) : undefined
              const imageUrl = getJourneyEntryDisplayImageUrl(state.journeyEntries, entry)
              return (
                <button
                  key={entry.id}
                  type="button"
                  className="home-memory-tile home-memory-tile--large tap-target"
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
