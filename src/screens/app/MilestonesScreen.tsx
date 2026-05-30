import { useMemo, useState } from 'react'
import type { AppState } from '../../data/demo'
import type { Achievement } from '../../data/achievements'
import { getDisplayBondSubtitle, getDisplayDogLabel } from '../../lib/profileDisplay'
import { LIVE_PRODUCT } from '../../lib/liveProductFeatures'
import { shouldShowBondLevel } from '../../lib/bondLevel'
import { resolveAchievementsByCategory } from '../../lib/achievementEngine'
import {
  resolveAllCuratedChallenges,
  resolveJoinedChallenges,
  type ResolvedChallenge,
} from '../../lib/challengeEngine'
import {
  getTrainingSummary,
  resolveAllTrainingPrograms,
  resolveUnlockedTrainingRewards,
  type ResolvedTrainingProgram,
} from '../../lib/trainingEngine'
import { CardImage } from '../../components/CardImage'
import { AchievementIdentityCard } from '../../components/AchievementIdentityCard'

interface MilestonesScreenProps {
  state: AppState
  isDemoMode?: boolean
  onOpenChallenge: (challengeId: string) => void
  onJoinChallenge: (challengeId: string) => void
  onOpenAchievement: (achievementId: string) => void
  onOpenTrainingProgram: (programId: string) => void
  onOpenJourneyLevel: () => void
}

const IDENTITY_PREVIEW_COUNT = 3
const TRAINING_PREVIEW_COUNT = 2
const CURATED_PREVIEW_COUNT = 3

function formatParticipants(count: number, label: string): string {
  return `${new Intl.NumberFormat(undefined, { notation: count >= 1000 ? 'compact' : 'standard' }).format(count)} ${label}`
}

function identityRank(status: Achievement['status']): number {
  if (status === 'active') return 0
  if (status === 'done') return 1
  return 2
}

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
    <article
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
          {formatParticipants(challenge.participants.count, challenge.participants.label)}
        </span>
      </div>

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
        View challenge
      </button>
    </article>
  )
}

function CuratedChallengeCard({
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
          {formatParticipants(challenge.participants.count, challenge.participants.label)}
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

function TrainingProgramCard({
  program,
  onOpenTrainingProgram,
}: {
  program: ResolvedTrainingProgram
  onOpenTrainingProgram: (programId: string) => void
}) {
  return (
    <article
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
  )
}

export function MilestonesScreen({
  state,
  onOpenChallenge,
  onJoinChallenge,
  onOpenAchievement,
  onOpenTrainingProgram,
  onOpenJourneyLevel,
}: MilestonesScreenProps) {
  const [showAllIdentities, setShowAllIdentities] = useState(false)
  const [showAllTraining, setShowAllTraining] = useState(false)
  const [showAllCurated, setShowAllCurated] = useState(false)

  const joinedChallenges = useMemo(() => resolveJoinedChallenges(state), [state])
  const curatedChallenges = useMemo(() => resolveAllCuratedChallenges(state), [state])
  const trainingPrograms = useMemo(() => resolveAllTrainingPrograms(state), [state])
  const trainingRewards = useMemo(() => resolveUnlockedTrainingRewards(state), [state])
  const trainingSummary = useMemo(() => getTrainingSummary(state), [state])

  const achievementGroups = useMemo(
    () => resolveAchievementsByCategory(state),
    [state],
  )

  const identityItems = useMemo(
    () =>
      achievementGroups
        .flatMap(({ achievements }) => achievements)
        .filter((achievement) => achievement.status !== 'locked')
        .sort((left, right) => identityRank(left.status) - identityRank(right.status)),
    [achievementGroups],
  )

  const unlockedCount = useMemo(
    () => identityItems.filter((item) => item.progress.unlocked).length,
    [identityItems],
  )

  const visibleIdentities = showAllIdentities
    ? identityItems
    : identityItems.slice(0, IDENTITY_PREVIEW_COUNT)

  const visibleTrainingPrograms = showAllTraining
    ? trainingPrograms
    : trainingPrograms.slice(0, TRAINING_PREVIEW_COUNT)

  const visibleCuratedChallenges = showAllCurated
    ? curatedChallenges
    : curatedChallenges.slice(0, CURATED_PREVIEW_COUNT)

  const dogLabel = getDisplayDogLabel(state)
  const primaryDogName = dogLabel.split(' + ')[0] ?? dogLabel

  return (
    <div className="ms-screen ms-screen--compact">
      <div className="aheader ms-screen-header">
        <div className="alogo">Challenges</div>
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
              <div className="msb-fill" style={{ width: state.bondLevel.fillWidth }} />
            </div>
          ) : null}
          <div className="msb-sub">{getDisplayBondSubtitle(state)}</div>
          <div className="msb-helper">{state.bondLevel.nextUnlock}</div>
        </button>
      ) : null}

      <div className="sec ms-challenge-sec">
        <span>Active challenges</span>
        <span className="ms-challenge-sec-count">{joinedChallenges.length} joined</span>
      </div>

      {joinedChallenges.length === 0 ? (
        <p className="ms-challenge-lead">
          Join a curated challenge below — opt in, track progress, climb the board.
        </p>
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

      <div className="sec ms-achievement-sec">
        <span>Dog identities</span>
        <span className="ms-achievement-count">{unlockedCount} earned</span>
      </div>

      <p className="ms-achievement-lead">
        Personality traits earned from real adventures — {primaryDogName} becomes a Trail Dog, not a badge unlocked.
      </p>

      {identityItems.length > 0 ? (
        <div className="ms-identity-list">
          {visibleIdentities.map((achievement) => (
            <AchievementIdentityCard
              key={achievement.id}
              achievement={achievement}
              compact
              onClick={() => onOpenAchievement(achievement.id)}
            />
          ))}
        </div>
      ) : (
        <p className="ms-section-empty">Adventures will shape your dog&apos;s identities here.</p>
      )}

      <ViewAllButton
        expanded={showAllIdentities}
        total={identityItems.length}
        previewCount={IDENTITY_PREVIEW_COUNT}
        onClick={() => setShowAllIdentities((value) => !value)}
      />

      <div className="sec ms-training-sec">
        <span>Training programs</span>
        <span className="ms-training-sec-count">
          {trainingSummary.programsStarted} started · {trainingSummary.rewardsUnlocked} rewards
        </span>
      </div>

      <p className="ms-training-lead">
        Build real habits lesson by lesson — complete a program and your dog earns its training badge.
      </p>

      <div className="ms-training-list">
        {visibleTrainingPrograms.map((program) => (
          <TrainingProgramCard
            key={program.id}
            program={program}
            onOpenTrainingProgram={onOpenTrainingProgram}
          />
        ))}
      </div>

      <ViewAllButton
        expanded={showAllTraining}
        total={trainingPrograms.length}
        previewCount={TRAINING_PREVIEW_COUNT}
        onClick={() => setShowAllTraining((value) => !value)}
      />

      {showAllTraining && trainingRewards.length > 0 ? (
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

      <div className="sec">Curated challenges</div>
      <p className="ms-challenge-lead">Discover seasonal packs and join when you are ready.</p>

      <div className="ms-challenge-list">
        {visibleCuratedChallenges.map((challenge) => (
          <CuratedChallengeCard
            key={challenge.id}
            challenge={challenge}
            onOpenChallenge={onOpenChallenge}
            onJoinChallenge={onJoinChallenge}
          />
        ))}
      </div>

      <ViewAllButton
        expanded={showAllCurated}
        total={curatedChallenges.length}
        previewCount={CURATED_PREVIEW_COUNT}
        onClick={() => setShowAllCurated((value) => !value)}
      />
    </div>
  )
}
