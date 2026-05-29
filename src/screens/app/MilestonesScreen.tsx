import { useMemo } from 'react'
import type { AppState } from '../../data/demo'
import { CHALLENGE_PATHS } from '../../data/challengePaths'
import { getDisplayBondSubtitle } from '../../lib/profileDisplay'
import { resolveChallengePathNodes, getChallengePathProgressSummary } from '../../lib/challengePathProgress'

interface MilestonesScreenProps {
  state: AppState
  isDemoMode?: boolean
  onOpenChallengePath: (pathId: string) => void
  onOpenAchievement: (achievementId: string) => void
  onOpenJourneyLevel: () => void
}

export function MilestonesScreen({
  state,
  isDemoMode = false,
  onOpenChallengePath,
  onOpenAchievement,
  onOpenJourneyLevel,
}: MilestonesScreenProps) {
  const challengeCards = useMemo(
    () =>
      CHALLENGE_PATHS.map((path) => {
        const nodes = resolveChallengePathNodes(path, state.journeyEntries, isDemoMode)
        const progress = getChallengePathProgressSummary(nodes)
        return { path, nodes, progress }
      }),
    [state.journeyEntries, isDemoMode],
  )

  return (
    <>
      <div className="aheader">
        <div className="alogo">Milestones</div>
      </div>

      <button
        type="button"
        className="ms-bond ms-bond--tap tap-target detail-card-warm"
        onClick={onOpenJourneyLevel}
      >
        <div className="msb-top">
          <div className="msb-label">{state.bondLevel.label}</div>
          <div className="msb-rank">{state.bondLevel.rank}</div>
        </div>
        <div className="msb-bar">
          <div
            className="msb-fill"
            style={{ width: state.bondLevel.fillWidth }}
          />
        </div>
        <div className="msb-sub">{getDisplayBondSubtitle(state)}</div>
        <div className="msb-helper">
          Every adventure, photo, and place adds to their story.
        </div>
      </button>

      <div className="sec">Active challenges</div>

      <div className="ms-challenge-list">
        {challengeCards.map(({ path, progress }) => (
          <article key={path.id} className={`ms-challenge-card ms-challenge-card--${path.accent} detail-card-warm`}>
            <div className="ms-challenge-card-top">
              <div>
                <h2 className="ms-challenge-card-title">{path.title}</h2>
                <p className="ms-challenge-card-desc">{path.description}</p>
              </div>
              <div className="ms-challenge-card-count">
                {progress.completed}/{progress.total}
              </div>
            </div>

            <div className="ms-challenge-card-bar">
              <div
                className="ms-challenge-card-bar-fill"
                style={{ width: progress.fillWidth }}
              />
            </div>

            <div className="ms-challenge-card-sub">{path.subtitle}</div>

            <button
              type="button"
              className="ms-challenge-card-cta tap-target"
              onClick={() => onOpenChallengePath(path.id)}
            >
              View path
            </button>
          </article>
        ))}
      </div>

      <div className="sec">Achievements</div>

      {state.achievements.length === 0 ? (
        <p className="pack-access-copy">Achievements appear after your first saved memories.</p>
      ) : (
        state.achievements.map((achievement) => (
          <button
            key={achievement.id}
            type="button"
            className={`ach-item ach-item--tap tap-target ${achievement.status}`}
            onClick={() => onOpenAchievement(achievement.id)}
          >
            <div className="ach-ico">{achievement.emoji}</div>
            <div>
              <div className="ach-title">{achievement.title}</div>
              <div className="ach-sub">{achievement.subtitle}</div>
            </div>
            <div className={`ach-badge ${achievement.status}`}>
              {achievement.badge}
            </div>
          </button>
        ))
      )}
    </>
  )
}
