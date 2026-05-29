import type { AppState } from '../../data/demo'
import type { Challenge } from '../../data/challenges'
import { ChallengePathExperience } from '../../components/ChallengePathExperience'
import { resolveChallenge } from '../../lib/challengeEngine'

interface ChallengePathDetailViewProps {
  challenge: Challenge
  state: AppState
  onBack: () => void
  onJoinChallenge: (challengeId: string) => void
  onLeaveChallenge: (challengeId: string) => void
  onStartAdventure: (placeId: string) => void
  onStartNeighborhoodWalk?: () => void
  onGoToPlan?: () => void
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
  onGoToPlan,
  onOpenMemory,
}: ChallengePathDetailViewProps) {
  const resolved = resolveChallenge(challenge, state)
  const { progress, leaderboard } = resolved

  return (
    <>
      <div className="overlay-topbar">
        <button type="button" className="overlay-back tap-target" onClick={onBack}>
          <i className="ti ti-arrow-left" aria-hidden="true" />
          Back
        </button>
      </div>

      <div className="challenge-path-detail-intro detail-tint detail-tint--warm">
        <div className="challenge-path-detail-kicker">Curated challenge</div>
        <h1 className="challenge-path-detail-title">
          <span aria-hidden="true">{resolved.emoji}</span> {resolved.title}
        </h1>
        <p className="challenge-path-detail-copy">{resolved.description}</p>

        <div className="challenge-path-detail-meta">
          <div className="challenge-path-detail-meta-item">
            <span className="challenge-path-detail-meta-label">Duration</span>
            <span>{progress.durationLabel}</span>
          </div>
          <div className="challenge-path-detail-meta-item">
            <span className="challenge-path-detail-meta-label">Participants</span>
            <span>
              {new Intl.NumberFormat(undefined, {
                notation: resolved.participants.count >= 1000 ? 'compact' : 'standard',
              }).format(resolved.participants.count)}{' '}
              {resolved.participants.label}
            </span>
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
            </>
          ) : (
            <button
              type="button"
              className="challenge-path-detail-join tap-target"
              onClick={() => onJoinChallenge(challenge.id)}
            >
              Join challenge
            </button>
          )}
        </div>
      </div>

      {progress.joined ? (
        <>
          <ChallengePathExperience
            challenge={challenge}
            state={state}
            onStartAdventure={onStartAdventure}
            onStartNeighborhoodWalk={onStartNeighborhoodWalk}
            onGoToPlan={onGoToPlan}
            onOpenMemory={onOpenMemory}
          />

          <section className="challenge-leaderboard detail-card-warm">
            <div className="challenge-leaderboard-head">
              <h2 className="challenge-leaderboard-title">Leaderboard</h2>
              <span className="challenge-leaderboard-key">{leaderboard.leaderboardKey}</span>
            </div>
            <ol className="challenge-leaderboard-list">
              {leaderboard.entries.map((entry) => (
                <li
                  key={entry.participantId}
                  className={`challenge-leaderboard-row${entry.participantId === 'local-user' ? ' challenge-leaderboard-row--you' : ''}`}
                >
                  <span className="challenge-leaderboard-rank">{entry.rank}</span>
                  <span className="challenge-leaderboard-avatar">{entry.avatarInitial}</span>
                  <span className="challenge-leaderboard-name">{entry.displayName}</span>
                  <span className="challenge-leaderboard-score">{entry.score}</span>
                </li>
              ))}
            </ol>
          </section>
        </>
      ) : (
        <div className="challenge-path-detail-preview detail-card-warm">
          <p>Join to start tracking progress and appear on the leaderboard.</p>
          <ul className="challenge-path-detail-milestones">
            {resolved.nodes.map((node) => (
              <li key={node.id}>{node.title}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}
