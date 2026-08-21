import { useMemo } from 'react'
import type { AppState } from '../../data/demo'
import { getDisplayDogLabel, getProfileDogs } from '../../lib/profileDisplay'
import {
  getHeroFitLine,
  getHomeWelcomeGreeting,
} from '../../lib/homeCopy'
import { resolveJoinedChallenges } from '../../lib/challengeEngine'
import { getHomeProgressStats } from '../../lib/homeStats'
import { getMapPreviewPlaces, getPlanNearbyPlaces } from '../../lib/planDiscovery'
import { getPlanMagicMeta } from '../../data/places'
import { CardImage } from '../../components/CardImage'
import { getHeroPlace } from '../../data/places'
import { getRecommendationPrefs } from '../../lib/onboardingProfile'
import {
  getAdventureDisplayImageUrl,
} from '../../lib/adventureDisplayImage'
import {
  getActiveMonthlyPlanWeek,
  getMonthlyPlanProgressLabel,
} from '../../lib/monthlyPlan'
import { getCurrentTrainingSession } from '../../lib/trainingSchedule'
import { getTrainingProgramById } from '../../data/training'
import { GENERIC_ADVENTURE_TYPES } from '../../lib/genericAdventures'
import { getHomeUpcomingItems } from '../../lib/homeUpcoming'
import { BrandLogoCircle } from '../../components/BrandLogoCircle'
import { DogAdventureScene, type DogAdventureSceneState } from '../../components/DogAdventureScene'
import { DogAdventureSticker } from '../../components/DogAdventureSticker'

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
  onOpenBuildMyMonth: () => void
  onStartMonthlyPlanAdventure: (placeId: string) => void
  onContinueTraining: (programId: string) => void
  onOpenAddAdventure: () => void
  onOpenTrainingProgramFlow: () => void
  onGoToCommunity: () => void
  onGoToChallenges: () => void
}

type HomeBadge = {
  emoji: string
  label: string
  meta: string
  pending?: boolean
}

function getAdventureLaunchBadges(state: AppState, progress: ReturnType<typeof getHomeProgressStats>): HomeBadge[] {
  const entries = state.journeyEntries
  const tags = entries.flatMap((entry) => [entry.place, ...entry.tags, ...(entry.recapLabels ?? [])].map((tag) => tag.toLowerCase()))
  const photoMemories = entries.filter((entry) => entry.photoUrls?.some(Boolean)).length
  const badges: HomeBadge[] = []

  if (progress.streak > 1) {
    badges.push({ emoji: '🔥', label: `${progress.streak}-day streak`, meta: 'Real adventure momentum' })
  }

  if (photoMemories > 0) {
    badges.push({ emoji: '📸', label: photoMemories === 1 ? 'Memory saved' : `${photoMemories} memories`, meta: 'Moments worth keeping' })
  }

  if (tags.some((tag) => tag.includes('beach') || tag.includes('bay') || tag.includes('coast'))) {
    badges.push({ emoji: '🌊', label: 'Beach day', meta: 'Salt air unlocked' })
  }

  if (tags.some((tag) => tag.includes('trail') || tag.includes('hike') || tag.includes('park'))) {
    badges.push({ emoji: '🌲', label: 'Trailblazer', meta: 'New sniff territory' })
  }

  if (tags.some((tag) => tag.includes('coffee') || tag.includes('patio') || tag.includes('cafe'))) {
    badges.push({ emoji: '☕', label: 'Patio pup', meta: 'Human coffee, dog vibes' })
  }

  if (progress.places > 0) {
    badges.push({ emoji: '📍', label: progress.places === 1 ? 'First spot' : `${progress.places} spots`, meta: 'Places actually explored' })
  }

  if (badges.length === 0) {
    return [
      { emoji: '🐾', label: 'First adventure', meta: 'Unlocks when you save a real memory', pending: true },
      { emoji: '🌊', label: 'Beach day', meta: 'Waiting for your first coastal romp', pending: true },
      { emoji: '🌲', label: 'Trailblazer', meta: 'Find a new route to unlock', pending: true },
    ]
  }

  return badges.slice(0, 3)
}

export function HomeScreen({
  state,
  isDemoMode = false,
  onSelectActivity,
  onStartAdventure,
  onStartNeighborhoodWalk,
  onOpenProfile,
  onOpenChallenge,
  onOpenMemory,
  onGoToPlan,
  onOpenBuildMyMonth,
  onStartMonthlyPlanAdventure,
  onContinueTraining,
  onOpenAddAdventure,
  onGoToChallenges,
}: HomeScreenProps) {
  const profileDogs = getProfileDogs(state)
  const dogLabel = getDisplayDogLabel(state)
  const heroActivityId = state.selectedActivityId || 'beach'
  const recommendationPrefs = getRecommendationPrefs(state)
  const heroPlace = useMemo(
    () =>
      state.locationSupported
        ? getPlanNearbyPlaces(heroActivityId, '15min', recommendationPrefs, state)[0] ??
          getHeroPlace(heroActivityId, recommendationPrefs)
        : getHeroPlace(heroActivityId, recommendationPrefs),
    [heroActivityId, recommendationPrefs, state],
  )
  const heroImageUrl = getAdventureDisplayImageUrl(state.journeyEntries, heroPlace)
  const progress = getHomeProgressStats(state)
  const joinedChallenges = useMemo(() => resolveJoinedChallenges(state), [state])
  const activeChallenge = joinedChallenges[0]
  const suggestedPlaces = useMemo(
    () => getMapPreviewPlaces(recommendationPrefs, state),
    [recommendationPrefs, state],
  )
  const upcomingItems = useMemo(() => getHomeUpcomingItems(state), [state])
  const welcomeGreeting = getHomeWelcomeGreeting()
  const activeMonthWeek = getActiveMonthlyPlanWeek(state.monthlyPlanResult)
  const trainingSession = getCurrentTrainingSession(state.activeTrainingSchedule)
  const trainingProgram = state.activeTrainingSchedule
    ? getTrainingProgramById(state.activeTrainingSchedule.programId)
    : null
  const todayKey = new Date().toLocaleDateString('en-CA')
  const todayEntry = state.journeyEntries.find((entry) => {
    if (entry.date.trim().toLowerCase() === 'today') return true
    if (!entry.occurredAt) return false
    const occurred = new Date(entry.occurredAt)
    return !Number.isNaN(occurred.getTime()) && occurred.toLocaleDateString('en-CA') === todayKey
  })
  const sceneState: DogAdventureSceneState = state.activeAdventure
    ? 'adventuring'
    : todayEntry
      ? 'memory'
      : new Date().getHours() >= 17
        ? 'evening'
        : 'ready'
  const leadDog = profileDogs[0]
  const todayPhoto = todayEntry?.photoUrls?.find(Boolean)
  const launchBadges = useMemo(() => getAdventureLaunchBadges(state, progress), [state, progress])
  const launchTone = state.activeAdventure
    ? 'Adventure in motion'
    : todayEntry
      ? 'Memory saved today'
      : progress.streak > 1
        ? `${progress.streak}-day adventure streak`
        : 'Ready for a better day'
  const launchHeadline = state.activeAdventure
    ? `${dogLabel} is already out there.`
    : todayEntry
      ? `You gave ${dogLabel} a better day.`
      : `Give ${dogLabel} a better day.`
  const launchCopy = state.activeAdventure
    ? 'Finish strong, save the memory, then let the next adventure pull you forward.'
    : todayEntry
      ? 'Relive the good part, keep the streak honest, and pick the next place before the leash cools off.'
      : 'Pick one nearby adventure, get out the door, and come back with a real memory — not another chore walk.'

  const handleQuickAdventure = () => {
    onSelectActivity(heroActivityId)
    onStartAdventure(heroPlace.id, 'Open end')
  }

  const handleSuggestedPlaceGo = (placeId: string) => {
    if (placeId === 'neighborhood-walk') {
      onStartNeighborhoodWalk()
      return
    }
    onStartAdventure(placeId, 'Open end')
  }

  return (
    <div className="home-screen home-screen--stitch home-screen--adventure-launch">
      <header className="st-appbar home-screen-header">
        <div className="app-brand-lockup home-logo-lockup">
          <BrandLogoCircle size={32} />
          <div className="st-display alogo home-logo">
            Paw<span>Streak</span>
          </div>
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
            {profileDogs.length > 0 ? (
              <span className="pack-mini-portrait pack-mini-portrait--header" aria-hidden="true">
                {profileDogs.slice(0, 2).map((dog) => (
                  <span key={dog.id} className={`pack-mini-portrait-dog ${dog.avatarClass}`}>
                    {dog.photoUrl ? <img src={dog.photoUrl} alt="" /> : <span>{dog.profileEmoji}</span>}
                  </span>
                ))}
                <span className="pack-mini-portrait-spark">✦</span>
              </span>
            ) : null}
            {profileDogs.length > 0 ? (
              <span className="dog-names">{dogLabel}</span>
            ) : null}
          </button>
        </div>
      </header>

      {!state.locationSupported ? (
        <div className="home-area-fallback st-card st-card--elevated" data-testid="home-area-fallback">
          We don&apos;t have curated local spots in {state.locationLabel} yet, but
          PawStreak still works — start a walk or add your own adventures below.
        </div>
      ) : null}

      <section className="home-adventure-launch-hero" aria-label="Today’s adventure launch">
        <div className="home-adventure-launch-topline">
          <span className="home-streak-banner">
            <i className="ti ti-flame" aria-hidden="true" />
            {launchTone}
          </span>
          <span className="home-launch-dog-chip" aria-label={`Adventure companion: ${dogLabel}`}>
            {leadDog?.photoUrl ? <img src={leadDog.photoUrl} alt="" /> : <span>{leadDog?.profileEmoji ?? '🐶'}</span>}
            <strong>{dogLabel}</strong>
          </span>
        </div>

        <div className="home-adventure-launch-copy">
          <span>{welcomeGreeting}</span>
          <h1>{launchHeadline}</h1>
          <p>{launchCopy}</p>
        </div>

        <DogAdventureScene
          dog={leadDog}
          packLabel={dogLabel}
          state={sceneState}
          memoryPhotoUrl={todayPhoto}
        />

        <div className="home-badge-banner" aria-label="Adventure badges">
          {launchBadges.map((badge) => (
            <span key={`${badge.label}-${badge.meta}`} className={`home-badge-token${badge.pending ? ' home-badge-token--pending' : ''}`}>
              <span aria-hidden="true">{badge.emoji}</span>
              <span>
                <strong>{badge.label}</strong>
                <small>{badge.meta}</small>
              </span>
            </span>
          ))}
        </div>
      </section>

      <section className="today-actions today-actions--launch" aria-label="Today’s adventure">
        <button
          type="button"
          className="today-primary-action today-primary-action--electric tap-target"
          onClick={todayEntry && onOpenMemory ? () => onOpenMemory(todayEntry.id) : handleQuickAdventure}
        >
          <span>
            <small>{todayEntry ? 'Today’s memory' : state.activeAdventure ? 'Adventure in progress' : 'Today’s adventure'}</small>
            <strong>{todayEntry ? `Relive ${todayEntry.place}` : state.activeAdventure ? `Return to ${state.activeAdventure.location}` : 'Pick the next place'}</strong>
          </span>
          <i className={`ti ${todayEntry ? 'ti-book' : 'ti-arrow-right'}`} aria-hidden="true" />
        </button>
        <div className="today-secondary-actions today-secondary-actions--launch">
          <button type="button" className="tap-target" onClick={onStartNeighborhoodWalk}>
            <i className="ti ti-walk" aria-hidden="true" />
            Quick Walk
          </button>
          <button type="button" className="tap-target" onClick={onOpenAddAdventure}>
            <i className="ti ti-plus" aria-hidden="true" />
            Add your own
          </button>
        </div>
        {!isDemoMode && progress.adventuresCompleted > 0 ? (
          <div className="today-real-progress" aria-label="Your real progress">
            <span>{progress.adventuresCompleted} {progress.adventuresCompleted === 1 ? 'story' : 'stories'} saved</span>
            {progress.places > 0 ? <span>{progress.places} {progress.places === 1 ? 'place' : 'places'} explored</span> : null}
            {progress.streak > 1 ? <span>{progress.streak} active days</span> : null}
          </div>
        ) : null}
      </section>

      {state.locationSupported ? (
        <button
          type="button"
          className="home-quick-adventure home-quick-adventure--today-pick detail-card-warm tap-target"
          aria-label={`Start today's pick: ${heroPlace.name}`}
          onClick={handleQuickAdventure}
        >
          <div className="home-quick-adventure-media">
            <CardImage
              className="home-quick-adventure-photo"
              imageUrl={heroImageUrl}
              imageAlt={heroPlace.imageAlt ?? heroPlace.name}
              imageTone={heroPlace.imageTone ?? 'warm'}
            >
              <DogAdventureSticker dog={leadDog} className="dog-adventure-sticker--hero" />
            </CardImage>
          </div>
          <div className="home-quick-adventure-body">
            <div className="home-quick-adventure-kicker">Best pick right now</div>
            <h3 className="home-quick-adventure-title">{heroPlace.name}</h3>
            <p className="home-quick-adventure-copy">{getHeroFitLine(heroPlace, profileDogs)}</p>
            <div className="home-quick-adventure-meta">
              <span>
                <i className="ti ti-map-pin" aria-hidden="true" />
                {heroPlace.distanceLabel}
              </span>
              <span>{heroPlace.leashInfo}</span>
              <span>{heroPlace.category}</span>
            </div>
            <span className="home-quick-adventure-save" aria-hidden="true">
              <i className="ti ti-bookmark" />
            </span>
          </div>
        </button>
      ) : (
        <section
          className="home-generic-adventures detail-card-warm"
          aria-label="Adventure ideas"
          data-testid="home-generic-adventures"
        >
          <div className="st-section-head">
            <h2 className="st-headline-md">Adventure ideas</h2>
          </div>
          <div className="home-generic-adventure-grid">
            {GENERIC_ADVENTURE_TYPES.slice(0, 6).map((type) => (
              <button
                key={type.id}
                type="button"
                className="home-generic-adventure-chip tap-target"
                onClick={
                  type.action === 'quick-walk'
                    ? onStartNeighborhoodWalk
                    : onOpenAddAdventure
                }
              >
                <span aria-hidden="true">{type.emoji}</span>
                <span className="home-generic-adventure-chip-label">{type.label}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="home-plan-new" aria-label="More ways to make today count">
        <div className="st-section-head">
          <h2 className="st-headline-md">More ways to make today count</h2>
        </div>
        <div className="home-plan-grid">
          <button type="button" className="home-plan-action tap-target" onClick={onGoToPlan}>
            <i className="ti ti-map" aria-hidden="true" />
            <span>Find Spots</span>
          </button>
          <button type="button" className="home-plan-action tap-target" onClick={onOpenAddAdventure}>
            <i className="ti ti-mountain" aria-hidden="true" />
            <span>Add Your Own</span>
          </button>
          <button type="button" className="home-plan-action tap-target" onClick={onOpenBuildMyMonth}>
            <i className="ti ti-calendar" aria-hidden="true" />
            <span>Build My Month</span>
          </button>
          <button type="button" className="home-plan-action tap-target" onClick={onGoToChallenges}>
            <i className="ti ti-trophy" aria-hidden="true" />
            <span>Challenges</span>
          </button>
        </div>
      </section>

      {activeMonthWeek && state.monthlyPlanResult ? (
        <section className="home-active-plan detail-card-warm" aria-label="Active Monthly Plan">
          <div className="home-active-plan-head">
            <div>
              <div className="home-active-plan-kicker">Active Monthly Plan</div>
              <div className="home-active-plan-title">
                {activeMonthWeek.label} · {activeMonthWeek.placeName}
              </div>
              <div className="home-active-plan-sub">
                {getMonthlyPlanProgressLabel(state.monthlyPlanResult)}
              </div>
            </div>
            <button
              type="button"
              className="st-btn st-btn--forest tap-target"
              onClick={() => onStartMonthlyPlanAdventure(activeMonthWeek.placeId)}
            >
              Go
            </button>
          </div>
        </section>
      ) : null}

      {trainingSession && trainingProgram ? (
        <section className="home-training-active home-training-active--electric" aria-label="Active training">
          <div className="home-training-active-bolt" aria-hidden="true">⚡</div>
          <div className="home-active-plan-head">
            <div>
              <div className="home-active-plan-kicker">Today&apos;s training adventure · {trainingProgram.title}</div>
              <div className="home-active-plan-title">{trainingSession.lessonTitle}</div>
              <div className="home-training-active-sub">One tiny session. One better adventure.</div>
            </div>
            <button
              type="button"
              className="st-btn st-btn--forest tap-target"
              onClick={() => onContinueTraining(trainingProgram.id)}
            >
              Let&apos;s train
            </button>
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

      {state.locationSupported && suggestedPlaces.length > 0 ? (
        <section className="home-suggested-spots" aria-label="Dog-Friendly Spots Nearby">
          <div className="st-section-head">
            <h2 className="st-headline-md">Dog-Friendly Spots Nearby</h2>
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
                  >
                    <DogAdventureSticker dog={leadDog} className="dog-adventure-sticker--compact" />
                  </CardImage>
                  <div className="st-suggested-spots-tile-name">{place.name.split(',')[0]}</div>
                  <div className="st-suggested-spots-tile-meta">{getPlanMagicMeta(place)}</div>
                </button>
              )
            })}
          </div>
        </section>
      ) : null}

      {upcomingItems.length > 0 ? (
        <section className="home-upcoming" aria-label="Coming Up">
          <div className="st-section-head">
            <h2 className="st-headline-md">Coming Up</h2>
            <button type="button" className="st-link-btn tap-target" onClick={onGoToPlan}>
              See all
            </button>
          </div>
          <div className="home-upcoming-grid">
            {upcomingItems.slice(0, 3).map((item) => (
              <button
                key={item.id}
                type="button"
                className="home-upcoming-card tap-target"
                onClick={onGoToPlan}
              >
                <span className="home-upcoming-emoji" aria-hidden="true">
                  {item.emoji}
                </span>
                <strong>{item.label}</strong>
                <span>{item.detail}</span>
              </button>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
