import type { Place } from '../../types/place'
import { PLACES } from '../../data/places'
import { getSupabaseClient } from '../supabase'
import type { PlaceRow } from './types'

function rowToPlace(row: PlaceRow): Place {
  return {
    id: row.id,
    name: row.name,
    city: row.city,
    region: row.region as Place['region'],
    category: row.category as Place['category'],
    tags: row.tags,
    distanceLabel: row.distance_label,
    leashInfo: row.leash_info,
    dogFriendlyNotes: row.dog_friendly_notes,
    whyDogsLoveIt: row.why_dogs_love_it,
    bestTime: row.best_time,
    energyLevel: row.energy_level as Place['energyLevel'],
    addressLabel: row.address_label ?? undefined,
    website: row.website ?? undefined,
    lat: row.lat ?? undefined,
    lng: row.lng ?? undefined,
    featured: row.featured,
    popularNow: row.popular_now,
    imageUrl: row.image_url ?? undefined,
    imageAlt: row.image_alt ?? undefined,
    imageTone: (row.image_tone as Place['imageTone']) ?? undefined,
  }
}

export async function fetchPlacesFromSupabase(): Promise<Place[] | null> {
  const supabase = getSupabaseClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('places')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true })

  if (error || !data?.length) return null
  return (data as PlaceRow[]).map(rowToPlace)
}

export async function loadPlacesCatalog(): Promise<Place[]> {
  const remote = await fetchPlacesFromSupabase()
  return remote ?? PLACES
}
