import type { AppState } from '../../data/demo'
import type { Challenge } from '../../data/challenges'
import { ChallengePathExperience } from '../../components/ChallengePathExperience'
import { resolveChallenge, resolveChallengeNodes } from '../../lib/challengeEngine'
import { downloadChallengeCalendar } from '../../lib/calendarExport'

interface ChallengeStartOptions {
  durationLabel?: string
  startNow?: boolean
}

interface ChallengePathDetailViewProps {
  challenge: Challenge
  state: AppState
  onBack: () => void
  onJoinChallenge: (challengeId: string) => void
  onLeaveChallenge: (challengeId: string) => void
  onStartAdventure: (placeId: string, options?: ChallengeStartOptions) => void
  onStartNeighborhoodWalk?: (durationLabel?: string) => void
  onOpenMemory?: (entryId: string) => void
}

export function ChallengePathDetailView({
  challenge,
  state,
  onBack,
  onJoinChallenge,
  onLeaveChallenge,
  onStartAdventure,
  onStartNeighborhoodWalk,
  onOpenMemory,
}: ChallengePathDetailViewProps) {
  const resolved = resolveChallenge(challenge, state)
  const { progress } = resolved
  const nodes = resolveChallengeNodes(challenge, state)

  return (
    <>
      <div className="overlay-topbar">
        <button type="button" className="overlay-back tap-target" onClick={onBack}>
          <i className="ti ti-arrow-left" aria-hidden="true" />
          Back
        </button>
      </div>

      <div className="challenge-path-detail-intro detail-tint detail-tint--warm">
        <div className="challenge-path-detail-kicker">Challenge</div>
        <h1 className="challenge-path-detail-title">
          <span aria-hidden="true">{resolved.emoji}</span> {resolved.title}
        </h1>
        <p className="challenge-path-detail-copy">{resolved.description}</p>

        <div className="challenge-path-detail-meta">
          <div className="challenge-path-detail-meta-item">
            <span className="challenge-path-detail-meta-label">Duration</span>
            <span>{progress.durationLabel}</span>
          </div>
          {progress.joined ? (
            <div className="challenge-path-detail-meta-item">
              <span className="challenge-path-detail-meta-label">Your progress</span>
              <span>
                {progress.metricValue}/{progress.metricTarget}
              </span>
            </div>
          ) : null}
        </div>

        <div className="challenge-path-detail-meta challenge-path-detail-meta--stack">
          <div className="challenge-path-detail-meta-item">
            <span className="challenge-path-detail-meta-label">Goal</span>
            <span>{resolved.goal}</span>
          </div>
          <div className="challenge-path-detail-meta-item">
            <span className="challenge-path-detail-meta-label">What counts</span>
            <span>{resolved.whatCounts}</span>
          </div>
          <div className="challenge-path-detail-meta-item">
            <span className="challenge-path-detail-meta-label">Reward connection</span>
            <span>{resolved.rewardConnection}</span>
          </div>
        </div>

        <div className="challenge-path-detail-actions">
          {progress.joined ? (
            <>
              <span className="challenge-path-detail-joined">You joined this challenge</span>
              <button
                type="button"
                className="challenge-path-detail-leave tap-target"
                onClick={() => onLeaveChallenge(challenge.id)}
              >
                Leave challenge
              </button>
              <button
                type="button"
                className="challenge-path-detail-calendar tap-target"
                onClick={() => downloadChallengeCalendar(challenge, nodes)}
              >
                <i className="ti ti-calendar-plus" aria-hidden="true" />
                Add to Calendar
              </button>
            </>
          ) : (
            <button
              type="button"
              className="challenge-path-detail-join tap-target"
              onClick={() => onJoinChallenge(challenge.id)}
            >
              {resolved.actionCta}
            </button>
          )}
        </div>
      </div>

      <ChallengePathExperience
        challenge={challenge}
        state={state}
        onStartAdventure={onStartAdventure}
        onStartNeighborhoodWalk={onStartNeighborhoodWalk}
        onOpenMemory={onOpenMemory}
      />

      {progress.joined ? (
        <section className="challenge-leaderboard detail-card-warm">
          <div className="challenge-leaderboard-head">
            <h2 className="challenge-leaderboard-title">Leaderboard</h2>
          </div>
          <p className="challenge-leaderboard-empty">
            No leaderboard yet. Yours will fill in when more packs join this challenge.
          </p>
        </section>
      ) : null}
    </>
  )
}
