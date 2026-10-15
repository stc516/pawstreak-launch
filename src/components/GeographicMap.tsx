import { useEffect, useMemo, useRef, useState } from 'react'
import Map, { AttributionControl, Marker, NavigationControl, type MapRef } from 'react-map-gl/mapbox'
import { DEFAULT_MAP_STYLE, getMapboxAccessToken, type MapCenter } from '../lib/mapbox'
import { hasValidCoordinates } from '../lib/geographicCoordinates'
import 'mapbox-gl/dist/mapbox-gl.css'

export interface GeographicPoint {
  id: string
  label: string
  lat: number
  lng: number
}

interface GeographicMapProps {
  points: GeographicPoint[]
  center: MapCenter
  selectedId: string | null
  onSelect: (id: string) => void
  label: string
  emptyTitle: string
  emptyCopy: string
}

/** Every marker uses a real coordinate. A failed basemap becomes a list, never a pretend map. */
export function GeographicMap({ points, center, selectedId, onSelect, label, emptyTitle, emptyCopy }: GeographicMapProps) {
  const token = getMapboxAccessToken()
  const mapRef = useRef<MapRef>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading')
  const [attempt, setAttempt] = useState(0)
  const validPoints = useMemo(() => points.filter(hasValidCoordinates), [points])
  const bounds = useMemo<[[number, number], [number, number]] | undefined>(() => {
    if (!validPoints.length) return undefined
    return [
      [Math.min(...validPoints.map(p => p.lng)), Math.min(...validPoints.map(p => p.lat))],
      [Math.max(...validPoints.map(p => p.lng)), Math.max(...validPoints.map(p => p.lat))],
    ]
  }, [validPoints])

  useEffect(() => {
    if (!token || !validPoints.length || status !== 'loading') return
    const timeout = window.setTimeout(() => setStatus('failed'), 12000)
    return () => window.clearTimeout(timeout)
  }, [attempt, status, token, validPoints.length])

  useEffect(() => {
    if (status === 'ready' && bounds) {
      mapRef.current?.fitBounds(bounds, { padding: 52, maxZoom: 14, duration: 0 })
    }
  }, [bounds, status])

  if (!validPoints.length) {
    return <div className="geographic-map-empty" role="status"><strong>{emptyTitle}</strong><p>{emptyCopy}</p></div>
  }

  if (!token || status === 'failed') {
    return (
      <div className="geographic-map-unavailable" data-testid="map-unavailable">
        <div role="status"><strong>Map unavailable right now</strong><p>Your places are still here. Choose one below.</p></div>
        {token ? <button type="button" className="map-retry tap-target" onClick={() => { setStatus('loading'); setAttempt(n => n + 1) }}>Retry map</button> : null}
        <div className="geographic-place-list" aria-label={label}>
          {validPoints.map(point => <button key={point.id} type="button" className="geographic-place-row tap-target" aria-pressed={point.id === selectedId} onClick={() => onSelect(point.id)}><i className="ti ti-map-pin" aria-hidden="true" /><span>{point.label}</span><i className="ti ti-chevron-right" aria-hidden="true" /></button>)}
        </div>
      </div>
    )
  }

  return (
    <div className="geographic-map" aria-label={label} data-testid="geographic-map">
      {status === 'loading' ? <div className="geographic-map-loading" role="status">Loading map…</div> : null}
      <Map key={attempt} ref={mapRef} mapboxAccessToken={token} mapStyle={DEFAULT_MAP_STYLE}
        initialViewState={{ longitude: center.lng, latitude: center.lat, zoom: 10, bounds, fitBoundsOptions: { padding: 52, maxZoom: 14 } }}
        style={{ width: '100%', height: '100%' }} attributionControl={false} scrollZoom={false}
        onLoad={() => setStatus('ready')} onError={() => setStatus('failed')}>
        <AttributionControl compact position="bottom-right" />
        <NavigationControl position="top-right" showCompass={false} />
        {status === 'ready' ? validPoints.map(point => (
          <Marker key={point.id} longitude={point.lng} latitude={point.lat} anchor="bottom">
            <button type="button" className={`geographic-map-marker tap-target${selectedId === point.id ? ' is-selected' : ''}`} aria-label={point.label} aria-pressed={selectedId === point.id} onClick={event => { event.stopPropagation(); onSelect(point.id) }}>
              <i className="ti ti-map-pin-filled" aria-hidden="true" /><span>{point.label}</span>
            </button>
          </Marker>
        )) : null}
      </Map>
    </div>
  )
}
