import type { AppState } from '../../data/demo'
import { getDisplayDogLabel } from '../../lib/profileDisplay'
import {
  TRAINING_CADENCE_OPTIONS,
  getHomeTrainingPrograms,
  type ActiveTrainingSchedule,
  type TrainingProgramDraft,
} from '../../lib/trainingSchedule'
import { StatusBar } from '../../components/StatusBar'

interface TrainingProgramFlowProps {
  state: AppState
  step: number
  draft: TrainingProgramDraft
  schedule: ActiveTrainingSchedule | null
  onBack: () => void
  onSelectProgram: (programId: string) => void
  onSelectCadence: (cadence: NonNullable<TrainingProgramDraft['cadence']>) => void
  onNext: () => void
  onSave: () => void
  onOpenLesson: (programId: string) => void
}

export function TrainingProgramFlow({
  state,
  step,
  draft,
  schedule,
  onBack,
  onSelectProgram,
  onSelectCadence,
  onNext,
  onSave,
  onOpenLesson,
}: TrainingProgramFlowProps) {
  const dogLabel = getDisplayDogLabel(state)
  const programs = getHomeTrainingPrograms()
  const canContinue =
    (step === 1 && draft.programId) ||
    (step === 2 && draft.cadence) ||
    step === 3

  return (
    <div className="app-viewport">
      <div className="app-shell">
        <StatusBar />
        <main className="scroll scroll--overlay">
          <div className="overlay-topbar">
            <button type="button" className="overlay-back tap-target" onClick={onBack}>
              <i className="ti ti-arrow-left" aria-hidden="true" />
              Back
            </button>
          </div>

          <div className="training-flow-hero detail-tint detail-tint--warm">
            <div className="training-flow-kicker">Training Program</div>
            <h1 className="training-flow-title">Simple practice for {dogLabel}</h1>
            <p className="training-flow-copy">Only real completed sessions count toward progress.</p>
          </div>

          {step === 1 ? (
            <section className="training-flow-step">
              <div className="sec">Pick a program</div>
              <div className="training-flow-programs">
                {programs.map((program) => (
                  <button
                    key={program.id}
                    type="button"
                    className={`training-flow-program tap-target${draft.programId === program.id ? ' on' : ''}`}
                    onClick={() => onSelectProgram(program.id)}
                  >
                    <div className="training-flow-program-emoji" aria-hidden="true">
                      {program.emoji}
                    </div>
                    <div>
                      <div className="training-flow-program-title">{program.title}</div>
                      <div className="training-flow-program-sub">{program.subtitle}</div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          {step === 2 ? (
            <section className="training-flow-step">
              <div className="sec">How often?</div>
              <div className="build-month-options">
                {TRAINING_CADENCE_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`build-month-option tap-target${draft.cadence === option.id ? ' on' : ''}`}
                    onClick={() => onSelectCadence(option.id)}
                  >
                    <div className="build-month-option-title">{option.label}</div>
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          {step === 3 && schedule ? (
            <section className="training-flow-step">
              <div className="sec">Your schedule</div>
              <div className="build-month-result detail-card-warm">
                {schedule.sessions.map((session) => (
                  <div key={`${session.dayLabel}-${session.lessonId}`} className="build-month-week-row">
                    <div className="build-month-week-label">{session.dayLabel}</div>
                    <div className="build-month-week-place">{session.lessonTitle}</div>
                    <div className="build-month-week-meta">
                      {session.completed ? 'Completed' : 'Up next'}
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="st-btn st-btn--primary tap-target build-month-start-first"
                onClick={() => onOpenLesson(schedule.programId)}
              >
                Start today&apos;s lesson
              </button>
            </section>
          ) : null}

          <div className="build-month-footer">
            {step < 3 ? (
              <button
                type="button"
                className="st-btn st-btn--primary tap-target"
                disabled={!canContinue}
                onClick={onNext}
              >
                Continue
              </button>
            ) : (
              <button type="button" className="st-btn st-btn--forest tap-target" onClick={onSave}>
                Save program
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
