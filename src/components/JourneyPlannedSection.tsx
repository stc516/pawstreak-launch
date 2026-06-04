import type { AppState } from '../data/demo'
import { getPackLabelForDogIds } from '../lib/customAdventure'

interface JourneyPlannedSectionProps {
  state: AppState
  onStartPlanned: (id: string) => void
  onDeletePlanned: (id: string) => void
}

export function JourneyPlannedSection({
  state,
  onStartPlanned,
  onDeletePlanned,
}: JourneyPlannedSectionProps) {
  if (state.scheduledAdventures.length === 0) return null

  return (
    <section
      className="journey-planned detail-card-warm"
      aria-label="Planned adventures"
      data-testid="journey-planned-section"
    >
      <div className="journey-planned-header">
        <div className="journey-planned-kicker">Planned</div>
        <h2 className="journey-planned-title">Saved for later</h2>
        <p className="journey-planned-sub">
          Start when you are ready — no timer until you tap Start.
        </p>
      </div>

      <div className="journey-planned-list">
        {state.scheduledAdventures.map((planned) => (
          <article
            key={planned.id}
            className="journey-planned-card"
            data-testid={`journey-planned-card-${planned.id}`}
          >
            <div className="journey-planned-card-copy">
              <h3 className="journey-planned-card-title">{planned.title}</h3>
              {planned.locationLabel ? (
                <p className="journey-planned-card-location">{planned.locationLabel}</p>
              ) : null}
              <p className="journey-planned-card-meta">
                {getPackLabelForDogIds(state.dogs, planned.selectedDogIds)}
              </p>
            </div>
            <div className="journey-planned-card-actions">
              <button
                type="button"
                className="journey-planned-start tap-target"
                onClick={() => onStartPlanned(planned.id)}
                data-testid="journey-planned-start"
              >
                Start
              </button>
              <button
                type="button"
                className="journey-planned-delete tap-target"
                onClick={() => onDeletePlanned(planned.id)}
                aria-label={`Delete planned adventure ${planned.title}`}
              >
                <i className="ti ti-trash" aria-hidden="true" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
