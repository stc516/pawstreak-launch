import { useMemo, useState } from 'react'
import type { AppState } from '../../data/demo'
import {
  resolveAllCuratedChallenges,
  resolveJoinedChallenges,
  type ResolvedChallenge,
} from '../../lib/challengeEngine'
import { BrandLogoCircle } from '../../components/BrandLogoCircle'

interface MilestonesScreenProps {
  state: AppState
  isDemoMode?: boolean
  onOpenChallenge: (challengeId: string) => void
  onJoinChallenge: (challengeId: string) => void
  onOpenAchievements: () => void
  onRequestChallenge?: (cityOrZip: string) => Promise<boolean>
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
        <img src={challenge.heroImageUrl} alt="" />
      </div>
      <div className="ms-challenge-card-top">
        <div>
          <h2 className="ms-challenge-card-title">{challenge.title}</h2>
          <p className="ms-challenge-card-desc">{challenge.description}</p>
        </div>
      </div>

      <div className="ms-challenge-card-meta">
        <span>{challenge.progress.durationLabel}</span>
        <span>
          {challenge.progress.totalNodes} stops · {challenge.progress.metricTarget}{' '}
          {challenge.progress.metricTarget === 1 ? 'goal' : 'goals'}
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
            onClick={() => {
              onJoinChallenge(challenge.id)
              onOpenChallenge(challenge.id)
            }}
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

function RequestChallengeCard({
  onRequestChallenge,
}: {
  onRequestChallenge?: (cityOrZip: string) => Promise<boolean>
}) {
  const [cityOrZip, setCityOrZip] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const submit = async () => {
    const value = cityOrZip.trim()
    if (!value || status === 'saving') return
    setStatus('saving')
    const ok = onRequestChallenge ? await onRequestChallenge(value) : true
    setStatus(ok ? 'saved' : 'error')
  }

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
        <input
          type="text"
          placeholder="City or ZIP"
          aria-label="City or ZIP"
          value={cityOrZip}
          onChange={(event) => {
            setCityOrZip(event.target.value)
            if (status !== 'idle') setStatus('idle')
          }}
        />
        <button
          type="button"
          className="tap-target"
          disabled={!cityOrZip.trim() || status === 'saving'}
          onClick={() => void submit()}
        >
          {status === 'saving' ? 'Sending…' : status === 'saved' ? 'Sent' : 'Request'}
        </button>
      </form>
      {status === 'saved' ? (
        <p className="ms-request-status">Got it. We&apos;ll use this to prioritize new challenge packs.</p>
      ) : status === 'error' ? (
        <p className="ms-request-status ms-request-status--error">
          Could not save that request. Try again in a minute.
        </p>
      ) : null}
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
            onClick={() => {
              onJoinChallenge(challenge.id)
              onOpenChallenge(challenge.id)
            }}
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
  onRequestChallenge,
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
        <div className="app-brand-lockup">
          <BrandLogoCircle size={34} />
          <div className="st-display alogo">PawStreak</div>
        </div>
      </header>

      <div className="st-section-head ms-challenge-sec">
        <h2 className="st-headline-lg">Active Challenges</h2>
        <span className="st-label-lg ms-challenge-sec-count">{joinedChallenges.length} joined</span>
      </div>
      <p className="ms-challenge-lead">
        Challenges help you break the same-walk routine with beaches, trails, patios, parks, and
        small weekly goals.
      </p>

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

      <div className="st-section-head ms-discover-sec">
        <h2 className="st-headline-lg">Local Challenges</h2>
      </div>
      <p className="ms-challenge-lead">
        Curated challenge packs with real local dog-friendly places to try.
      </p>

      {!state.locationSupported ? (
        <RequestChallengeCard onRequestChallenge={onRequestChallenge} />
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
        Simple goals that work anywhere when local challenge packs aren&apos;t ready yet.
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

      <button type="button" className="ms-rewards-link tap-target" onClick={onOpenAchievements}>
        View rewards
      </button>
    </div>
  )
}
