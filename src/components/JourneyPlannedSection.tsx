import { useState } from 'react'
import type { AppState } from '../data/demo'
import { getPackLabelForDogIds } from '../lib/customAdventure'
import { downloadScheduledAdventureCalendar } from '../lib/calendarExport'
import {
  DEFAULT_PUSH_PREFERENCES,
  enablePushNotifications,
} from '../lib/pushNotifications'

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
  const [status, setStatus] = useState<string | null>(null)
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
              {planned.scheduledFor ? (
                <p className="journey-planned-card-date">
                  <i className="ti ti-calendar-event" aria-hidden="true" />
                  {new Intl.DateTimeFormat(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  }).format(new Date(planned.scheduledFor))}
                </p>
              ) : null}
              <p className="journey-planned-card-meta">
                {getPackLabelForDogIds(state.dogs, planned.selectedDogIds)}
              </p>
            </div>
            <div className="journey-planned-card-actions">
              {planned.scheduledFor ? (
                <button
                  type="button"
                  className="journey-planned-calendar tap-target"
                  onClick={() => {
                    const ok = downloadScheduledAdventureCalendar(
                      planned,
                      getPackLabelForDogIds(state.dogs, planned.selectedDogIds),
                    )
                    setStatus(ok
                      ? `${planned.title} calendar file ready with alerts.`
                      : 'Could not create that calendar event.')
                  }}
                >
                  <i className="ti ti-calendar-plus" aria-hidden="true" />
                  Calendar
                </button>
              ) : null}
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
      <div className="journey-planned-reminders">
        <button
          type="button"
          className="journey-planned-reminder tap-target"
          onClick={() => {
            setStatus('Turning on daily adventure reminders…')
            void enablePushNotifications(DEFAULT_PUSH_PREFERENCES)
              .then(() => setStatus('Morning and evening adventure reminders are on.'))
              .catch((error) => setStatus(
                error instanceof Error ? error.message : 'Could not enable reminders.',
              ))
          }}
        >
          <i className="ti ti-bell-ringing" aria-hidden="true" />
          Turn on daily adventure reminders
        </button>
        <p>
          Calendar alerts happen at the scheduled time. Daily reminders keep adventures from slipping away.
        </p>
        {status ? <div className="journey-planned-status" role="status">{status}</div> : null}
      </div>
    </section>
  )
}
