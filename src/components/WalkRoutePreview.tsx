import type { RoutePoint } from '../lib/walkRoute'
export function WalkRoutePreview({ points }: { points: RoutePoint[] }) {
  const valid = points.filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lng) && Math.abs(p.lat) <= 90 && Math.abs(p.lng) <= 180).slice(0, 2000)
  if (valid.length < 2) return <p>Not enough GPS points for a route preview.</p>
  const lats = valid.map(p => p.lat), lngs = valid.map(p => p.lng)
  const minLat = Math.min(...lats), maxLat = Math.max(...lats), minLng = Math.min(...lngs), maxLng = Math.max(...lngs)
  const xRange = Math.max((maxLng-minLng) * Math.cos(minLat * Math.PI/180), 0.000001)
  const yRange = Math.max(maxLat-minLat, 0.000001)
  const scale = Math.min(280/xRange, 160/yRange)
  const segments: string[][] = [[]]
  valid.forEach((p, i) => {
    if (i && Date.parse(p.capturedAt) - Date.parse(valid[i-1].capturedAt) > 60000) segments.push([])
    segments.at(-1)!.push(`${20+(p.lng-minLng)*Math.cos(minLat*Math.PI/180)*scale},${180-(p.lat-minLat)*scale}`)
  })
  return <section className="field-card"><h2>Your recorded route</h2><svg viewBox="0 0 320 200" role="img" aria-label="Recorded GPS trace without a basemap">{segments.map((points, i) => <polyline key={i} points={points.join(' ')} fill="none" stroke="#dc3522" strokeWidth="3" />)}</svg><p>GPS trace only. Gaps indicate missing readings; this is not a navigation map.</p></section>
}
