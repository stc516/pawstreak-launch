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
  onSelectOptimize: (optimizeId: string) => void
  onSelectTime: (timeId: string) => void
  onToggleLove: (loveId: string) => void
  onNext: () => void
  onFinish: () => void
}

const STEP_TITLES = [
  'What are we optimizing for?',
  'How much time do you realistically have?',
  `What does ${''}love most?`,
]

export function CuratedPlanFlow({
  state,
  step,
  draft,
  result,
  onBack,
  onSelectOptimize,
  onSelectTime,
  onToggleLove,
  onNext,
  onFinish,
}: CuratedPlanFlowProps) {
  const dogLabel = dogNamesLabel(state.dogs)
  const canContinue =
    (step === 1 && draft.optimizeId) ||
    (step === 2 && draft.timeId) ||
    (step === 3 && draft.loveIds.length > 0)

  return (
    <div className="app-viewport">
      <div className="app-shell">
        <StatusBar />
        <main className="scroll scroll--overlay">
          <div className="overlay-topbar">
            <button type="button" className="overlay-back" onClick={onBack}>
              <i className="ti ti-arrow-left" aria-hidden="true" />
              {step === 4 ? 'Done' : 'Back'}
            </button>
            {step < 4 ? (
              <div className="curated-step">Step {step} of 3</div>
            ) : null}
          </div>

          {step === 4 && result ? (
            <>
              <div className="curated-result-badge">Your plan</div>
              <h1 className="curated-result-title">{result.title}</h1>
              <p className="curated-result-copy">{result.emotionalCopy}</p>

              <div className="curated-result-block">
                <div className="curated-result-label">Weekly cadence</div>
                <div className="curated-result-value">{result.weeklyCadence}</div>
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

              <button type="button" className="curated-finish-btn" onClick={onFinish}>
                Save plan & return
              </button>
            </>
          ) : (
            <>
              <div className="curated-intro">Curated for your dogs</div>
              <h1 className="curated-step-title">
                {step === 3
                  ? `What does ${dogLabel} love most?`
                  : STEP_TITLES[step - 1]}
              </h1>
              <p className="curated-step-sub">
                {step === 1
                  ? 'We will shape adventures around what matters most right now.'
                  : step === 2
                    ? 'Honest time beats perfect plans — we will meet you where you are.'
                    : 'Pick everything that makes their tails go.'}
              </p>

              <div className="curated-options">
                {(step === 1
                  ? CURATED_OPTIMIZE_OPTIONS
                  : step === 2
                    ? CURATED_TIME_OPTIONS
                    : CURATED_LOVE_OPTIONS
                ).map((option) => {
                  const selected =
                    step === 1
                      ? draft.optimizeId === option.id
                      : step === 2
                        ? draft.timeId === option.id
                        : draft.loveIds.includes(option.id)

                  return (
                    <button
                      key={option.id}
                      type="button"
                      className={`curated-option${selected ? ' on' : ''}`}
                      onClick={() => {
                        if (step === 1) onSelectOptimize(option.id)
                        else if (step === 2) onSelectTime(option.id)
                        else onToggleLove(option.id)
                      }}
                    >
                      <span className="curated-option-emoji">{option.emoji}</span>
                      <span>{option.label}</span>
                    </button>
                  )
                })}
              </div>

              <button
                type="button"
                className="curated-next-btn"
                disabled={!canContinue}
                onClick={onNext}
              >
                {step === 3 ? 'Generate our plan' : 'Continue'}
              </button>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
