import type { AppState } from '../../data/demo'
import type { Challenge } from '../../data/challenges'
import { ChallengePathExperience } from '../../components/ChallengePathExperience'
import { resolveChallenge } from '../../lib/challengeEngine'
import { CardImage } from '../../components/CardImage'

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

function getDaysLeft(joinedAt: string | undefined, days: number): string {
  if (!joinedAt) return `${days} days`

  const joinedTime = Date.parse(joinedAt)
  if (Number.isNaN(joinedTime)) return `${days} days`

  const endTime = joinedTime + days * 86_400_000
  const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 86_400_000))
  if (remaining === 0) return 'Ends today'
  return `${remaining} day${remaining === 1 ? '' : 's'} left`
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
  const { progress } = resolved
  const progressLabel = `${progress.metricValue} / ${progress.metricTarget}`
  const goalLabel =
    progress.metricTarget === 1
      ? 'adventure'
      : challenge.metric.kind === 'memories_with_photo'
        ? 'memories'
        : 'adventures'
  const daysLeftLabel = getDaysLeft(progress.joinedAt, challenge.duration.days)
  const nextNode = resolved.nodes.find((node) => node.state === 'current')
  const heroTone =
    challenge.accent === 'coastal'
      ? 'coastal'
      : challenge.accent === 'forest'
        ? 'forest'
        : 'warm'

  return (
    <>
      <div className="overlay-topbar">
        <button type="button" className="overlay-back tap-target" onClick={onBack}>
          <i className="ti ti-arrow-left" aria-hidden="true" />
          Back
        </button>
      </div>

      <section className={`challenge-detail-board challenge-detail-board--${challenge.accent}`}>
        <div className="challenge-detail-hero">
          <CardImage
            className="challenge-detail-hero-art"
            imageUrl={resolved.heroImageUrl}
            imageAlt=""
            imageTone={heroTone}
          />
          <div className="challenge-detail-hero-copy">
            <div className="challenge-detail-kicker">Challenge</div>
            <h1 className="challenge-detail-title">
              <span aria-hidden="true">{resolved.emoji}</span> {resolved.title}
            </h1>
            <p className="challenge-detail-copy">{resolved.description}</p>
          </div>
          <div className="challenge-detail-badge" aria-hidden="true">
            <span>{resolved.emoji}</span>
          </div>
        </div>

        <div className="challenge-detail-progress-card">
          <div className="challenge-detail-progress-main">
            <span className="challenge-detail-progress-label">Progress</span>
            <strong>{progressLabel}</strong>
            <span>{goalLabel}</span>
          </div>
          <div className="challenge-detail-progress-side">
            <span>{progress.joined ? daysLeftLabel : challenge.duration.label}</span>
            <span>{resolved.goal}</span>
          </div>
          <div className="challenge-detail-progress-bar" aria-hidden="true">
            <span style={{ width: progress.fillWidth }} />
          </div>
        </div>

        <div className="challenge-detail-facts">
          <div>
            <span>What counts</span>
            <strong>{resolved.whatCounts}</strong>
          </div>
          <div>
            <span>Badge path</span>
            <strong>{resolved.rewardConnection}</strong>
          </div>
        </div>

        <div className="challenge-path-detail-actions">
          {progress.joined ? (
            <>
              <span className="challenge-path-detail-joined">
                {nextNode ? `Up next: ${nextNode.name}` : 'Challenge complete'}
              </span>
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
              onClick={() => {
                onJoinChallenge(challenge.id)
                onGoToPlan?.()
              }}
            >
              Find a Spot
            </button>
          )}
        </div>
      </section>

      <ChallengePathExperience
        challenge={challenge}
        state={state}
        onStartAdventure={onStartAdventure}
        onStartNeighborhoodWalk={onStartNeighborhoodWalk}
        onGoToPlan={onGoToPlan}
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
