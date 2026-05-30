import { useMemo } from 'react'
import type { AppState } from '../../data/demo'
import {
  getActiveAchievement,
  getIdentityProgressLabel,
  getNextIdentityAchievement,
} from '../../lib/achievementEngine'
import { getDisplayDogLabel, getProfileDogs } from '../../lib/profileDisplay'
import {
  getHeroFitLine,
  getHomeHeadline,
  getMemoryWarmLabel,
} from '../../lib/homeCopy'
import { getFeaturedChallenge } from '../../lib/challengeEngine'
import { getHomeProgressStats } from '../../lib/homeStats'
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
  const heroPlace = getHeroPlace(heroActivityId, getRecommendationPrefs(state))
  const heroImageUrl = getAdventureDisplayImageUrl(state.journeyEntries, heroPlace)
  const progress = getHomeProgressStats(state)
  const featuredChallenge = useMemo(() => getFeaturedChallenge(state), [state])
  const storyProgress = useMemo(() => resolveDogProgression(state), [state])
  const currentChapter = storyProgress.nodes.find((node) => node.state === 'current')
  const activeAchievement = useMemo(() => getActiveAchievement(state), [state])
  const nextIdentity = useMemo(() => getNextIdentityAchievement(state), [state])
  const featuredTraining = useMemo(() => getFeaturedTrainingProgram(state), [state])
  const recentMemories = state.journeyEntries.slice(0, 3)
  const identityTarget = nextIdentity ?? activeAchievement
  const nextTrainingLesson = featuredTraining?.progress.lessons.find((lesson) => !lesson.completed)

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

      {featuredTraining ? (
        <section className="home-training home-training--compact" aria-label="Training">
          <h2 className="home-section-label">Training</h2>
          <button
            type="button"
            className="home-training-row detail-card-warm tap-target"
            onClick={() => onOpenTrainingProgram(featuredTraining.id)}
          >
            <span className="home-training-emoji" aria-hidden="true">{featuredTraining.emoji}</span>
            <span className="home-training-copy">
              <span className="home-training-title">{featuredTraining.title}</span>
              <span className="home-training-sub">
                {nextTrainingLesson
                  ? `Next up · ${nextTrainingLesson.lesson.title}`
                  : `${featuredTraining.progress.lessonsCompleted}/${featuredTraining.progress.lessonsTotal} lessons done`}
              </span>
            </span>
          </button>
        </section>
      ) : null}

      {(currentChapter || identityTarget || featuredChallenge?.progress.joined) ? (
        <section className="home-continue home-continue--compact detail-card-warm" aria-label="Continue">
          <h2 className="home-section-label">Continue</h2>

          {currentChapter ? (
            <button type="button" className="home-continue-row tap-target" onClick={onGoToPlan}>
              <span className="home-continue-icon" aria-hidden="true">
                {currentChapter.emoji}
              </span>
              <span className="home-continue-copy">
                <span className="home-continue-title">{currentChapter.title}</span>
                <span className="home-continue-sub">
                  Chapter {storyProgress.summary.chaptersCompleted + 1} · {storyProgress.summary.rank}
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
                  {featuredChallenge.progress.completedNodes}/{featuredChallenge.progress.totalNodes} stops
                </span>
              </span>
            </button>
          ) : null}

          {identityTarget ? (
            <button
              type="button"
              className="home-continue-row tap-target"
              onClick={() => onOpenAchievement(identityTarget.id)}
            >
              <span className="home-continue-icon" aria-hidden="true">{identityTarget.emoji}</span>
              <span className="home-continue-copy">
                <span className="home-continue-title">
                  {identityTarget.progress.unlocked
                    ? `Earned · ${identityTarget.title}`
                    : `Next tag · ${identityTarget.title}`}
                </span>
                <span className="home-continue-sub">{getIdentityProgressLabel(identityTarget)}</span>
              </span>
            </button>
          ) : null}
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
