import { useMemo, useState } from 'react'
import type { AppState } from '../../data/demo'
import {
  buildJourneyMapPins,
  filterJourneyMapPins,
  type JourneyMapFilterId,
} from '../../data/journeyMapPins'
import { getJourneyMapStats } from '../../lib/journeyMapStats'
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
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null)
  const allPins = buildJourneyMapPins(state.journeyEntries)
  const pins = filterJourneyMapPins(allPins, filterId)
  const stats = getJourneyMapStats(state)

  const selectedPreview = useMemo(() => {
    if (!selectedPinId) return null
    const pin = pins.find((item) => item.id === selectedPinId)
    if (!pin) return null

    const entry = state.journeyEntries.find((item) => item.id === pin.entryId)
    if (!entry) return null

    return {
      entryId: entry.id,
      place: entry.place,
      date: entry.date,
      magicLine: entry.magicLine ?? 'A day worth remembering.',
    }
  }, [pins, selectedPinId, state.journeyEntries])

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

          {stats.isEmpty ? (
            <div className="jmap-overlay-stats jmap-overlay-stats--empty detail-card-warm">
              <div className="jmap-overlay-empty-title">Your map is waiting</div>
              <div className="jmap-overlay-empty-copy">
                Your map starts with your first saved adventure.
              </div>
            </div>
          ) : (
            <div className="jmap-overlay-stats detail-card-warm">
              <div className="jmap-overlay-stat">
                <div className="jmap-overlay-stat-value">{stats.adventures}</div>
                <div className="jmap-overlay-stat-label">adventures saved</div>
              </div>
              <div className="jmap-overlay-stat">
                <div className="jmap-overlay-stat-value">{stats.places}</div>
                <div className="jmap-overlay-stat-label">places discovered</div>
              </div>
            </div>
          )}

          <div className="jmap-overlay-filters">
            {MAP_FILTERS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                className={`jf tap-target${filterId === filter.id ? ' on' : ''}`}
                onClick={() => {
                  setFilterId(filter.id)
                  setSelectedPinId(null)
                }}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="jmap-overlay-panel">
            {pins.length === 0 ? (
              <div className="jmap-overlay-empty-list detail-card-warm">
                {allPins.length === 0
                  ? 'Your map starts with your first saved adventure.'
                  : 'No saved adventures match this filter yet.'}
              </div>
            ) : (
              <div className="jmap-overlay-panel-grid">
                {pins.map((pin) => (
                  <button
                    key={pin.id}
                    id={pin.id}
                    type="button"
                    className={`jmap-overlay-pin tap-target${selectedPinId === pin.id ? ' jmap-overlay-pin--selected' : ''}`}
                    style={{ top: pin.top, left: pin.left }}
                    onClick={() => setSelectedPinId(pin.id)}
                  >
                    <span className="jmap-overlay-pin-dot" />
                    <span className="jmap-overlay-pin-label">{pin.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedPreview ? (
            <div className="jmap-pin-preview detail-card-warm">
              <div className="jmap-pin-preview-kicker">Pinned memory</div>
              <div className="jmap-pin-preview-place">{selectedPreview.place}</div>
              <div className="jmap-pin-preview-date">{selectedPreview.date}</div>
              <div className="jmap-pin-preview-line">{selectedPreview.magicLine}</div>
              <button
                type="button"
                className="jmap-pin-preview-cta tap-target"
                onClick={() => onOpenMemory(selectedPreview.entryId)}
              >
                Open memory
              </button>
            </div>
          ) : null}

          <div className="sec sec--warm">Mapped memories</div>
          <div className="jmap-overlay-list">
            {state.journeyEntries.length === 0 ? (
              <div className="jmap-overlay-empty-list detail-card-warm">
                Your map starts with your first saved adventure.
              </div>
            ) : (
              state.journeyEntries.slice(0, 4).map((entry) => {
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
              })
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
