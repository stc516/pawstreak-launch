export interface RoutePoint { lat: number; lng: number; capturedAt: string }
export function appendRoutePoint(points: RoutePoint[], position: GeolocationPosition): RoutePoint[] {
  const { latitude: lat, longitude: lng, accuracy } = position.coords
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180 || accuracy > 50 || accuracy < 0 || !Number.isFinite(accuracy)) return points
  if (points.length >= 2000) return points
  const last = points.at(-1)
  if (last && position.timestamp - Date.parse(last.capturedAt) < 10000) return points
  return [...points, { lat, lng, capturedAt: new Date(position.timestamp).toISOString() }]
}
