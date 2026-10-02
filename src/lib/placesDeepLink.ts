import { getPlaceById } from '../data/places'

export interface PlanDeepLinkResolution {
  placeId: string | null
  missingPlaceId: string | null
}

export function resolvePlanDeepLink(
  search = window.location.search,
): PlanDeepLinkResolution {
  const params = new URLSearchParams(search)
  if (params.get('action') !== 'plan') {
    return { placeId: null, missingPlaceId: null }
  }

  const requestedPlaceId = params.get('place')?.trim() || null
  if (!requestedPlaceId) return { placeId: null, missingPlaceId: null }

  return getPlaceById(requestedPlaceId)
    ? { placeId: requestedPlaceId, missingPlaceId: null }
    : { placeId: null, missingPlaceId: requestedPlaceId }
}
