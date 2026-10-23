import type { MapCenter } from '../lib/mapbox'
import type { Place } from '../types/place'
import { PlanMapView } from './PlanMapView'

interface PlanAdventureMapProps {
  places: Place[]
  selectedPlaceId: string | null
  mapCenter: MapCenter
  mapTitle: string
  mapSubtitle: string
  emptyTitle?: string
  emptyCopy?: string
  zipCode: string
  isFindingLocation?: boolean
  locationStatusMessage?: string | null
  locationStatusTone?: 'loading' | 'success' | 'fallback' | 'error'
  onSelectPlace: (placeId: string) => void
  onZipChange: (zipCode: string) => void
  onApplyLocation: () => void
}

export function PlanAdventureMap({
  places,
  selectedPlaceId,
  mapCenter,
  mapTitle,
  mapSubtitle,
  emptyTitle,
  emptyCopy,
  zipCode,
  isFindingLocation = false,
  locationStatusMessage,
  locationStatusTone = 'success',
  onSelectPlace,
  onZipChange,
  onApplyLocation,
}: PlanAdventureMapProps) {
  const selectedPlace = selectedPlaceId
    ? places.find((place) => place.id === selectedPlaceId)
    : null

  return (
    <section className="plan-map-card plan-map-card--adventure detail-card-warm" aria-label="Local map">
      <div className="plan-map-canvas plan-map-canvas--adventure plan-map-canvas--mapbox">
        <PlanMapView
          places={places}
          selectedPlaceId={selectedPlaceId}
          mapCenter={mapCenter}
          onSelectPlace={onSelectPlace}
          emptyTitle={emptyTitle}
          emptyCopy={emptyCopy}
        />

      </div>

        {selectedPlace ? (
          <div className="plan-selected-place detail-card-warm" aria-live="polite">
            <div className="plan-map-tooltip-kicker">{selectedPlace.category}</div>
            <div className="plan-map-tooltip-title">
              {selectedPlace.name}
            </div>
            <div className="plan-map-tooltip-meta">
              {selectedPlace.distanceLabel} · {selectedPlace.leashInfo}
            </div>
          </div>
        ) : null}
      <div className="plan-map-footer">
        <div>
          <div className="plan-map-title">{mapTitle}</div>
          <div className="plan-map-sub">{mapSubtitle}</div>
        </div>
        <div className="plan-map-zip">
          <input
            className="zip-input"
            type="text"
            inputMode="text"
            placeholder="City or ZIP"
            value={zipCode}
            onChange={(event) => onZipChange(event.target.value)}
          />
          <button
            type="button"
            className="zip-btn tap-target"
            onClick={onApplyLocation}
            disabled={isFindingLocation}
          >
            {isFindingLocation ? 'Finding…' : 'Find'}
          </button>
        </div>
      </div>
      {locationStatusMessage ? (
        <div
          className={`plan-location-status plan-location-status--${locationStatusTone}`}
          role="status"
        >
          {locationStatusMessage}
        </div>
      ) : null}
    </section>
  )
}
