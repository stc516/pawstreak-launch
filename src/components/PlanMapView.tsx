import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import Map, { AttributionControl, Marker, type MapRef } from 'react-map-gl/mapbox'
import type { Place } from '../types/place'
import type { MapCenter } from '../lib/mapbox'
import {
  DEFAULT_MAP_STYLE,
  getMapboxAccessToken,
  getMapFitBounds,
  getMapInitialZoom,
  isMapboxConfigured,
} from '../lib/mapbox'
import { shortPlaceMapLabel } from '../lib/planMap'
import 'mapbox-gl/dist/mapbox-gl.css'

interface PlanMapViewProps {
  places: Place[]
  selectedPlaceId: string | null
  mapCenter: MapCenter
  onSelectPlace: (placeId: string) => void
  emptyTitle?: string
  emptyCopy?: string
}

const MAP_PADDING = { top: 28, bottom: 28, left: 24, right: 24 }
const FALLBACK_PIN_POSITIONS = [
  { left: 18, top: 30 },
  { left: 54, top: 22 },
  { left: 78, top: 44 },
  { left: 34, top: 60 },
  { left: 64, top: 70 },
  { left: 13, top: 76 },
]

function AdventureMapFallback({
  places,
  selectedPlaceId,
  onSelectPlace,
}: Pick<PlanMapViewProps, 'places' | 'selectedPlaceId' | 'onSelectPlace'>) {
  return (
    <div className="plan-map-fallback" aria-label="Adventure places map">
      <div className="plan-map-terrain" aria-hidden="true">
        <span className="plan-map-coast" />
        <span className="plan-map-hills" />
        <span className="plan-map-road plan-map-road--north" />
        <span className="plan-map-road plan-map-road--east" />
        <span className="plan-map-road plan-map-road--south" />
      </div>
      <div className="plan-map-fallback-hint">Tap a pin. Pick your next story.</div>
      {places.slice(0, FALLBACK_PIN_POSITIONS.length).map((place, index) => {
        const position = FALLBACK_PIN_POSITIONS[index]
        const isSelected = selectedPlaceId === place.id
        return (
          <button
            key={place.id}
            type="button"
            className={`plan-map-pin plan-map-pin--adventure plan-map-pin--fallback tap-target${isSelected ? ' on' : ''}`}
            style={{
              left: `${position.left}%`,
              top: `${position.top}%`,
              '--pin-delay': `${index * 0.25}s`,
            } as CSSProperties}
            aria-pressed={isSelected}
            aria-label={place.name}
            onClick={() => onSelectPlace(place.id)}
          >
            <span className="plan-map-pin-pulse" aria-hidden="true" />
            <span className="plan-map-pin-dot plan-map-pin-dot--adventure" aria-hidden="true" />
            <span className="plan-map-pin-label">{shortPlaceMapLabel(place.name)}</span>
          </button>
        )
      })}
    </div>
  )
}

export function PlanMapView({
  places,
  selectedPlaceId,
  mapCenter,
  onSelectPlace,
  emptyTitle = 'No mappable spots yet',
  emptyCopy = 'Try another category or proximity filter to see places on the map.',
}: PlanMapViewProps) {
  const mapRef = useRef<MapRef>(null)
  const [mapFailed, setMapFailed] = useState(false)
  const accessToken = getMapboxAccessToken()
  const bounds = useMemo(() => getMapFitBounds(places), [places])

  useEffect(() => {
    const map = mapRef.current?.getMap()
    if (!map) return

    if (places.length > 0) {
      map.fitBounds(bounds, { padding: MAP_PADDING, duration: 450, maxZoom: 13 })
      return
    }

    map.flyTo({
      center: [mapCenter.lng, mapCenter.lat],
      zoom: getMapInitialZoom(places),
      duration: 450,
    })
  }, [bounds, mapCenter.lat, mapCenter.lng, places])

  useEffect(() => {
    if (!selectedPlaceId) return
    const place = places.find((item) => item.id === selectedPlaceId)
    if (!place?.lat || !place.lng) return

    mapRef.current?.flyTo({
      center: [place.lng, place.lat],
      zoom: Math.max(mapRef.current?.getZoom() ?? 11, 12),
      duration: 350,
    })
  }, [places, selectedPlaceId])

  if (places.length === 0) {
    return (
      <div className="plan-map-empty detail-card-warm">
        <div className="plan-map-empty-title">{emptyTitle}</div>
        <p className="plan-map-empty-copy">
          {emptyCopy}
        </p>
      </div>
    )
  }

  if (!isMapboxConfigured() || !accessToken || mapFailed) {
    return (
      <AdventureMapFallback
        places={places}
        selectedPlaceId={selectedPlaceId}
        onSelectPlace={onSelectPlace}
      />
    )
  }

  return (
    <Map
      ref={mapRef}
      mapboxAccessToken={accessToken}
      mapStyle={DEFAULT_MAP_STYLE}
      initialViewState={{
        longitude: mapCenter.lng,
        latitude: mapCenter.lat,
        zoom: getMapInitialZoom(places),
      }}
      style={{ width: '100%', height: '100%' }}
      attributionControl={false}
      dragPan
      scrollZoom={false}
      boxZoom={false}
      doubleClickZoom
      touchZoomRotate
      keyboard
      reuseMaps
      onError={() => setMapFailed(true)}
      onClick={() => {
        // Keep map taps from bubbling to card list handlers.
      }}
    >
      <AttributionControl compact position="bottom-right" />
      {places.map((place, index) => {
        if (place.lat == null || place.lng == null) return null
        const isSelected = selectedPlaceId === place.id

        return (
          <Marker
            key={place.id}
            longitude={place.lng}
            latitude={place.lat}
            anchor="center"
            onClick={(event) => {
              event.originalEvent.stopPropagation()
              onSelectPlace(place.id)
            }}
          >
            <button
              type="button"
              className={`plan-map-pin plan-map-pin--adventure plan-map-pin--mapbox tap-target${isSelected ? ' on' : ''}`}
              style={{ '--pin-delay': `${index * 0.35}s` } as CSSProperties}
              aria-pressed={isSelected}
              aria-label={place.name}
              onClick={(event) => {
                event.stopPropagation()
                onSelectPlace(place.id)
              }}
            >
              <span className="plan-map-pin-pulse" aria-hidden="true" />
              <span className="plan-map-pin-dot plan-map-pin-dot--adventure" aria-hidden="true" />
              <span className="plan-map-pin-label">{shortPlaceMapLabel(place.name)}</span>
            </button>
          </Marker>
        )
      })}
    </Map>
  )
}
