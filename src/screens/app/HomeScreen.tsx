import { useMemo } from 'react'
import type { AppState } from '../../data/demo'
import { getDisplayDogLabel, getProfileDogs } from '../../lib/profileDisplay'
import {
  getHeroFitLine,
  getHomeWelcomeGreeting,
} from '../../lib/homeCopy'
import { resolveJoinedChallenges } from '../../lib/challengeEngine'
import { getHomeProgressStats } from '../../lib/homeStats'
import { getPlanNearbyPlaces } from '../../lib/planDiscovery'
import { CardImage } from '../../components/CardImage'
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
import { getHomeUpcomingItems } from '../../lib/homeUpcoming'
import { BrandLogoCircle } from '../../components/BrandLogoCircle'

interface HomeScreenProps {
  state: AppState
  isDemoMode?: boolean
  onSelectActivity: (activityId: string) => void
  onStartAdventure: (placeId: string, durationLabel: string) => void
  onResumeAdventure: () => void
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
  onResumeAdventure,
  onStartNeighborhoodWalk,
  onOpenProfile,
  onOpenChallenge,
  onGoToPlan,
  onOpenBuildMyMonth,
  onStartMonthlyPlanAdventure,
  onContinueTraining,
  onOpenAddAdventure,
  onOpenTrainingProgramFlow,
  onGoToChallenges,
}: HomeScreenProps) {
  const profileDogs = getProfileDogs(state)
  const dogLabel = getDisplayDogLabel(state)
  const heroActivityId = state.selectedActivityId || 'beach'
  const recommendationPrefs = getRecommendationPrefs(state)
  const heroPlace = useMemo(() => state.locationSupported
    ? getPlanNearbyPlaces(heroActivityId, '15min', recommendationPrefs, state)[0]
    : undefined, [heroActivityId, recommendationPrefs, state])
  const heroImageUrl = heroPlace ? getAdventureDisplayImageUrl(state.journeyEntries, heroPlace) : undefined
  const progress = getHomeProgressStats(state)
  const joinedChallenges = useMemo(() => resolveJoinedChallenges(state), [state])
  const activeChallenge = joinedChallenges[0]
  const upcomingItems = useMemo(() => getHomeUpcomingItems(state), [state])
  const welcomeGreeting = getHomeWelcomeGreeting()
  const activeMonthWeek = getActiveMonthlyPlanWeek(state.monthlyPlanResult)
  const trainingSession = getCurrentTrainingSession(state.activeTrainingSchedule)
  const trainingProgram = state.activeTrainingSchedule
    ? getTrainingProgramById(state.activeTrainingSchedule.programId)
    : null
  const launchBadges = useMemo(() => getAdventureLaunchBadges(state, progress), [state, progress])
  const handleQuickAdventure = () => {
    if (state.activeAdventure) return onResumeAdventure()
    if (!heroPlace) return onStartNeighborhoodWalk()
    onSelectActivity(heroActivityId)
    onStartAdventure(heroPlace.id, 'Open end')
  }

  return (
    <div className="home-screen home-screen--stitch home-screen--minimal">
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
            <span aria-hidden="true">⚙</span>
          </button>
        </div>
      </header>

      <button type="button" className="home-area-chip tap-target" onClick={onGoToPlan} aria-label="Change current area or ZIP">
        <i className="ti ti-map-pin" aria-hidden="true" /> {state.locationLabel}{state.zipCode ? ` · ${state.zipCode}` : ''}
        <i className="ti ti-chevron-down" aria-hidden="true" />
      </button>
      <section className="home-walk-intro" aria-label="Today's adventure">
        <p className="field-kicker">{welcomeGreeting}</p>
        <h1>Chase a better day.</h1>
        <p>{state.activeAdventure ? `Your walk at ${state.activeAdventure.location} is waiting.` : `Fresh air, new sniffs. A little time outside with ${dogLabel}.`}</p>
      </section>
      <section className="kinetic-pack" aria-label="Your trail pack">
        <div className="kinetic-section-heading"><h2>Your Trail Pack</h2><span>{profileDogs.length} {profileDogs.length === 1 ? 'dog' : 'dogs'}</span></div>
        <button type="button" className="home-pack home-dog-pill tap-target" onClick={onOpenProfile} aria-label={`Your pack: ${dogLabel}`}>
          {profileDogs.map(dog => <span key={dog.id}>{dog.photoUrl ? <img src={dog.photoUrl} alt="" /> : <span className="pack-initial" aria-hidden="true">{dog.profileEmoji}</span>}<span className="kinetic-dog-name"><strong>{dog.name}</strong><small>Adventure companion</small></span></span>)}
        </button>
      </section>
      <div className="kinetic-home-actions">
        <button type="button" className="field-primary tap-target" onClick={handleQuickAdventure}>
          <i className="ti ti-player-play-filled" aria-hidden="true" />{state.activeAdventure ? 'Resume walk' : 'Start a walk'}
        </button>
        <button type="button" className="field-secondary tap-target" onClick={onGoToPlan}><i className="ti ti-compass" aria-hidden="true" /> Explore nearby</button>
      </div>
      {!heroPlace ? (
        <section className="home-neighborhood" data-testid="home-area-fallback">
          <p className="field-kicker">Start where you are</p>
          <h2>Neighborhood Walk</h2>
          <p>Choose your own route. A familiar block or a new street is enough.</p>
          <p>No curated spots nearby yet. Explore another area or add a place of your own.</p>
          <button type="button" className="field-secondary tap-target" onClick={onOpenAddAdventure}>Add your own adventure</button>
        </section>
      ) : null}

      {heroPlace ? <section className="home-nearby-pick">
        <p className="field-kicker">One nearby idea</p>
        {heroImageUrl ? <CardImage className="home-pick-image" imageUrl={heroImageUrl} imageAlt={heroPlace.name} imageTone={heroPlace.imageTone} /> : null}
        <h2>{heroPlace.name}</h2><p>{getHeroFitLine(heroPlace, profileDogs)}</p>
        <p>{heroPlace.distanceLabel} · {heroPlace.leashInfo}</p>
        <button type="button" className="kinetic-text-action tap-target" onClick={onGoToPlan}>Browse nearby places <i className="ti ti-compass" aria-hidden="true" /></button>
      </section> : null}
      <section className="home-progress-notes" aria-label="Adventure badges">
        <p className="field-kicker">Your days outside</p>
        <div className="home-badge-banner">{launchBadges.map((badge) => (
          <span key={badge.label} className="home-badge-token"><span aria-hidden="true">{badge.emoji}</span><span><strong>{badge.label}</strong><small>{badge.meta}</small></span></span>
        ))}</div>
        {!isDemoMode && progress.adventuresCompleted > 0 ? <p>{progress.adventuresCompleted} stories saved</p> : null}
      </section>
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
          <button type="button" className="home-plan-action tap-target" onClick={onOpenTrainingProgramFlow}><i className="ti ti-school" aria-hidden="true" /><span>Training</span></button>
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
