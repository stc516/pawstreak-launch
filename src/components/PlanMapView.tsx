import { useMemo } from 'react'
import type { Place } from '../types/place'
import type { MapCenter } from '../lib/mapbox'
import { GeographicMap } from './GeographicMap'
import { hasValidCoordinates } from '../lib/geographicCoordinates'

interface PlanMapViewProps {
  places: Place[]
  selectedPlaceId: string | null
  mapCenter: MapCenter
  onSelectPlace: (placeId: string) => void
  emptyTitle?: string
  emptyCopy?: string
}

export function PlanMapView({ places, selectedPlaceId, mapCenter, onSelectPlace,
  emptyTitle = 'No mapped places in this view',
  emptyCopy = 'Try another category or distance. Only places with known coordinates appear on the map.',
}: PlanMapViewProps) {
  const points = useMemo(() => places.filter(hasValidCoordinates).map(place => ({ id: place.id, label: place.name, lat: place.lat, lng: place.lng })), [places])
  return <GeographicMap points={points} center={mapCenter} selectedId={selectedPlaceId} onSelect={onSelectPlace} label="Explore places" emptyTitle={emptyTitle} emptyCopy={emptyCopy} />
}
