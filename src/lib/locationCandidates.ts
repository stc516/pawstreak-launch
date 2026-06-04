import type { ActiveAdventure, LocationCandidate } from '../data/demo'
import { normalizeCustomTitle } from './customAdventure'

export type LocationPermissionStatus =
  | 'unknown'
  | 'granted'
  | 'denied'
  | 'unavailable'

export interface CapturedLocation {
  status: LocationPermissionStatus
  lat?: number
  lng?: number
  capturedAt?: string
}

export async function captureCurrentLocation(): Promise<CapturedLocation> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return { status: 'unavailable' }
  }

  try {
    const permission = await navigator.permissions?.query?.({
      name: 'geolocation' as PermissionName,
    })
    if (permission?.state === 'denied') {
      return { status: 'denied' }
    }
  } catch {
    // Some browsers do not expose geolocation in Permissions API.
  }

  return new Promise((resolve) => {
    const timeoutId = window.setTimeout(() => {
      resolve({ status: 'unavailable' })
    }, 3500)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        window.clearTimeout(timeoutId)
        resolve({
          status: 'granted',
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          capturedAt: new Date().toISOString(),
        })
      },
      (error) => {
        window.clearTimeout(timeoutId)
        resolve({
          status: error.code === error.PERMISSION_DENIED ? 'denied' : 'unavailable',
        })
      },
      {
        enableHighAccuracy: false,
        maximumAge: 60000,
        timeout: 3000,
      },
    )
  })
}

export function applyStartLocation(
  adventure: ActiveAdventure,
  capture: CapturedLocation,
): ActiveAdventure {
  if (capture.status !== 'granted' || capture.lat === undefined || capture.lng === undefined) {
    return {
      ...adventure,
      locationPermissionStatus: capture.status,
      gpsSummary:
        capture.status === 'denied'
          ? 'Location permission denied; adventure continued without GPS.'
          : 'Location unavailable; adventure continued without GPS.',
    }
  }

  return {
    ...adventure,
    locationPermissionStatus: 'granted',
    startLat: capture.lat,
    startLng: capture.lng,
    locationCapturedAt: capture.capturedAt,
    gpsSummary: 'Start location captured.',
  }
}

export function applyEndLocation(
  adventure: ActiveAdventure,
  capture: CapturedLocation,
): ActiveAdventure {
  if (capture.status !== 'granted' || capture.lat === undefined || capture.lng === undefined) {
    return {
      ...adventure,
      locationPermissionStatus:
        adventure.locationPermissionStatus === 'granted'
          ? 'granted'
          : capture.status,
      gpsSummary:
        adventure.startLat !== undefined && adventure.startLng !== undefined
          ? 'Start location captured; end location unavailable.'
          : adventure.gpsSummary,
    }
  }

  return {
    ...adventure,
    locationPermissionStatus: 'granted',
    endLat: capture.lat,
    endLng: capture.lng,
    locationCapturedAt: capture.capturedAt,
    gpsSummary:
      adventure.startLat !== undefined && adventure.startLng !== undefined
        ? 'Start and end locations captured.'
        : 'End location captured.',
  }
}

export function createLocationCandidate(input: {
  activeAdventure: ActiveAdventure
  sourceMemoryId?: string
  userId?: string
  photoCount: number
}): LocationCandidate | null {
  const { activeAdventure } = input
  const approximateLat = activeAdventure.startLat ?? activeAdventure.endLat
  const approximateLng = activeAdventure.startLng ?? activeAdventure.endLng
  if (approximateLat === undefined || approximateLng === undefined) return null

  const customTitle = activeAdventure.customTitle ?? activeAdventure.location
  return {
    id: crypto.randomUUID(),
    sourceAdventureId: activeAdventure.serverId ?? activeAdventure.id,
    sourceMemoryId: input.sourceMemoryId,
    userId: input.userId,
    customTitle,
    customLocationLabel: activeAdventure.customLocationLabel,
    normalizedTitle: normalizeCustomTitle(customTitle),
    approximateLat,
    approximateLng,
    endLat: activeAdventure.endLat,
    endLng: activeAdventure.endLng,
    photoCount: input.photoCount,
    dogIds: activeAdventure.selectedDogIds ?? (activeAdventure.dogId ? [activeAdventure.dogId] : []),
    userNotes: activeAdventure.userNotes,
    createdAt: new Date().toISOString(),
    reviewStatus: 'new',
    candidateType: 'custom_adventure',
    source: 'user_custom_adventure',
  }
}
