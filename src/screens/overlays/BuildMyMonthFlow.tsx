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
import { StaggeredProgressPath } from '../../components/StaggeredProgressPath'
import { getPlaceById } from '../../data/places'
import { getAdventureDisplayImageUrl } from '../../lib/adventureDisplayImage'

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
              <div className="build-month-preview-note detail-card-warm">
                Preview: PawStreak will turn these choices into planned outings with dates,
                places or generic ideas, best times, and achievement/challenge tie-ins.
              </div>
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
              <StaggeredProgressPath
                title="Planned outing path"
                subtitle="Future outings with timing, place details, and progress tie-ins."
                countLabel={`0/${result.weeks.length}`}
                className="build-month-path"
                items={result.weeks.map((week, index) => {
                  const place = getPlaceById(week.placeId)

                  return {
                    id: `${week.weekIndex}-${week.placeId}`,
                    eyebrow: week.label,
                    title: week.placeName,
                    meta: `${week.timingLabel} · ${week.category}`,
                    detail: [
                      week.addressLabel ? `Address: ${week.addressLabel}` : null,
                      `Best time: ${week.bestTime}`,
                      `Helps with: ${week.tieInLabel}`,
                    ].filter(Boolean).join(' · '),
                    imageUrl: place ? getAdventureDisplayImageUrl([], place) : undefined,
                    imageAlt: place?.imageAlt ?? week.placeName,
                    state: index === 0 ? 'current' : 'locked',
                  }
                })}
              />
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
