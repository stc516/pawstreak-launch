import { useState } from 'react'
import type { AppState } from '../../data/demo'
import {
  buildJourneyMapPins,
  filterJourneyMapPins,
  type JourneyMapFilterId,
} from '../../data/journeyMapPins'
import { getPlaceById } from '../../data/places'
import { StatusBar } from '../../components/StatusBar'

const MAP_FILTERS: { id: JourneyMapFilterId; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'beach', label: 'Beach' },
  { id: 'trail', label: 'Trail' },
  { id: 'road-trips', label: 'Road trips' },
  { id: 'parks', label: 'Parks' },
  { id: 'cafes', label: 'Cafes' },
]

interface JourneyMapViewProps {
  state: AppState
  onBack: () => void
  onOpenMemory: (entryId: string) => void
}

export function JourneyMapView({ state, onBack, onOpenMemory }: JourneyMapViewProps) {
  const [filterId, setFilterId] = useState<JourneyMapFilterId>('all')
  const pins = filterJourneyMapPins(buildJourneyMapPins(state.journeyEntries), filterId)

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

          <div className="jmap-overlay-hero detail-tint detail-tint--warm">
            <div className="jmap-overlay-kicker">Your adventure map</div>
            <h1 className="jmap-overlay-title">Every pin is a day you gave them.</h1>
            <p className="jmap-overlay-copy">
              Your dog&apos;s life map is being built — one outing at a time.
            </p>
          </div>

          <div className="jmap-overlay-stats detail-card-warm">
            <div className="jmap-overlay-stat">
              <div className="jmap-overlay-stat-value">{state.adventureCount}</div>
              <div className="jmap-overlay-stat-label">adventures saved</div>
            </div>
            <div className="jmap-overlay-stat">
              <div className="jmap-overlay-stat-value">{state.placeCount}</div>
              <div className="jmap-overlay-stat-label">places discovered</div>
            </div>
          </div>

          <div className="jmap-overlay-filters">
            {MAP_FILTERS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                className={`jf tap-target${filterId === filter.id ? ' on' : ''}`}
                onClick={() => setFilterId(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="jmap-overlay-panel detail-card-warm">
            <div className="jmap-overlay-panel-grid" aria-hidden="true">
              {pins.map((pin) => (
                <button
                  key={pin.id}
                  type="button"
                  className="jmap-overlay-pin tap-target"
                  style={{ top: pin.top, left: pin.left }}
                  onClick={() => {
                    if (pin.entryId) onOpenMemory(pin.entryId)
                  }}
                >
                  <span className="jmap-overlay-pin-dot" />
                  <span className="jmap-overlay-pin-label">{pin.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="sec">Mapped memories</div>
          <div className="jmap-overlay-list">
            {state.journeyEntries.slice(0, 4).map((entry) => {
              const place = entry.placeId ? getPlaceById(entry.placeId) : undefined
              return (
                <button
                  key={entry.id}
                  type="button"
                  className="jmap-overlay-memory tap-target detail-card-warm"
                  onClick={() => onOpenMemory(entry.id)}
                >
                  <div className="jmap-overlay-memory-place">{entry.place}</div>
                  <div className="jmap-overlay-memory-meta">
                    {entry.date}
                    {place ? ` · ${place.category}` : ''}
                  </div>
                </button>
              )
            })}
          </div>
        </main>
      </div>
    </div>
  )
}
