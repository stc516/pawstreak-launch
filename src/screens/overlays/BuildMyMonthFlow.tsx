import type { AppState } from '../../data/demo'
import { getDisplayDogLabel } from '../../lib/profileDisplay'
import {
  MONTHLY_PLAN_DAY_OPTIONS,
  MONTHLY_PLAN_FREQUENCY_OPTIONS,
  MONTHLY_PLAN_VIBE_OPTIONS,
  type MonthlyPlanDraft,
  type MonthlyPlanResult,
} from '../../lib/monthlyPlan'
import { StatusBar } from '../../components/StatusBar'

interface BuildMyMonthFlowProps {
  state: AppState
  step: number
  draft: MonthlyPlanDraft
  result: MonthlyPlanResult | null
  onBack: () => void
  onSelectVibe: (vibeId: MonthlyPlanDraft['vibeId']) => void
  onToggleCategory: (categoryId: string) => void
  onSelectFrequency: (frequency: NonNullable<MonthlyPlanDraft['frequencyPerWeek']>) => void
  onSelectDays: (dayPreference: NonNullable<MonthlyPlanDraft['dayPreference']>) => void
  onNext: () => void
  onSave: () => void
  onStartFirstAdventure: (placeId: string) => void
}

export function BuildMyMonthFlow({
  state,
  step,
  draft,
  result,
  onBack,
  onSelectVibe,
  onToggleCategory,
  onSelectFrequency,
  onSelectDays,
  onNext,
  onSave,
  onStartFirstAdventure,
}: BuildMyMonthFlowProps) {
  const dogLabel = getDisplayDogLabel(state)
  const canContinue =
    (step === 1 && draft.categoryIds.length > 0) ||
    (step === 2 && draft.frequencyPerWeek) ||
    (step === 3 && draft.dayPreference) ||
    step === 4

  const categoryOptions = state.planCategories.filter((category) =>
    ['beach', 'trail', 'coffee', 'dog-park', 'park', 'road-trip'].includes(category.id),
  )

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

          <div className="build-month-hero detail-tint detail-tint--warm">
            <div className="build-month-kicker">Build My Month</div>
            <h1 className="build-month-title">A simple month of adventures for {dogLabel}</h1>
            <p className="build-month-copy">
              Plan outings, training goals, and reminder paths from one system.
            </p>
          </div>

          {step === 1 ? (
            <section className="build-month-step">
              <div className="sec">Choose 3–4 preferred categories</div>
              <div className="build-month-options">
                {categoryOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`build-month-option tap-target${draft.categoryIds.includes(option.id) ? ' on' : ''}`}
                    onClick={() => onToggleCategory(option.id)}
                  >
                    <div className="build-month-option-title">{option.label}</div>
                    <div className="build-month-option-sub">
                      {draft.categoryIds.includes(option.id) ? 'Included' : 'Tap to include'}
                    </div>
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          {step === 2 ? (
            <section className="build-month-step">
              <div className="sec">How often?</div>
              <div className="build-month-options">
                {MONTHLY_PLAN_FREQUENCY_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`build-month-option tap-target${draft.frequencyPerWeek === option.id ? ' on' : ''}`}
                    onClick={() => onSelectFrequency(option.id)}
                  >
                    <div className="build-month-option-title">{option.label}</div>
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          {step === 3 ? (
            <section className="build-month-step">
              <div className="sec">Timing and vibe</div>
              <div className="build-month-options">
                {MONTHLY_PLAN_DAY_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`build-month-option tap-target${draft.dayPreference === option.id ? ' on' : ''}`}
                    onClick={() => onSelectDays(option.id)}
                  >
                    <div className="build-month-option-title">{option.label}</div>
                  </button>
                ))}
                {MONTHLY_PLAN_VIBE_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`build-month-option tap-target${draft.vibeId === option.id ? ' on' : ''}`}
                    onClick={() => onSelectVibe(option.id)}
                  >
                    <div className="build-month-option-title">{option.label}</div>
                    <div className="build-month-option-sub">{option.subtitle}</div>
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          {step === 4 && result ? (
            <section className="build-month-step">
              <div className="sec">Your month</div>
              <div className="build-month-result detail-card-warm">
                {result.weeks.map((week) => (
                  <div key={week.weekIndex} className="build-month-week-row">
                    <div className="build-month-week-label">{week.label}</div>
                    <div className="build-month-week-place">{week.placeName}</div>
                    <div className="build-month-week-meta">
                      {week.category} · best time and reminders path included
                    </div>
                  </div>
                ))}
              </div>
              <div className="build-month-result detail-card-warm">
                Potential unlocks: First Adventure, Explorer, Week Streak, and matching challenges.
              </div>
              <button
                type="button"
                className="st-btn st-btn--primary tap-target build-month-start-first"
                onClick={() => onStartFirstAdventure(result.nextPlaceId)}
              >
                Start first adventure
              </button>
            </section>
          ) : null}

          <div className="build-month-footer">
            {step < 4 ? (
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
                Save plan
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
