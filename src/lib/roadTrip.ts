import type { Place } from '../types/place'

export function getDirectionsDestination(place: Place): string {
  if (place.directionsDestination) return place.directionsDestination
  if (place.addressLabel) return place.addressLabel
  if (place.lat != null && place.lng != null) {
    return `${place.lat},${place.lng}`
  }
  return `${place.name}, ${place.city}, CA`
}

export function buildGoogleDirectionsUrl(place: Place): string {
  const destination = encodeURIComponent(getDirectionsDestination(place))
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}`
}

function estimateDriveTimeFromDistance(distanceLabel: string): string | null {
  const miles = Number.parseInt(distanceLabel, 10)
  if (Number.isNaN(miles)) return null
  const minutes = Math.max(15, Math.round((miles / 45) * 60))
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    const remainder = minutes % 60
    return remainder > 0 ? `${hours} hr ${remainder} min` : `${hours} hr`
  }
  return `${minutes} min`
}

export function getRoadTripDriveTime(
  place: Place,
  locationSupported: boolean,
): string | null {
  if (!locationSupported) return null
  return place.driveTimeEstimate ?? estimateDriveTimeFromDistance(place.distanceLabel)
}

export function getRoadTripWhyToday(place: Place): string {
  return place.whyDogsLoveIt
}

export function openRoadTripDirections(place: Place) {
  window.open(buildGoogleDirectionsUrl(place), '_blank', 'noopener,noreferrer')
}
