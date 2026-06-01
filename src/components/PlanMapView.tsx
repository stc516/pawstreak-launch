import { useEffect, useMemo, useRef, type CSSProperties } from 'react'
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
}

const MAP_PADDING = { top: 28, bottom: 28, left: 24, right: 24 }

export function PlanMapView({
  places,
  selectedPlaceId,
  mapCenter,
  onSelectPlace,
}: PlanMapViewProps) {
  const mapRef = useRef<MapRef>(null)
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
  }, [bounds, mapCenter.lat, mapCenter.lng, places.length])

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

  if (!isMapboxConfigured() || !accessToken) {
    return (
      <div className="plan-map-empty plan-map-empty--config detail-card-warm">
        <div className="plan-map-empty-title">Map unavailable</div>
        <p className="plan-map-empty-copy">
          Add <code>VITE_MAPBOX_TOKEN</code> to your local environment to load the Plan map.
        </p>
      </div>
    )
  }

  if (places.length === 0) {
    return (
      <div className="plan-map-empty detail-card-warm">
        <div className="plan-map-empty-title">No mappable spots yet</div>
        <p className="plan-map-empty-copy">
          Try another category or proximity filter to see places on the map.
        </p>
      </div>
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
      dragPan={false}
      scrollZoom={false}
      boxZoom={false}
      doubleClickZoom={false}
      touchZoomRotate={false}
      keyboard={false}
      reuseMaps
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
