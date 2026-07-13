import { useEffect } from 'react'
import type { AppState } from '../../data/demo'
import { getDisplayDogLabel, getProfileDogs } from '../../lib/profileDisplay'
import { getJourneyMapSummary } from '../../lib/productionState'
import { JourneyStoryPath } from '../../components/JourneyStoryPath'
import { BrandLogoCircle } from '../../components/BrandLogoCircle'

interface JourneyScreenProps {
  state: AppState
  isDemoMode?: boolean
  onOpenMemory: (entryId: string) => void
  onGoToPlan: () => void
  onDismissToast: () => void
  onCreateStory?: () => void
  onOpenChallenges?: () => void
  onOpenRewards?: () => void
  onOpenCommunity?: () => void
}

export function JourneyScreen({
  state,
  onOpenMemory,
  onGoToPlan,
  onDismissToast,
  onCreateStory,
  onOpenChallenges,
  onOpenRewards,
  onOpenCommunity,
}: JourneyScreenProps) {
  useEffect(() => {
    if (!state.memorySaveToast) return
    const timer = window.setTimeout(onDismissToast, 3200)
    return () => window.clearTimeout(timer)
  }, [state.memorySaveToast, onDismissToast])

  const journeyMap = getJourneyMapSummary(state)
  const hasMemories = state.journeyEntries.length > 0
  const dogLabel = getDisplayDogLabel(state)
  const leadDog = getProfileDogs(state)[0]

  return (
    <>
      {state.memorySaveToast ? (
        <div className="memory-toast" role="status">
          {state.memorySaveToast}
        </div>
      ) : null}

      <div className="aheader journey-story-hero">
        <div className="journey-hero-burst" aria-hidden="true">
          <span>✦</span><span>✦</span><span>✦</span>
        </div>
        <div className="app-brand-lockup app-brand-lockup--screen">
          <BrandLogoCircle size={28} />
          <span>PawStreak</span>
        </div>
        <div className="journey-dog-heading">
          <div className="journey-dog-avatar">
            {leadDog?.photoUrl ? (
              <img src={leadDog.photoUrl} alt={leadDog.name} />
            ) : (
              <span aria-hidden="true">{leadDog?.profileEmoji ?? '🐕'}</span>
            )}
          </div>
          <div>
            <span className="journey-hero-kicker">LOOK WHAT YOU TWO DID</span>
            <div className="alogo">This Month With {dogLabel}</div>
          </div>
        </div>
        <p className="journey-story-hero-copy">
          {hasMemories
            ? 'Every card is proof that you got out there and made the day count.'
            : 'One outing starts the story. The good days pile up from there.'}
        </p>
        {onCreateStory ? (
          <button type="button" className="share-inline-btn tap-target" onClick={onCreateStory}>
            <i className="ti ti-share" aria-hidden="true" />
            Create Story
          </button>
        ) : null}
      </div>

      {!hasMemories ? (
        <section className="journey-first-run detail-card-warm" aria-label="Start your journey">
          <div className="journey-first-run-icon" aria-hidden="true">
            <i className="ti ti-route" />
          </div>
          <div className="journey-first-run-copy">
            <h2>Start with one real outing</h2>
            <p>
              After each adventure, PawStreak saves the place, photos, and little details so you
              can see the days you&apos;ve given {dogLabel}.
            </p>
            <button type="button" className="st-btn st-btn--forest tap-target" onClick={onGoToPlan}>
              Find a first spot
            </button>
          </div>
        </section>
      ) : null}

      <JourneyStoryPath
        state={state}
        onOpenMemory={onOpenMemory}
        onStartAdventure={() => onGoToPlan()}
        onGoToPlan={onGoToPlan}
      />

      <section className="journey-more" aria-label="Keep building the journey">
        <h2>Keep building the story</h2>
        <div className="journey-more-grid">
          {onOpenChallenges ? (
            <button type="button" className="tap-target" onClick={onOpenChallenges}>
              <i className="ti ti-trophy" aria-hidden="true" />
              <span><strong>Challenges</strong><small>Try something new together</small></span>
            </button>
          ) : null}
          {onOpenRewards ? (
            <button type="button" className="tap-target" onClick={onOpenRewards}>
              <i className="ti ti-paw" aria-hidden="true" />
              <span><strong>Trail patches</strong><small>See what real outings unlocked</small></span>
            </button>
          ) : null}
          {onOpenCommunity ? (
            <button type="button" className="tap-target" onClick={onOpenCommunity}>
              <i className="ti ti-share" aria-hidden="true" />
              <span><strong>Share a story</strong><small>Community preview</small></span>
            </button>
          ) : null}
        </div>
      </section>

      <section className="jmap detail-card-warm" aria-label="Adventure map summary">
        <i className="ti ti-map-2" aria-hidden="true" />
        <div className="jmap-title">Adventure map summary</div>
        <div className="jmap-sub">
          {hasMemories ? `${journeyMap.title} · Saved memories are listed above.` : journeyMap.subtitle}
        </div>
      </section>
    </>
  )
}
