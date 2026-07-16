import { useState } from 'react'
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
import { downloadTrainingScheduleCalendar } from '../../lib/calendarExport'
import {
  DEFAULT_PUSH_PREFERENCES,
  enablePushNotifications,
} from '../../lib/pushNotifications'
import { getTrainingProgramById } from '../../data/training'

interface TrainingProgramFlowProps {
  state: AppState
  step: number
  draft: TrainingProgramDraft
  schedule: ActiveTrainingSchedule | null
  onBack: () => void
  onSelectProgram: (programId: string) => void
  onSelectCadence: (cadence: NonNullable<TrainingProgramDraft['cadence']>) => void
  onStartDateChange: (startDate: string) => void
  onStartTimeChange: (startTime: string) => void
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
  onStartDateChange,
  onStartTimeChange,
  onNext,
  onSave,
  onOpenLesson,
}: TrainingProgramFlowProps) {
  const [scheduleStatus, setScheduleStatus] = useState<string | null>(null)
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
              <div className="training-flow-kicker">Training adventure</div>
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
                      {draft.programId === program.id ? 'Adventure picked' : 'Pick'}
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
              <div className="training-schedule-fields detail-card-warm">
                <div className="training-schedule-prompt">
                  <i className="ti ti-calendar-heart" aria-hidden="true" />
                  <div>
                    <strong>Want this to actually happen?</strong>
                    <span>Add dates for calendar alerts. Optional, always.</span>
                  </div>
                </div>
                <label>
                  <span>Start date <em>Optional</em></span>
                  <input
                    type="date"
                    value={draft.startDate}
                    onChange={(event) => onStartDateChange(event.target.value)}
                    aria-label="Training start date"
                  />
                </label>
                <label>
                  <span>Training time <em>Optional</em></span>
                  <input
                    type="time"
                    value={draft.startTime}
                    onChange={(event) => onStartTimeChange(event.target.value)}
                    aria-label="Training time"
                  />
                </label>
                <p>If you add both, PawStreak can create calendar events with one-day and one-hour alerts. Nothing is added without your tap.</p>
              </div>
            </section>
          ) : null}

          {step === 3 && schedule ? (
            <section className="training-flow-step">
              <div className="training-flow-step-head training-flow-step-head--ready">
                <span>Adventure scheduled</span>
                <strong>{dogLabel}&apos;s training adventure is ready</strong>
              </div>
              <StaggeredProgressPath
                title="Training adventure path"
                subtitle="Short practice, real-world payoff, one honest win at a time."
                countLabel={`0/${schedule.sessions.length}`}
                className="training-session-path"
                items={schedule.sessions.map((session, index) => ({
                  id: `${session.dayLabel}-${session.lessonId}`,
                  eyebrow: session.dayLabel,
                  title: session.lessonTitle,
                  meta: session.completed ? 'Session complete' : index === 0 ? 'Up next' : 'Scheduled',
                  detail: session.scheduledFor
                    ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(session.scheduledFor))
                    : `Your next small win with ${dogLabel}.`,
                  state: session.completed ? 'complete' : index === 0 ? 'current' : 'locked',
                }))}
              />
              <button
                type="button"
                className="st-btn st-btn--primary tap-target build-month-start-first"
                onClick={() => onOpenLesson(schedule.programId)}
              >
                Preview first session
              </button>
              <div className="training-schedule-actions">
                <button
                  type="button"
                  className="st-btn st-btn--primary tap-target"
                  onClick={() => {
                    const hasScheduledSessions = schedule.sessions.some((session) => session.scheduledFor)
                    if (!hasScheduledSessions) {
                      onBack()
                      return
                    }
                    const program = getTrainingProgramById(schedule.programId)
                    const downloaded = downloadTrainingScheduleCalendar(
                      schedule,
                      program?.title ?? 'Training adventure',
                      dogLabel,
                    )
                    setScheduleStatus(downloaded
                      ? 'Calendar ready with alerts for every session.'
                      : 'Choose real dates and times before exporting.')
                  }}
                >
                  <i className="ti ti-calendar-plus" aria-hidden="true" />
                  {schedule.sessions.some((session) => session.scheduledFor)
                    ? 'Add every session to calendar'
                    : 'Add dates for calendar alerts'}
                </button>
                <button
                  type="button"
                  className="st-btn st-btn--ghost tap-target"
                  onClick={() => {
                    setScheduleStatus('Turning on daily adventure reminders…')
                    void enablePushNotifications(DEFAULT_PUSH_PREFERENCES)
                      .then(() => setScheduleStatus('Morning and evening adventure reminders are on.'))
                      .catch((error) => setScheduleStatus(
                        error instanceof Error ? error.message : 'Could not enable reminders.',
                      ))
                  }}
                >
                  <i className="ti ti-bell-ringing" aria-hidden="true" />
                  Turn on daily reminders
                </button>
              </div>
              {scheduleStatus ? <p className="training-schedule-status" role="status">{scheduleStatus}</p> : null}
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
                {step === 1 ? 'Choose this adventure' : 'Schedule my training adventure'}
              </button>
            ) : (
              <button type="button" className="st-btn st-btn--forest tap-target" onClick={onSave}>
                Save training adventure to Today
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
