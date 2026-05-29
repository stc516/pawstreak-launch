import type { Dog } from '../../data/demo'
import { getSupabaseClient } from '../supabase'
import { getSignedPhotoUrls } from './memories'
import type { DogRow } from './types'

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl)
  return response.blob()
}

export async function uploadDogPhoto(
  userId: string,
  dogId: string,
  photoDataUrl: string,
): Promise<string | null> {
  const supabase = getSupabaseClient()
  if (!supabase) return null

  const blob = await dataUrlToBlob(photoDataUrl)
  const path = `${userId}/dogs/${dogId}.jpg`
  const { error } = await supabase.storage.from('memory-photos').upload(path, blob, {
    contentType: 'image/jpeg',
    upsert: true,
  })

  if (error) return null
  return path
}

export async function updateDogPhotoPath(
  userId: string,
  dogId: string,
  photoPath: string,
): Promise<boolean> {
  const supabase = getSupabaseClient()
  if (!supabase) return false

  const { error } = await supabase
    .from('dogs')
    .update({ photo_path: photoPath })
    .eq('id', dogId)
    .eq('user_id', userId)

  return !error
}

async function dogRowToDog(row: DogRow): Promise<Dog> {
  const photoUrl = row.photo_path
    ? (await getSignedPhotoUrls([row.photo_path]))[0]
    : undefined

  return {
    id: row.id,
    name: row.name,
    initial: row.initial,
    avatarClass: row.avatar_class as Dog['avatarClass'],
    profileEmoji: row.profile_emoji,
    breed: row.breed,
    age: row.age || undefined,
    circleClass: row.circle_class as Dog['circleClass'],
    photoUrl: photoUrl || undefined,
  }
}

export async function fetchDogsForUser(userId: string): Promise<Dog[]> {
  const supabase = getSupabaseClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('dogs')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true })

  if (error || !data) return []
  return Promise.all((data as DogRow[]).map(dogRowToDog))
}

export async function createDogsForUser(userId: string, dogs: Dog[]): Promise<Dog[]> {
  const supabase = getSupabaseClient()
  if (!supabase || dogs.length === 0) return dogs

  const rows = dogs.map((dog, index) => ({
    user_id: userId,
    name: dog.name,
    breed: dog.breed,
    age: dog.age ?? '',
    initial: dog.initial,
    avatar_class: dog.avatarClass,
    profile_emoji: dog.profileEmoji,
    circle_class: dog.circleClass,
    sort_order: index,
  }))

  const { data, error } = await supabase.from('dogs').insert(rows).select('*')
  if (error || !data) return dogs
  return Promise.all((data as DogRow[]).map(dogRowToDog))
}

export async function updateDogForUser(
  userId: string,
  dogId: string,
  patch: Partial<Pick<Dog, 'name' | 'breed' | 'age' | 'profileEmoji'>>,
) {
  const supabase = getSupabaseClient()
  if (!supabase) return

  const update: Record<string, string | undefined> = {}
  if (patch.name !== undefined) {
    update.name = patch.name
    update.initial = patch.name.charAt(0).toUpperCase()
  }
  if (patch.breed !== undefined) update.breed = patch.breed
  if (patch.age !== undefined) update.age = patch.age
  if (patch.profileEmoji !== undefined) update.profile_emoji = patch.profileEmoji

  await supabase.from('dogs').update(update).eq('id', dogId).eq('user_id', userId)
}

export async function deleteDogForUser(userId: string, dogId: string): Promise<boolean> {
  const supabase = getSupabaseClient()
  if (!supabase) return false

  const { error } = await supabase.from('dogs').delete().eq('id', dogId).eq('user_id', userId)
  return !error
}

export async function setActiveDog(userId: string, dogId: string | null) {
  const supabase = getSupabaseClient()
  if (!supabase) return

  await supabase.from('profiles').update({ active_dog_id: dogId }).eq('id', userId)
}

export function getActiveDog(dogs: Dog[], activeDogId: string | null | undefined): Dog | null {
  if (!dogs.length) return null
  if (activeDogId) {
    return dogs.find((dog) => dog.id === activeDogId) ?? dogs[0]
  }
  return dogs[0]
}
