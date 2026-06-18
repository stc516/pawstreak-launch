import { useMemo } from 'react'
import type { AppState } from '../../data/demo'
import { getDisplayDogLabel, getProfileDogs } from '../../lib/profileDisplay'
import {
  getHeroFitLine,
  getHomeWelcomeGreeting,
  getMemoryWarmLabel,
} from '../../lib/homeCopy'
import { resolveJoinedChallenges } from '../../lib/challengeEngine'
import { getHomeProgressStats } from '../../lib/homeStats'
import { getMapPreviewPlaces, getPlanNearbyPlaces } from '../../lib/planDiscovery'
import { getPlanMagicMeta } from '../../data/places'
import { CardImage } from '../../components/CardImage'
import { getHeroPlace, getPlaceById } from '../../data/places'
import { getRecommendationPrefs } from '../../lib/onboardingProfile'
import {
  getAdventureDisplayImageUrl,
  getJourneyEntryDisplayImageUrl,
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
  onOpenMemory,
  onGoToPlan,
  onOpenBuildMyMonth,
  onStartMonthlyPlanAdventure,
  onContinueTraining,
  onOpenAddAdventure,
  onOpenTrainingProgramFlow,
  onGoToCommunity,
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
  const recentMemories = state.journeyEntries.slice(0, 3)
  const continueMemory = recentMemories[0]
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
            <span className="home-quick-walk-sub">Start now · no planning needed</span>
          </span>
          <span className="home-quick-walk-arrow" aria-hidden="true">
            <i className="ti ti-arrow-right" />
          </span>
        </button>
      </section>

      {state.locationSupported ? (
        <section className="home-quick-adventure detail-card-warm" aria-label="Today's Adventure">
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
            <button
              type="button"
              className="st-btn st-btn--primary tap-target"
              onClick={handleQuickAdventure}
            >
              Quick Adventure
            </button>
          </div>
        </section>
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

      {continueMemory ? (
        <section className="home-continue" aria-label="Continue Your Journey">
          <div className="st-section-head">
            <h2 className="st-headline-md">Continue Your Journey</h2>
          </div>
          <button
            type="button"
            className="home-continue-card tap-target"
            onClick={() => onOpenMemory?.(continueMemory.id)}
          >
            <CardImage
              className="home-continue-photo"
              imageUrl={getJourneyEntryDisplayImageUrl(state.journeyEntries, continueMemory)}
              imageAlt={continueMemory.place}
              imageTone="warm"
            />
            <span className="home-continue-copy">
              <strong>{continueMemory.place}</strong>
              <span>{continueMemory.date}</span>
            </span>
            <i className="ti ti-chevron-right" aria-hidden="true" />
          </button>
        </section>
      ) : null}

      <section className="home-upcoming" aria-label="Upcoming Adventures">
        <div className="st-section-head">
          <h2 className="st-headline-md">Upcoming Adventures</h2>
          <button type="button" className="st-link-btn tap-target" onClick={onGoToPlan}>
            See all
          </button>
        </div>
        <div className="home-upcoming-grid">
          {upcomingItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className="home-upcoming-card tap-target"
              onClick={item.kind === 'training' ? onOpenTrainingProgramFlow : onGoToPlan}
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

      <section className="home-plan-new" aria-label="Plan Something New">
        <div className="st-section-head">
          <h2 className="st-headline-md">Plan Something New</h2>
        </div>
        <div className="home-plan-grid">
          <button type="button" className="home-plan-action tap-target" onClick={onGoToPlan}>
            <i className="ti ti-map" aria-hidden="true" />
            <span>Preview Plan</span>
          </button>
          <button type="button" className="home-plan-action tap-target" onClick={onOpenAddAdventure}>
            <i className="ti ti-mountain" aria-hidden="true" />
            <span>Create Adventure</span>
          </button>
          <button type="button" className="home-plan-action tap-target" onClick={onOpenBuildMyMonth}>
            <i className="ti ti-calendar" aria-hidden="true" />
            <span>Build My Month</span>
          </button>
          <button type="button" className="home-plan-action tap-target" onClick={onOpenAddAdventure}>
            <i className="ti ti-map-pin" aria-hidden="true" />
            <span>Suggest A Spot</span>
          </button>
          <button type="button" className="home-plan-action tap-target" onClick={onOpenTrainingProgramFlow}>
            <i className="ti ti-school" aria-hidden="true" />
            <span>Training</span>
          </button>
          <button type="button" className="home-plan-action tap-target" onClick={onGoToChallenges}>
            <i className="ti ti-trophy" aria-hidden="true" />
            <span>Local Challenges</span>
          </button>
          <button type="button" className="home-plan-action tap-target" onClick={onGoToCommunity}>
            <i className="ti ti-users" aria-hidden="true" />
            <span>Community</span>
          </button>
          <button type="button" className="home-plan-action tap-target" onClick={onGoToChallenges}>
            <i className="ti ti-send" aria-hidden="true" />
            <span>Request Challenge</span>
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

      {recentMemories.length > 1 ? (
        <section className="home-memories" aria-label="Recent memories">
          <div className="st-section-head">
            <h2 className="st-headline-md">Recent Memories</h2>
          </div>
          <div className="st-memory-grid">
            {recentMemories.slice(1).map((entry, index) => {
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
