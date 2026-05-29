import { useMemo } from 'react'
import type { AppState } from '../../data/demo'
import { getDisplayBondSubtitle } from '../../lib/profileDisplay'
import { LIVE_PRODUCT } from '../../lib/liveProductFeatures'
import { shouldShowBondLevel } from '../../lib/bondLevel'
import { resolveAchievementsByCategory } from '../../lib/achievementEngine'
import { resolveAllCuratedChallenges, resolveJoinedChallenges } from '../../lib/challengeEngine'
import {
  getTrainingSummary,
  resolveAllTrainingPrograms,
  resolveUnlockedTrainingRewards,
} from '../../lib/trainingEngine'
import { CardImage } from '../../components/CardImage'

interface MilestonesScreenProps {
  state: AppState
  isDemoMode?: boolean
  onOpenChallenge: (challengeId: string) => void
  onJoinChallenge: (challengeId: string) => void
  onOpenAchievement: (achievementId: string) => void
  onOpenTrainingProgram: (programId: string) => void
  onOpenJourneyLevel: () => void
}

function formatParticipants(count: number, label: string): string {
  return `${new Intl.NumberFormat(undefined, { notation: count >= 1000 ? 'compact' : 'standard' }).format(count)} ${label}`
}

export function MilestonesScreen({
  state,
  onOpenChallenge,
  onJoinChallenge,
  onOpenAchievement,
  onOpenTrainingProgram,
  onOpenJourneyLevel,
}: MilestonesScreenProps) {
  const joinedChallenges = useMemo(() => resolveJoinedChallenges(state), [state])
  const curatedChallenges = useMemo(() => resolveAllCuratedChallenges(state), [state])
  const trainingPrograms = useMemo(() => resolveAllTrainingPrograms(state), [state])
  const trainingRewards = useMemo(() => resolveUnlockedTrainingRewards(state), [state])
  const trainingSummary = useMemo(() => getTrainingSummary(state), [state])

  const achievementGroups = useMemo(
    () => resolveAchievementsByCategory(state),
    [state],
  )

  const unlockedCount = useMemo(
    () =>
      achievementGroups.reduce(
        (total, group) =>
          total + group.achievements.filter((item) => item.progress.unlocked).length,
        0,
      ),
    [achievementGroups],
  )

  return (
    <>
      <div className="aheader">
        <div className="alogo">Milestones</div>
      </div>

      {shouldShowBondLevel(state) ? (
      <button
        type="button"
        className="ms-bond ms-bond--tap tap-target detail-card-warm"
        onClick={onOpenJourneyLevel}
      >
        <div className="msb-top">
          <div className="msb-label">{state.bondLevel.label}</div>
          <div className="msb-rank">{state.bondLevel.rank}</div>
        </div>
        {LIVE_PRODUCT.bondProgressBar ? (
          <div className="msb-bar">
            <div
              className="msb-fill"
              style={{ width: state.bondLevel.fillWidth }}
            />
          </div>
        ) : null}
        <div className="msb-sub">{getDisplayBondSubtitle(state)}</div>
        <div className="msb-helper">{state.bondLevel.nextUnlock}</div>
      </button>
      ) : null}

      <div className="sec ms-challenge-sec">
        <span>Your challenges</span>
        <span className="ms-challenge-sec-count">{joinedChallenges.length} joined</span>
      </div>

      {joinedChallenges.length === 0 ? (
        <p className="ms-challenge-lead">Join a curated challenge below — opt in, track progress, climb the board.</p>
      ) : (
        <div className="ms-challenge-list">
          {joinedChallenges.map((challenge) => (
            <article
              key={challenge.id}
              className={`ms-challenge-card ms-challenge-card--${challenge.accent} detail-card-warm`}
            >
              <div className="ms-challenge-card-top">
                <div>
                  <h2 className="ms-challenge-card-title">{challenge.title}</h2>
                  <p className="ms-challenge-card-desc">{challenge.description}</p>
                </div>
                <div className="ms-challenge-card-count">
                  {challenge.progress.metricValue}/{challenge.progress.metricTarget}
                </div>
              </div>

              <div className="ms-challenge-card-meta">
                <span>{challenge.progress.durationLabel}</span>
                <span>
                  {formatParticipants(
                    challenge.participants.count,
                    challenge.participants.label,
                  )}
                </span>
              </div>

              <div className="ms-challenge-card-bar">
                <div
                  className="ms-challenge-card-bar-fill"
                  style={{ width: challenge.progress.fillWidth }}
                />
              </div>

              <div className="ms-challenge-card-sub">{challenge.subtitle}</div>

              <button
                type="button"
                className="ms-challenge-card-cta tap-target"
                onClick={() => onOpenChallenge(challenge.id)}
              >
                View challenge
              </button>
            </article>
          ))}
        </div>
      )}

      <div className="sec">Curated challenges</div>

      <div className="ms-challenge-list">
        {curatedChallenges.map((challenge) => (
          <article
            key={challenge.id}
            className={`ms-challenge-card ms-challenge-card--${challenge.accent} detail-card-warm`}
          >
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
                {formatParticipants(
                  challenge.participants.count,
                  challenge.participants.label,
                )}
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
                <div className="ms-challenge-card-sub">
                  {challenge.progress.metricValue} of {challenge.progress.metricTarget} logged
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
              <>
                <div className="ms-challenge-card-sub">{challenge.subtitle}</div>
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
              </>
            )}
          </article>
        ))}
      </div>

      <div className="sec ms-training-sec">
        <span>Training programs</span>
        <span className="ms-training-sec-count">
          {trainingSummary.rewardsUnlocked} rewards
        </span>
      </div>

      <p className="ms-training-lead">
        Work through lessons at your pace — complete a program to earn its badge.
      </p>

      <div className="ms-training-list">
        {trainingPrograms.map((program) => (
          <article
            key={program.id}
            className={`ms-training-card ms-training-card--${program.accent} detail-card-warm`}
          >
            <div className="ms-training-card-top">
              <div>
                <h2 className="ms-training-card-title">
                  <span aria-hidden="true">{program.emoji}</span> {program.title}
                </h2>
                <p className="ms-training-card-desc">{program.description}</p>
              </div>
              <div className="ms-training-card-count">
                {program.progress.lessonsCompleted}/{program.progress.lessonsTotal}
              </div>
            </div>

            <div className="ms-training-card-meta">
              <span>{program.subtitle}</span>
              <span>Reward · {program.reward.title}</span>
            </div>

            <div className="ms-training-card-bar">
              <div
                className="ms-training-card-bar-fill"
                style={{ width: program.progress.fillWidth }}
              />
            </div>

            <button
              type="button"
              className="ms-training-card-cta tap-target"
              onClick={() => onOpenTrainingProgram(program.id)}
            >
              {program.progress.completed ? 'Review program' : 'Open lessons'}
            </button>
          </article>
        ))}
      </div>

      {trainingRewards.length > 0 ? (
        <>
          <div className="sec">Training rewards</div>
          <div className="ms-training-rewards">
            {trainingRewards.map((reward) => (
              <div key={`${reward.id}-${reward.programId}`} className="ms-training-reward detail-card-warm">
                <CardImage
                  className="ms-training-reward-img"
                  imageUrl={reward.badgeImageUrl}
                  imageAlt=""
                  imageTone="warm"
                />
                <div>
                  <div className="ms-training-reward-title">
                    {reward.emoji} {reward.title}
                  </div>
                  <div className="ms-training-reward-sub">{reward.description}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}

      <div className="sec ms-achievement-sec">
        <span>Achievements</span>
        <span className="ms-achievement-count">{unlockedCount} unlocked</span>
      </div>

      <p className="ms-achievement-lead">
        Earned automatically from adventures and memories — nothing to join.
      </p>

      {achievementGroups.map(({ category, achievements }) => (
        <section key={category.id} className="ms-achievement-group">
          <div className="ms-achievement-group-head">
            <span className="ms-achievement-group-emoji" aria-hidden="true">
              {category.emoji}
            </span>
            <span className="ms-achievement-group-label">{category.label}</span>
          </div>

          {achievements.map((achievement) => (
            <button
              key={achievement.id}
              type="button"
              className={`ach-item ach-item--tap tap-target ${achievement.status}`}
              onClick={() => onOpenAchievement(achievement.id)}
            >
              <div className="ach-item-badge-wrap">
                <CardImage
                  className="ach-item-badge-img"
                  imageUrl={achievement.badgeImageUrl}
                  imageAlt=""
                  imageTone="warm"
                />
                <span className="ach-item-emoji" aria-hidden="true">
                  {achievement.emoji}
                </span>
              </div>
              <div className="ach-item-copy">
                <div className="ach-title">{achievement.title}</div>
                <div className="ach-sub">{achievement.subtitle}</div>
                {!achievement.progress.unlocked ? (
                  <div className="ach-progress-bar" aria-hidden="true">
                    <div
                      className="ach-progress-fill"
                      style={{
                        width: `${Math.round((achievement.progress.current / achievement.progress.target) * 100)}%`,
                      }}
                    />
                  </div>
                ) : null}
              </div>
              <div className={`ach-badge ${achievement.status}`}>
                {achievement.badge}
              </div>
            </button>
          ))}
        </section>
      ))}
    </>
  )
}
