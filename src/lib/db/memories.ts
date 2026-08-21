import type { Dog, JourneyEntry } from '../../data/demo'
import type { Place } from '../../types/place'
import {
  buildEmotionalMemoryLine,
  buildFavoriteMoment,
} from '../adventureFinish'
import { CUSTOM_ADVENTURE_PLACE_ID, getMagicLine } from '../../data/places'
import { normalizeCustomTitle } from '../customAdventure'
import { getSupabaseClient } from '../supabase'
import type { MemoryRow } from './types'

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl)
  return response.blob()
}

export async function uploadMemoryPhotos(
  userId: string,
  memoryId: string,
  photoDataUrls: string[],
): Promise<string[]> {
  const supabase = getSupabaseClient()
  if (!supabase || photoDataUrls.length === 0) return []

  const paths: string[] = []

  for (let index = 0; index < photoDataUrls.length; index += 1) {
    const blob = await dataUrlToBlob(photoDataUrls[index])
    const path = `${userId}/${memoryId}/${index + 1}.jpg`
    const { error } = await supabase.storage.from('memory-photos').upload(path, blob, {
      contentType: 'image/jpeg',
      upsert: true,
    })
    if (!error) paths.push(path)
  }

  return paths
}

async function rollbackIncompleteMemory(memoryId: string, photoPaths: string[]) {
  const supabase = getSupabaseClient()
  if (!supabase) return

  if (photoPaths.length > 0) {
    await supabase.storage.from('memory-photos').remove(photoPaths)
  }

  await supabase.from('memories').delete().eq('id', memoryId)
}

export async function getSignedPhotoUrls(paths: string[]): Promise<string[]> {
  const supabase = getSupabaseClient()
  if (!supabase || paths.length === 0) return []

  const urls = await Promise.all(
    paths.map(async (path) => {
      const { data } = await supabase.storage
        .from('memory-photos')
        .createSignedUrl(path, 60 * 60)
      return data?.signedUrl ?? ''
    }),
  )

  return urls.filter(Boolean)
}

function formatMemoryDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function buildCustomMemoryPayload(
  dogs: Dog[],
  options: {
    title: string
    locationLabel?: string
    userNotes?: string
    durationLabel?: string
    recapLabels?: string[]
  },
) {
  const recapLabels = options.recapLabels ?? []
  const emotionalLine = buildEmotionalMemoryLine(recapLabels, dogs)
  const favoriteMoment = buildFavoriteMoment(recapLabels, dogs)
  const memoryMood =
    recapLabels.includes('Needed a slower pace')
      ? 'Calm + close'
      : recapLabels.includes('Loved every second')
        ? 'Joyful + tired'
        : 'Warm + steady'

  const locationSnippet = options.locationLabel?.trim()
  const notesSnippet = options.userNotes?.trim()
  const magicLine =
    notesSnippet ||
    (locationSnippet ? `At ${locationSnippet}` : 'Your adventure')

  return {
    magic_line: magicLine,
    emotional_line: emotionalLine,
    favorite_moment: favoriteMoment,
    memory_mood: memoryMood,
    tags: ['Custom', ...(locationSnippet ? [locationSnippet] : [])],
    recap_labels: recapLabels,
    duration_label: options.durationLabel ?? '',
  }
}

export function buildMemoryPayload(
  place: Place,
  dogs: Dog[],
  options: {
    durationLabel?: string
    recapLabels?: string[]
  } = {},
) {
  const recapLabels = options.recapLabels ?? []
  const emotionalLine = buildEmotionalMemoryLine(recapLabels, dogs)
  const favoriteMoment = buildFavoriteMoment(recapLabels, dogs)
  const memoryMood =
    recapLabels.includes('Needed a slower pace')
      ? 'Calm + close'
      : recapLabels.includes('Loved every second')
        ? 'Joyful + tired'
        : 'Warm + steady'

  return {
    magic_line: getMagicLine(place),
    emotional_line: emotionalLine,
    favorite_moment: favoriteMoment,
    memory_mood: memoryMood,
    tags: place.tags.slice(0, 3),
    recap_labels: recapLabels,
    duration_label: options.durationLabel ?? '',
  }
}

export async function createMemory(input: {
  userId: string
  dogId: string
  adventureId: string | null
  place: Place
  dogs: Dog[]
  durationLabel?: string
  recapLabels?: string[]
  photoDataUrls?: string[]
  displayPlaceName?: string
  customLocationLabel?: string
  userNotes?: string
}): Promise<MemoryRow | null> {
  const supabase = getSupabaseClient()
  if (!supabase) return null

  const isCustom = input.place.id === CUSTOM_ADVENTURE_PLACE_ID
  const payload = isCustom
    ? buildCustomMemoryPayload(input.dogs, {
        title: input.displayPlaceName ?? input.place.name,
        locationLabel: input.customLocationLabel,
        userNotes: input.userNotes,
        durationLabel: input.durationLabel,
        recapLabels: input.recapLabels,
      })
    : buildMemoryPayload(input.place, input.dogs, {
        durationLabel: input.durationLabel,
        recapLabels: input.recapLabels,
      })

  const { data, error } = await supabase
    .from('memories')
    .insert({
      user_id: input.userId,
      dog_id: input.dogId,
      adventure_id: input.adventureId,
      place_id: input.place.id,
      place_name: input.displayPlaceName ?? input.place.name,
      occurred_at: new Date().toISOString(),
      custom_location_label: input.customLocationLabel ?? null,
      user_notes: input.userNotes ?? null,
      ...payload,
    })
    .select('*')
    .single()

  if (error || !data) return null

  const memory = data as MemoryRow
  const photos = input.photoDataUrls?.filter(Boolean) ?? []
  if (photos.length > 0) {
    const photoPaths = await uploadMemoryPhotos(input.userId, memory.id, photos)
    if (photoPaths.length !== photos.length) {
      await rollbackIncompleteMemory(memory.id, photoPaths)
      throw new Error('Could not save every attached memory photo.')
    }

    const { data: updated, error: updateError } = await supabase
      .from('memories')
      .update({ photo_paths: photoPaths })
      .eq('id', memory.id)
      .select('*')
      .single()

    if (updateError || !updated) {
      await rollbackIncompleteMemory(memory.id, photoPaths)
      throw new Error('Could not attach memory photos.')
    }

    return updated as MemoryRow
  }

  return memory
}

export async function memoryRowToJourneyEntry(row: MemoryRow): Promise<JourneyEntry> {
  const photoUrls = row.photo_paths.length
    ? await getSignedPhotoUrls(row.photo_paths)
    : []

  return {
    id: row.id,
    placeId: row.place_id,
    place: row.place_name,
    date: formatMemoryDate(row.occurred_at),
    occurredAt: row.occurred_at,
    magicLine: row.magic_line,
    tags: row.tags,
    photoUrls,
    durationLabel: row.duration_label,
    recapLabels: row.recap_labels,
    emotionalLine: row.emotional_line,
    favoriteMoment: row.favorite_moment,
    memoryMood: row.memory_mood,
    customLocationLabel: row.custom_location_label ?? undefined,
    userNotes: row.user_notes ?? undefined,
    dogTags: [],
  }
}

export async function fetchMemoriesForUser(
  userId: string,
  dogId?: string | null,
): Promise<JourneyEntry[]> {
  const supabase = getSupabaseClient()
  if (!supabase) return []

  let query = supabase
    .from('memories')
    .select('*')
    .order('occurred_at', { ascending: false })

  void userId
  if (dogId) {
    query = query.eq('dog_id', dogId)
  }

  const { data, error } = await query
  if (error || !data) return []

  return Promise.all((data as MemoryRow[]).map((row) => memoryRowToJourneyEntry(row)))
}

export async function countDistinctPlaces(userId: string, dogId?: string | null): Promise<number> {
  const supabase = getSupabaseClient()
  if (!supabase) return 0

  let query = supabase
    .from('memories')
    .select('place_id, place_name')
  void userId
  if (dogId) query = query.eq('dog_id', dogId)

  const { data, error } = await query
  if (error || !data) return 0

  const keys = new Set(
    data.map((row) => {
      if (row.place_id === CUSTOM_ADVENTURE_PLACE_ID) {
        return `custom:${normalizeCustomTitle(String(row.place_name ?? ''))}`
      }
      return row.place_id as string
    }),
  )
  return keys.size
}