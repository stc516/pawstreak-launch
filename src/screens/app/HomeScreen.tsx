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
import { AdventureGuideDog } from '../../components/AdventureGuideDog'
import { BrandLogoCircle } from '../../components/BrandLogoCircle'

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

export function HomeScreen({
  state,
  onSelectActivity,
  onStartAdventure,
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
    <div className="home-screen home-screen--stitch">
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
        <div className="home-area-fallback st-card st-card--elevated" data-testid="home-area-fallback">
          We don&apos;t have curated local spots in {state.locationLabel} yet, but
          PawStreak still works — start a walk or add your own adventures below.
        </div>
      ) : null}

      <section className="st-welcome">
        <div>
          <h2 className="st-headline-lg home-headline">
            {welcomeGreeting},
            <br />
            {dogLabel}
          </h2>
          <p className="st-welcome-meta">
            {progress.streak} day streak · {progress.adventuresCompleted} adventures ·{' '}
            {progress.memoriesSaved} memories
          </p>
        </div>
        <AdventureGuideDog className="home-guide-dog" withBurst />
      </section>

      <section className="home-quick-walk-hero" aria-label="Quick Walk">
        <button
          type="button"
          className="home-quick-walk-btn tap-target"
          onClick={onStartNeighborhoodWalk}
        >
          <span className="home-quick-walk-icon" aria-hidden="true">
            <i className="ti ti-walk" />
          </span>
          <span className="home-quick-walk-copy">
            <span className="home-quick-walk-title">Quick Walk</span>
            <span className="home-quick-walk-sub">Use the usual route when today is simple.</span>
          </span>
          <span className="home-quick-walk-arrow" aria-hidden="true">
            <i className="ti ti-arrow-right" />
          </span>
        </button>
      </section>

      {state.locationSupported ? (
        <button
          type="button"
          className="home-quick-adventure detail-card-warm tap-target"
          aria-label={`Start today's pick: ${heroPlace.name}`}
          onClick={handleQuickAdventure}
        >
          <div className="home-quick-adventure-media">
            <CardImage
              className="home-quick-adventure-photo"
              imageUrl={heroImageUrl}
              imageAlt={heroPlace.imageAlt ?? heroPlace.name}
              imageTone={heroPlace.imageTone ?? 'warm'}
            />
          </div>
          <div className="home-quick-adventure-body">
            <div className="home-quick-adventure-kicker">Today&apos;s Pick for {dogLabel}</div>
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

      <section className="home-plan-new" aria-label="Better Dog Days">
        <div className="st-section-head">
          <h2 className="st-headline-md">Better Dog Days</h2>
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
        <section className="home-training-active detail-card-warm" aria-label="Active training">
          <div className="home-active-plan-head">
            <div>
              <div className="home-active-plan-kicker">{trainingProgram.title}</div>
              <div className="home-active-plan-title">Today: {trainingSession.lessonTitle}</div>
            </div>
            <button
              type="button"
              className="st-btn st-btn--forest tap-target"
              onClick={() => onContinueTraining(trainingProgram.id)}
            >
              Continue
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
                  />
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
                onClick={item.kind === 'training' ? onOpenTrainingProgramFlow : onGoToPlan}
              >
                <span className="home-upcoming-emoji" aria-hidden="true">
                  {item.emoji}
                </span>
                <strong>{item.kind === 'training' ? 'Training Session' : item.label}</strong>
                <span>{item.detail}</span>
              </button>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
