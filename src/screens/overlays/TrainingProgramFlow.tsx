import type { AppState } from '../../data/demo'
import { getDisplayDogLabel, getProfileDogs } from '../../lib/profileDisplay'
import {
  TRAINING_CADENCE_OPTIONS,
  getHomeTrainingPrograms,
  type ActiveTrainingSchedule,
  type TrainingProgramDraft,
} from '../../lib/trainingSchedule'
import { StatusBar } from '../../components/StatusBar'
import { StaggeredProgressPath } from '../../components/StaggeredProgressPath'

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
  const leadDog = getProfileDogs(state)[0]
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

          <div className="training-flow-hero training-flow-hero--electric">
            <div className="training-flow-hero-copy">
              <div className="training-flow-kicker">Skill quest</div>
              <h1 className="training-flow-title">Turn {dogLabel}&apos;s chaos into a superpower.</h1>
              <p className="training-flow-copy">Tiny real sessions. Big adventure energy.</p>
            </div>
            {leadDog ? (
              <div className="training-flow-dog" aria-label={`${leadDog.name} is ready to train`}>
                <span className="training-flow-dog-orbit" aria-hidden="true" />
                <span className="training-flow-dog-portrait">
                  {leadDog.photoUrl ? <img src={leadDog.photoUrl} alt="" /> : <span aria-hidden="true">{leadDog.profileEmoji}</span>}
                </span>
                <span className="training-flow-dog-zap" aria-hidden="true">⚡</span>
              </div>
            ) : null}
          </div>

          {step === 1 ? (
            <section className="training-flow-step">
              <div className="training-flow-step-head">
                <span>1 of 3</span>
                <strong>Choose your next superpower</strong>
              </div>
              <div className="training-flow-programs">
                {programs.map((program) => (
                  <button
                    key={program.id}
                    type="button"
                    className={`training-flow-program training-flow-program--${program.accent} tap-target${draft.programId === program.id ? ' on' : ''}`}
                    onClick={() => onSelectProgram(program.id)}
                  >
                    <div className="training-flow-program-emoji" aria-hidden="true">
                      <span>{program.emoji}</span>
                    </div>
                    <div>
                      <div className="training-flow-program-title">{program.title}</div>
                      <div className="training-flow-program-sub">{program.subtitle}</div>
                    </div>
                    <span className="training-flow-program-pick">
                      {draft.programId === program.id ? 'Quest picked' : 'Pick'}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          {step === 2 ? (
            <section className="training-flow-step">
              <div className="training-flow-step-head">
                <span>2 of 3</span>
                <strong>Pick your training rhythm</strong>
              </div>
              <div className="build-month-options">
                {TRAINING_CADENCE_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`build-month-option tap-target${draft.cadence === option.id ? ' on' : ''}`}
                    onClick={() => onSelectCadence(option.id)}
                  >
                    <div className="build-month-option-title">{option.label}</div>
                    <div className="build-month-option-sub">
                      {option.id === 'daily' ? 'Fast momentum · one small win each day' : 'Breathing room · practice on Mon, Tue, Thu, and Sat'}
                    </div>
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          {step === 3 && schedule ? (
            <section className="training-flow-step">
              <div className="training-flow-step-head training-flow-step-head--ready">
                <span>Quest loaded</span>
                <strong>{dogLabel}&apos;s mission path is ready</strong>
              </div>
              <StaggeredProgressPath
                title="Superpower mission path"
                subtitle="Short practice, real-world payoff, one honest win at a time."
                countLabel={`0/${schedule.sessions.length}`}
                className="training-session-path"
                items={schedule.sessions.map((session, index) => ({
                  id: `${session.dayLabel}-${session.lessonId}`,
                  eyebrow: session.dayLabel,
                  title: session.lessonTitle,
                  meta: session.completed ? 'Mission crushed' : index === 0 ? 'Up next' : 'Ready when you are',
                  detail: index === 0 ? `Your next tiny win with ${dogLabel}.` : 'Unlocks after the mission before it.',
                  state: session.completed ? 'complete' : index === 0 ? 'current' : 'locked',
                }))}
              />
              <button
                type="button"
                className="st-btn st-btn--primary tap-target build-month-start-first"
                onClick={() => onOpenLesson(schedule.programId)}
              >
                Preview first mission
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
                {step === 1 ? 'Choose this quest' : 'Build my mission path'}
              </button>
            ) : (
              <button type="button" className="st-btn st-btn--forest tap-target" onClick={onSave}>
                Save quest to Today
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
