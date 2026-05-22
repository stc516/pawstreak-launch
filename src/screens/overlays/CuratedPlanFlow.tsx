import type { AppState } from '../../data/demo'
import { dogNamesLabel } from '../../data/demo'
import {
  CURATED_LOVE_OPTIONS,
  CURATED_OPTIMIZE_OPTIONS,
  CURATED_TIME_OPTIONS,
} from '../../data/curatedPlanOptions'
import type { CuratedPlanDraft, CuratedPlanResult } from '../../lib/curatedPlan'
import { StatusBar } from '../../components/StatusBar'

interface CuratedPlanFlowProps {
  state: AppState
  step: number
  draft: CuratedPlanDraft
  result: CuratedPlanResult | null
  onBack: () => void
  onToggleOptimize: (optimizeId: string) => void
  onSelectTime: (timeId: string) => void
  onToggleLove: (loveId: string) => void
  onNext: () => void
  onFinish: () => void
  onStartWeek: () => void
}

const STEP_TITLES = [
  'What are we optimizing for?',
  'How much time do you realistically have?',
]

function getStepSubtitle(step: number): string {
  if (step === 1) {
    return 'We will shape adventures around what matters most right now.'
  }
  if (step === 2) {
    return 'Honest time beats perfect plans — we will meet you where you are.'
  }
  return 'Pick everything that makes their tails go.'
}

function getStepEncouragement(step: number): string {
  if (step === 1) return 'Pick everything that matters — you can choose more than one.'
  if (step === 2) return 'You are doing great. Almost there.'
  return 'The more you pick, the more personal their plan feels.'
}

function getFooterHint(
  step: number,
  canContinue: boolean,
  optimizeCount: number,
  loveCount: number,
): string {
  if (step === 4) {
    return 'Save this plan to keep it on your monthly setup.'
  }
  if (canContinue) {
    if (step === 1) {
      return `${optimizeCount} selected · ready to continue`
    }
    if (step === 3) {
      return `${loveCount} selected · ready to build their plan`
    }
    return 'Looks good — tap below to continue'
  }
  if (step === 1) return 'Pick at least one goal above to continue'
  if (step === 2) return 'Pick the time you can realistically give'
  return 'Pick at least one thing they love'
}

function getCtaLabel(step: number, dogLabel: string): string {
  if (step === 1 || step === 2) return 'Continue'
  if (step === 3) return `Build ${dogLabel}'s plan`
  return 'Save plan'
}

export function CuratedPlanFlow({
  state,
  step,
  draft,
  result,
  onBack,
  onToggleOptimize,
  onSelectTime,
  onToggleLove,
  onNext,
  onFinish,
  onStartWeek,
}: CuratedPlanFlowProps) {
  const dogLabel = dogNamesLabel(state.dogs)
  const canContinue =
    (step === 1 && draft.optimizeIds.length > 0) ||
    (step === 2 && Boolean(draft.timeId)) ||
    (step === 3 && draft.loveIds.length > 0) ||
    step === 4

  const progressPercent = step >= 4 ? 100 : Math.round((step / 3) * 100)
  const footerHint = getFooterHint(
    step,
    canContinue,
    draft.optimizeIds.length,
    draft.loveIds.length,
  )
  const ctaLabel = getCtaLabel(step, dogLabel)

  const handleCtaClick = () => {
    if (step === 4) {
      onFinish()
      return
    }
    if (canContinue) {
      onNext()
    }
  }

  return (
    <div className="app-viewport">
      <div className="app-shell app-shell--curated">
        <StatusBar />
        <main className="scroll scroll--overlay scroll--curated">
          <div className="overlay-topbar">
            <button type="button" className="overlay-back" onClick={onBack}>
              <i className="ti ti-arrow-left" aria-hidden="true" />
              {step === 4 ? 'Done' : 'Back'}
            </button>
            {step < 4 ? (
              <div className="curated-step">Step {step} of 3</div>
            ) : (
              <div className="curated-step curated-step--done">Plan ready</div>
            )}
          </div>

          {step < 4 ? (
            <div
              className="curated-progress-track"
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Step ${step} of 3`}
            >
              <div
                className="curated-progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          ) : null}

          {step === 4 && result ? (
            <>
              <div className="curated-result-badge">Your plan</div>
              <h1 className="curated-result-title">{result.planName}</h1>
              <p className="curated-result-copy detail-quote-block detail-quote-block--compact">
                <span className="detail-quote-text">{result.emotionalCopy}</span>
              </p>

              <div className="curated-result-block curated-result-block--why detail-card-warm">
                <div className="curated-result-label">Built around</div>
                <div className="curated-result-value">{result.goalSummary}</div>
              </div>

              <div className="curated-result-block detail-card-warm">
                <div className="curated-result-label">Why this fits {dogLabel}</div>
                <div className="curated-result-value">{result.whyItFits}</div>
              </div>

              <div className="curated-result-block detail-card-warm">
                <div className="curated-result-label">Weekly cadence</div>
                <div className="curated-result-value">{result.weeklyCadence}</div>
              </div>

              <div className="sec">This week at a glance</div>
              <div className="curated-schedule">
                {result.weeklySchedule.map((item) => (
                  <div key={`${item.day}-${item.focus}`} className="curated-schedule-row">
                    <div className="curated-schedule-day">{item.day}</div>
                    <div>
                      <div className="curated-schedule-focus">{item.focus}</div>
                      <div className="curated-schedule-type">{item.type}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="sec">Recommended first adventure</div>
              <div className="curated-first-adv">
                <div className="curated-first-name">{result.firstAdventure.name}</div>
                <div className="curated-first-when">{result.firstAdventure.when}</div>
                <div className="curated-first-reason">{result.firstAdventure.reason}</div>
                <button
                  type="button"
                  className="curated-start-week tap-target"
                  onClick={onStartWeek}
                >
                  Start this week
                </button>
              </div>

              <div className="sec">Training & activity balance</div>
              <div className="curated-balance">
                {result.balance.map((item) => (
                  <div key={item.id} className="curated-balance-row">
                    <div className="curated-balance-label">{item.label}</div>
                    <div className="curated-balance-track">
                      <div
                        className="curated-balance-fill"
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                    <div className="curated-balance-pct">{item.percent}%</div>
                  </div>
                ))}
              </div>

              <div className="sec">Suggested adventure types</div>
              <div className="curated-tags">
                {result.adventureTypes.map((type) => (
                  <span key={type} className="rc on curated-tag">
                    {type}
                  </span>
                ))}
              </div>

              <div className="sec">Monthly goals</div>
              <ul className="curated-goals">
                {result.monthlyGoals.map((goal) => (
                  <li key={goal}>{goal}</li>
                ))}
              </ul>

              <div className="sec">Recommended spots</div>
              {result.recommendedSpots.map((spot) => (
                <div key={spot.name} className="curated-spot">
                  <div className="curated-spot-name">{spot.name}</div>
                  <div className="curated-spot-reason">{spot.reason}</div>
                </div>
              ))}
            </>
          ) : (
            <>
              <div className="curated-intro">Curated for your dogs</div>
              <h1 className="curated-step-title">
                {step === 3
                  ? `What does ${dogLabel} love most?`
                  : STEP_TITLES[step - 1]}
              </h1>
              <p className="curated-step-sub">{getStepSubtitle(step)}</p>
              <p className="curated-step-encourage">{getStepEncouragement(step)}</p>

              <div className="curated-options">
                {(step === 1
                  ? CURATED_OPTIMIZE_OPTIONS
                  : step === 2
                    ? CURATED_TIME_OPTIONS
                    : CURATED_LOVE_OPTIONS
                ).map((option) => {
                  const selected =
                    step === 1
                      ? draft.optimizeIds.includes(option.id)
                      : step === 2
                        ? draft.timeId === option.id
                        : draft.loveIds.includes(option.id)

                  return (
                    <button
                      key={option.id}
                      type="button"
                      className={`curated-option tap-target${selected ? ' on' : ''}`}
                      aria-pressed={selected}
                      onClick={() => {
                        if (step === 1) onToggleOptimize(option.id)
                        else if (step === 2) onSelectTime(option.id)
                        else onToggleLove(option.id)
                      }}
                    >
                      <span className="curated-option-emoji">{option.emoji}</span>
                      <span className="curated-option-label">{option.label}</span>
                      {selected ? (
                        <i
                          className="ti ti-check curated-option-check"
                          aria-hidden="true"
                        />
                      ) : null}
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </main>

        <div className="curated-footer">
          {step < 4 ? (
            <div className="curated-footer-progress">
              <span>Step {step} of 3</span>
              <span className="curated-footer-dots" aria-hidden="true">
                {[1, 2, 3].map((dot) => (
                  <span
                    key={dot}
                    className={`curated-footer-dot${dot <= step ? ' on' : ''}`}
                  />
                ))}
              </span>
            </div>
          ) : null}
          <p className="curated-footer-hint">{footerHint}</p>
          <button
            type="button"
            className="curated-next-btn tap-target"
            disabled={!canContinue}
            onClick={handleCtaClick}
          >
            {ctaLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
