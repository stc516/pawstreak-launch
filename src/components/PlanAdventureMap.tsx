import { useMemo } from 'react'
import type { CSSProperties } from 'react'
import type { Place } from '../types/place'
import { layoutPlanMapPins, shortPlaceMapLabel } from '../lib/planMap'

interface PlanAdventureMapProps {
  places: Place[]
  selectedPlaceId: string | null
  mapTitle: string
  mapSubtitle: string
  zipCode: string
  onSelectPlace: (placeId: string) => void
  onZipChange: (zipCode: string) => void
  onApplyLocation: () => void
}

export function PlanAdventureMap({
  places,
  selectedPlaceId,
  mapTitle,
  mapSubtitle,
  zipCode,
  onSelectPlace,
  onZipChange,
  onApplyLocation,
}: PlanAdventureMapProps) {
  const pins = useMemo(() => layoutPlanMapPins(places), [places])
  const placeById = useMemo(
    () => Object.fromEntries(places.map((place) => [place.id, place])),
    [places],
  )
  const selectedPlace = selectedPlaceId ? placeById[selectedPlaceId] : null

  return (
    <section className="plan-map-card plan-map-card--adventure detail-card-warm" aria-label="Local map">
      <div className="plan-map-canvas plan-map-canvas--adventure">
        <div className="plan-map-terrain" aria-hidden="true">
          <div className="plan-map-coast" />
          <div className="plan-map-hills" />
          <div className="plan-map-road plan-map-road--north" />
          <div className="plan-map-road plan-map-road--east" />
          <div className="plan-map-road plan-map-road--south" />
        </div>

        {pins.map((pin, index) => {
          const place = placeById[pin.placeId]
          if (!place) return null
          const isSelected = selectedPlaceId === pin.placeId

          return (
            <button
              key={pin.placeId}
              type="button"
              className={`plan-map-pin plan-map-pin--adventure tap-target${isSelected ? ' on' : ''}`}
              style={
                {
                  left: pin.left,
                  top: pin.top,
                  '--pin-delay': `${index * 0.35}s`,
                } as CSSProperties
              }
              aria-pressed={isSelected}
              aria-label={place.name}
              onClick={() => onSelectPlace(pin.placeId)}
            >
              <span className="plan-map-pin-pulse" aria-hidden="true" />
              <span className="plan-map-pin-dot plan-map-pin-dot--adventure" aria-hidden="true" />
              <span className="plan-map-pin-label">{shortPlaceMapLabel(place.name)}</span>
            </button>
          )
        })}

        {selectedPlace ? (
          <div
            className="plan-map-tooltip detail-card-warm"
            aria-live="polite"
          >
            <div className="plan-map-tooltip-kicker">{selectedPlace.category}</div>
            <div className="plan-map-tooltip-title">{selectedPlace.name.split(',')[0]}</div>
            <div className="plan-map-tooltip-meta">{selectedPlace.distanceLabel}</div>
          </div>
        ) : null}
      </div>

      <div className="plan-map-footer">
        <div>
          <div className="plan-map-title">{mapTitle}</div>
          <div className="plan-map-sub">{mapSubtitle}</div>
        </div>
        <div className="plan-map-zip">
          <input
            className="zip-input"
            type="text"
            inputMode="numeric"
            placeholder="Zip code"
            value={zipCode}
            onChange={(event) => onZipChange(event.target.value)}
          />
          <button type="button" className="zip-btn tap-target" onClick={onApplyLocation}>
            Find
          </button>
        </div>
      </div>
    </section>
  )
}
