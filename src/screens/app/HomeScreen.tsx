import { useMemo } from 'react'
import type { AppState } from '../../data/demo'
import { getDisplayDogLabel, getProfileDogs } from '../../lib/profileDisplay'
import {
  getHeroEyebrow,
  getHeroFitLine,
  getHomeDogActivityLine,
  getHomeHeadline,
  getMemoryWarmLabel,
} from '../../lib/homeCopy'
import { getFeaturedChallenge } from '../../lib/challengeEngine'
import { resolveDogProgression } from '../../lib/dogProgressionEngine'
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
}

const QUICK_ACTIONS = [
  { id: 'neighborhood', label: 'Neighborhood', emoji: '🏘️', kind: 'neighborhood' as const },
  { id: 'beach', label: 'Beach', emoji: '🏖️', kind: 'activity' as const, activityId: 'beach' },
  { id: 'trail', label: 'Trail', emoji: '🌲', kind: 'activity' as const, activityId: 'trail' },
  { id: 'dog-park', label: 'Dog Park', emoji: '🐕', kind: 'activity' as const, activityId: 'dog-park' },
  { id: 'coffee', label: 'Coffee', emoji: '☕', kind: 'activity' as const, activityId: 'coffee' },
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
  onOpenMemory,
}: HomeScreenProps) {
  const profileDogs = getProfileDogs(state)
  const dogLabel = getDisplayDogLabel(state)
  const heroActivityId = state.selectedActivityId || 'beach'
  const heroActivityLabel =
    HERO_ACTIVITY_LABELS[heroActivityId] ?? "Today's adventure"
  const heroPlace = getHeroPlace(heroActivityId, getRecommendationPrefs(state))
  const heroImageUrl = getAdventureDisplayImageUrl(state.journeyEntries, heroPlace)
  const featuredChallenge = useMemo(() => getFeaturedChallenge(state), [state])
  const storyProgress = useMemo(() => resolveDogProgression(state), [state])
  const currentChapter = storyProgress.nodes.find((node) => node.state === 'current')
  const recentMemories = state.journeyEntries.slice(0, 3)

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

  return (
    <div className="home-screen home-screen--polish">
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

      <p className="home-headline">{getHomeHeadline(dogLabel, profileDogs.length)}</p>

      <section className="home-hero-compact detail-card-warm">
        <CardImage
          className="home-hero-compact-photo"
          imageUrl={heroImageUrl}
          imageAlt={heroPlace.imageAlt ?? heroPlace.name}
          imageTone={heroPlace.imageTone ?? 'warm'}
        />
        <div className="home-hero-compact-body">
          <div className="home-hero-compact-kicker">{getHeroEyebrow(dogLabel, profileDogs.length)}</div>
          <h2 className="home-hero-compact-title">{heroPlace.name}</h2>
          <p className="home-hero-compact-copy">{getHeroFitLine(heroPlace, profileDogs)}</p>
          <p className="home-hero-compact-dogs">
            {getHomeDogActivityLine(dogLabel, profileDogs.length, heroActivityLabel)}
          </p>
          <button
            type="button"
            className="home-hero-compact-cta tap-target"
            onClick={handleStartHeroAdventure}
          >
            Start Adventure
          </button>
        </div>
      </section>

      <section className="home-strip-section">
        <h2 className="home-strip-label">Do now</h2>
        <div className="home-action-strip">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.id}
              type="button"
              className="home-action-chip tap-target"
              onClick={() => handleQuickAction(action)}
            >
              <span aria-hidden="true">{action.emoji}</span>
              {action.label}
            </button>
          ))}
        </div>
      </section>

      <section className="home-working detail-card-warm">
        <h2 className="home-strip-label">Working on</h2>
        <div className="home-working-row home-working-row--static">
          <span className="home-working-icon" aria-hidden="true">
            {currentChapter?.emoji ?? '✨'}
          </span>
          <span className="home-working-copy">
            <span className="home-working-title">
              {currentChapter?.title ?? 'Your story'}
            </span>
            <span className="home-working-sub">
              {storyProgress.summary.chaptersCompleted}/{storyProgress.summary.chaptersTotal} chapters ·{' '}
              {storyProgress.summary.rank}
            </span>
          </span>
        </div>
        {featuredChallenge ? (
          <button
            type="button"
            className="home-working-row tap-target"
            onClick={() => onOpenChallenge(featuredChallenge.id)}
          >
            <span className="home-working-icon" aria-hidden="true">🎯</span>
            <span className="home-working-copy">
              <span className="home-working-title">{featuredChallenge.title}</span>
              <span className="home-working-sub">
                {featuredChallenge.progress.joined ? 'In progress' : 'Tap to join'} ·{' '}
                {featuredChallenge.progress.completedNodes}/{featuredChallenge.progress.totalNodes} stops
              </span>
            </span>
          </button>
        ) : null}
      </section>

      {recentMemories.length > 0 ? (
        <section className="home-strip-section">
          <h2 className="home-strip-label">Recent memories</h2>
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
