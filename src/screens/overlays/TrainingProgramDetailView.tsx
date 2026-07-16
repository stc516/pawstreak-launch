import { useState } from 'react'
import type { AppState } from '../../data/demo'
import type { TrainingProgram } from '../../data/training'
import { CardImage } from '../../components/CardImage'
import { resolveTrainingProgram } from '../../lib/trainingEngine'
import { getDisplayDogLabel, getProfileDogs } from '../../lib/profileDisplay'

interface TrainingProgramDetailViewProps {
  program: TrainingProgram
  state: AppState
  onBack: () => void
  onCompleteLesson: (lessonId: string) => void
  onResetLesson: (lessonId: string) => void
}

export function TrainingProgramDetailView({
  program,
  state,
  onBack,
  onCompleteLesson,
  onResetLesson,
}: TrainingProgramDetailViewProps) {
  const resolved = resolveTrainingProgram(program, state)
  const { progress, reward } = resolved
  const dogLabel = getDisplayDogLabel(state)
  const leadDog = getProfileDogs(state)[0]
  const [celebration, setCelebration] = useState<string | null>(null)
  const nextLesson = progress.lessons.find((item) => !item.completed)

  const handleComplete = (lessonId: string, lessonTitle: string) => {
    setCelebration(lessonTitle)
    onCompleteLesson(lessonId)
  }

  return (
    <>
      <div className="overlay-topbar">
        <button type="button" className="overlay-back tap-target" onClick={onBack}>
          <i className="ti ti-arrow-left" aria-hidden="true" />
          Back
        </button>
      </div>

      <div className="training-detail-intro training-detail-intro--electric">
        <div className="training-detail-copy-block">
          <div className="training-detail-kicker">{progress.completed ? 'Training adventure complete' : 'Active training adventure'}</div>
          <h1 className="training-detail-title">
            <span aria-hidden="true">{resolved.emoji}</span> {resolved.title}
          </h1>
          <p className="training-detail-copy">{resolved.description}</p>
        </div>

        {leadDog ? (
          <div className="training-detail-dog" aria-label={`${leadDog.name}'s training portrait`}>
            {leadDog.photoUrl ? <img src={leadDog.photoUrl} alt="" /> : <span aria-hidden="true">{leadDog.profileEmoji}</span>}
            <i aria-hidden="true">⚡</i>
          </div>
        ) : null}

        <div className="training-detail-meta">
          <div className="training-detail-meta-item">
            <span className="training-detail-meta-label">Sessions complete</span>
            <span>
              {progress.lessonsCompleted}/{progress.lessonsTotal} lessons
            </span>
          </div>
          <div className="training-detail-meta-item">
            <span className="training-detail-meta-label">Adventure reward</span>
            <span>{reward.title}</span>
          </div>
        </div>

        <div className="training-detail-bar">
          <div
            className="training-detail-bar-fill"
            style={{ width: progress.fillWidth }}
          />
        </div>
      </div>

      {celebration ? (
        <div className="training-win-burst" role="status">
          <span className="training-win-confetti" aria-hidden="true">✦ ⚡ ✦</span>
          <div>
            <strong>SKILL UNLOCKED!</strong>
            <p>{dogLabel} nailed “{celebration}.” That&apos;s a real win.</p>
          </div>
          <button type="button" className="tap-target" onClick={() => setCelebration(null)}>
            Keep going
          </button>
        </div>
      ) : null}

      <div className="training-mission-section-head">
        <span>Training adventure</span>
        <strong>{nextLesson ? `Up next: ${nextLesson.lesson.title}` : 'Every session complete!'}</strong>
      </div>

      <div className="training-lesson-list">
        {progress.lessons.map((item, index) => (
          <article
            key={item.lessonId}
            className={`training-lesson-card detail-card-warm${item.completed ? ' training-lesson-card--done' : ''}${nextLesson?.lessonId === item.lessonId ? ' training-lesson-card--current' : ''}`}
          >
            <div className="training-lesson-eyebrow">
              <span>Session {index + 1}</span>
              {item.completed ? <strong>Crushed</strong> : nextLesson?.lessonId === item.lessonId ? <strong>Up next</strong> : null}
            </div>
            <div className="training-lesson-top">
              <span className="training-lesson-emoji" aria-hidden="true">
                {item.lesson.emoji}
              </span>
              <div>
                <h2 className="training-lesson-title">{item.lesson.title}</h2>
                <p className="training-lesson-desc">{item.lesson.description}</p>
                <p className="training-lesson-hint"><i className="ti ti-bolt" aria-hidden="true" /> {item.lesson.practiceHint}</p>
              </div>
            </div>

            {item.completed ? (
              <div className="training-lesson-actions">
                <span className="training-lesson-done">✓ Session complete</span>
                <button
                  type="button"
                  className="training-lesson-reset tap-target"
                  onClick={() => onResetLesson(item.lessonId)}
                >
                  Undo
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="training-lesson-complete tap-target"
                onClick={() => handleComplete(item.lessonId, item.lesson.title)}
              >
                We nailed it! ⚡
              </button>
            )}
          </article>
        ))}
      </div>

      <div className="training-mission-section-head training-mission-section-head--reward">
        <span>Finish-line reward</span>
        <strong>{progress.rewardUnlocked ? 'Claimed by the pack' : 'Waiting at the finish'}</strong>
      </div>

      <div
        className={`training-reward-card detail-card-warm${progress.rewardUnlocked ? ' training-reward-card--unlocked' : ''}`}
      >
        <CardImage
          className="training-reward-badge"
          imageUrl={reward.badgeImageUrl}
          imageAlt=""
          imageTone="warm"
        />
        <div className="training-reward-copy">
          <div className="training-reward-emoji" aria-hidden="true">
            {reward.emoji}
          </div>
          <div className="training-reward-title">{reward.title}</div>
          <div className="training-reward-desc">{reward.description}</div>
          <div className="training-reward-status">
            {progress.rewardUnlocked
              ? `Unlocked${progress.rewardUnlockedAt ? ` · ${new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(Date.parse(progress.rewardUnlockedAt))}` : ''}`
              : `Complete all ${progress.lessonsTotal} sessions to unlock`}
          </div>
        </div>
      </div>
    </>
  )
}
