export function hasValidCoordinates<T extends { lat?: number; lng?: number }>(point: T): point is T & { lat: number; lng: number } {
  return Number.isFinite(point.lat) && Number.isFinite(point.lng) &&
    Math.abs(point.lat!) <= 90 && Math.abs(point.lng!) <= 180
}
