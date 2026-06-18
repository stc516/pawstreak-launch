import { useMemo, useState } from 'react'
import type { AppState } from '../../data/demo'
import {
  resolveAllCuratedChallenges,
  resolveJoinedChallenges,
  type ResolvedChallenge,
} from '../../lib/challengeEngine'

interface MilestonesScreenProps {
  state: AppState
  isDemoMode?: boolean
  onOpenChallenge: (challengeId: string) => void
  onJoinChallenge: (challengeId: string) => void
  onOpenAchievements: () => void
}

const DISCOVER_PREVIEW_COUNT = 10

function ViewAllButton({
  expanded,
  total,
  previewCount,
  onClick,
}: {
  expanded: boolean
  total: number
  previewCount: number
  onClick: () => void
}) {
  if (total <= previewCount) return null

  return (
    <button type="button" className="ms-view-all tap-target" onClick={onClick}>
      {expanded ? 'Show less' : `View all · ${total - previewCount} more`}
    </button>
  )
}

function ActiveChallengeCard({
  challenge,
  onOpenChallenge,
}: {
  challenge: ResolvedChallenge
  onOpenChallenge: (challengeId: string) => void
}) {
  return (
    <article className="ms-challenge-card ms-challenge-card--stitch">
      <button
        type="button"
        className="ms-challenge-card-inner tap-target"
        onClick={() => onOpenChallenge(challenge.id)}
      >
        <div className="ms-challenge-card-icon" aria-hidden="true">
          {challenge.emoji}
        </div>
        <div className="ms-challenge-card-content">
          <h2 className="ms-challenge-card-title">{challenge.title}</h2>
          <p className="ms-challenge-card-desc">{challenge.description}</p>
          <div className="ms-challenge-card-bar">
            <div
              className="ms-challenge-card-bar-fill"
              style={{ width: challenge.progress.fillWidth }}
            />
          </div>
          <div className="ms-challenge-card-meta-row">
            <span>
              {challenge.progress.completedNodes}/{challenge.progress.totalNodes} stops
            </span>
            <strong>{challenge.progress.durationLabel}</strong>
          </div>
        </div>
      </button>
    </article>
  )
}

function DiscoverChallengeCard({
  challenge,
  onOpenChallenge,
  onJoinChallenge,
}: {
  challenge: ResolvedChallenge
  onOpenChallenge: (challengeId: string) => void
  onJoinChallenge: (challengeId: string) => void
}) {
  return (
    <article
      className={`ms-challenge-card ms-challenge-card--${challenge.accent} detail-card-warm`}
    >
      <div className="ms-challenge-visual" aria-hidden="true">
        <span>{challenge.emoji}</span>
      </div>
      <div className="ms-challenge-card-top">
        <div>
          <h2 className="ms-challenge-card-title">
            <span className="ms-challenge-card-emoji" aria-hidden="true">
              {challenge.emoji}
            </span>
            {challenge.title}
          </h2>
          <p className="ms-challenge-card-desc">{challenge.description}</p>
        </div>
      </div>

      <div className="ms-challenge-card-meta">
        <span>{challenge.progress.durationLabel}</span>
        <span>
          {challenge.progress.totalNodes} stops · {challenge.progress.metricTarget} goal
        </span>
      </div>

      {challenge.progress.joined ? (
        <>
          <div className="ms-challenge-card-bar">
            <div
              className="ms-challenge-card-bar-fill"
              style={{ width: challenge.progress.fillWidth }}
            />
          </div>
          <button
            type="button"
            className="ms-challenge-card-cta tap-target"
            onClick={() => onOpenChallenge(challenge.id)}
          >
            View progress
          </button>
        </>
      ) : (
        <div className="ms-challenge-card-actions">
          <button
            type="button"
            className="ms-challenge-card-cta tap-target"
            onClick={() => onJoinChallenge(challenge.id)}
          >
            Join challenge
          </button>
          <button
            type="button"
            className="ms-challenge-card-link tap-target"
            onClick={() => onOpenChallenge(challenge.id)}
          >
            Preview
          </button>
        </div>
      )}
    </article>
  )
}

function RequestChallengeCard() {
  return (
    <section className="ms-request-challenge detail-card-warm" aria-label="Request a local challenge">
      <div className="ms-request-icon" aria-hidden="true">
        <i className="ti ti-map-pin-plus" />
      </div>
      <div className="ms-request-copy">
        <h2>Request a Local Challenge</h2>
        <p>Tell us which city should get dog-friendly challenge packs next.</p>
      </div>
      <form className="ms-request-form">
        <input type="text" placeholder="City or ZIP" aria-label="City or ZIP" />
        <button type="button" className="tap-target">Request</button>
      </form>
    </section>
  )
}

function FirstChallengeStarter({
  challenge,
  onJoinChallenge,
  onOpenChallenge,
}: {
  challenge: ResolvedChallenge | undefined
  onJoinChallenge: (challengeId: string) => void
  onOpenChallenge: (challengeId: string) => void
}) {
  if (!challenge) {
    return (
      <section className="ms-first-challenge detail-card-warm">
        <div className="ms-first-challenge-icon" aria-hidden="true">
          <i className="ti ti-trophy" />
        </div>
        <div>
          <h2>Pick a small goal for this week</h2>
          <p>Challenges unlock after real walks, photos, and places you actually visit.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="ms-first-challenge detail-card-warm">
      <div className="ms-first-challenge-icon" aria-hidden="true">
        {challenge.emoji}
      </div>
      <div className="ms-first-challenge-copy">
        <span>Good first challenge</span>
        <h2>{challenge.title}</h2>
        <p>{challenge.description}</p>
        <div className="ms-first-challenge-actions">
          <button
            type="button"
            className="ms-challenge-card-cta tap-target"
            onClick={() => onJoinChallenge(challenge.id)}
          >
            Join
          </button>
          <button
            type="button"
            className="ms-challenge-card-link tap-target"
            onClick={() => onOpenChallenge(challenge.id)}
          >
            Preview
          </button>
        </div>
      </div>
    </section>
  )
}

export function MilestonesScreen({
  state,
  onOpenChallenge,
  onJoinChallenge,
  onOpenAchievements,
}: MilestonesScreenProps) {
  const [showAllDiscover, setShowAllDiscover] = useState(false)

  const joinedChallenges = useMemo(() => resolveJoinedChallenges(state), [state])
  const discoverChallenges = useMemo(() => resolveAllCuratedChallenges(state), [state])
  const localChallenges = useMemo(
    () => discoverChallenges.filter((challenge) => challenge.availability === 'local'),
    [discoverChallenges],
  )
  const anywhereChallenges = useMemo(
    () => discoverChallenges.filter((challenge) => challenge.availability === 'generic'),
    [discoverChallenges],
  )

  const visibleLocalChallenges = showAllDiscover
    ? localChallenges
    : localChallenges.slice(0, DISCOVER_PREVIEW_COUNT)
  const visibleAnywhereChallenges = showAllDiscover
    ? anywhereChallenges
    : anywhereChallenges.slice(0, DISCOVER_PREVIEW_COUNT)
  const starterChallenge = anywhereChallenges[0] ?? localChallenges[0]

  return (
    <div className="ms-screen ms-screen--stitch">
      <header className="st-appbar ms-screen-header">
        <div className="st-appbar-actions">
          <div className="st-avatar-single">
            <div className={`dog-av ${state.dogs[0]?.avatarClass ?? 'av1'}`}>
              {state.dogs[0]?.photoUrl ? (
                <img src={state.dogs[0].photoUrl} alt="" className="dog-av-img" />
              ) : (
                state.dogs[0]?.initial ?? '🐾'
              )}
            </div>
          </div>
          <div className="st-display alogo">PawStreak</div>
        </div>
      </header>

      <div className="st-section-head ms-challenge-sec">
        <h2 className="st-headline-lg">Active Challenges</h2>
        <span className="st-label-lg ms-challenge-sec-count">{joinedChallenges.length} joined</span>
      </div>

      {joinedChallenges.length === 0 ? (
        <FirstChallengeStarter
          challenge={starterChallenge}
          onJoinChallenge={onJoinChallenge}
          onOpenChallenge={onOpenChallenge}
        />
      ) : (
        <div className="ms-challenge-list">
          {joinedChallenges.map((challenge) => (
            <ActiveChallengeCard
              key={challenge.id}
              challenge={challenge}
              onOpenChallenge={onOpenChallenge}
            />
          ))}
        </div>
      )}

      <button type="button" className="ms-badges-entry tap-target" onClick={onOpenAchievements}>
        <span className="ms-badges-icon" aria-hidden="true">
          <i className="ti ti-medal" />
        </span>
        <span className="ms-badges-copy">
          <strong>Badges &amp; Achievements</strong>
          <small>Collect First Adventure, Week Streak, Trail Scout, and more.</small>
        </span>
        <i className="ti ti-chevron-right" aria-hidden="true" />
      </button>

      <div className="st-section-head ms-discover-sec">
        <h2 className="st-headline-lg">Local Challenges</h2>
      </div>
      <p className="ms-challenge-lead">
        Curated SD/OC challenge packs with real local place paths.
      </p>

      {!state.locationSupported ? (
        <RequestChallengeCard />
      ) : localChallenges.length === 0 ? (
        <p className="ms-section-empty detail-card-warm">Local challenges will show up here.</p>
      ) : (
        <div className="ms-challenge-list">
          {visibleLocalChallenges.map((challenge) => (
            <DiscoverChallengeCard
              key={challenge.id}
              challenge={challenge}
              onOpenChallenge={onOpenChallenge}
              onJoinChallenge={onJoinChallenge}
            />
          ))}
        </div>
      )}

      <div className="st-section-head ms-discover-sec">
        <h2 className="st-headline-lg">Anywhere Challenges</h2>
      </div>
      <p className="ms-challenge-lead">
        Flexible goals that work with neighborhood walks, custom adventures, and generic ideas.
      </p>

      {anywhereChallenges.length === 0 ? (
        <p className="ms-section-empty detail-card-warm">Anywhere challenges will show up here.</p>
      ) : (
        <div className="ms-challenge-list">
          {visibleAnywhereChallenges.map((challenge) => (
            <DiscoverChallengeCard
              key={challenge.id}
              challenge={challenge}
              onOpenChallenge={onOpenChallenge}
              onJoinChallenge={onJoinChallenge}
            />
          ))}
        </div>
      )}

      <ViewAllButton
        expanded={showAllDiscover}
        total={Math.max(localChallenges.length, anywhereChallenges.length)}
        previewCount={DISCOVER_PREVIEW_COUNT}
        onClick={() => setShowAllDiscover((value) => !value)}
      />
    </div>
  )
}
