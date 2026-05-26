import type { Dog } from '../../data/demo'
import { getSupabaseClient } from '../supabase'
import type { DogRow } from './types'

export function dogRowToDog(row: DogRow): Dog {
  return {
    id: row.id,
    name: row.name,
    initial: row.initial,
    avatarClass: row.avatar_class as Dog['avatarClass'],
    profileEmoji: row.profile_emoji,
    breed: row.breed,
    circleClass: row.circle_class as Dog['circleClass'],
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
  return (data as DogRow[]).map(dogRowToDog)
}

export async function createDogsForUser(userId: string, dogs: Dog[]): Promise<Dog[]> {
  const supabase = getSupabaseClient()
  if (!supabase || dogs.length === 0) return dogs

  const rows = dogs.map((dog, index) => ({
    user_id: userId,
    name: dog.name,
    breed: dog.breed,
    age: '',
    initial: dog.initial,
    avatar_class: dog.avatarClass,
    profile_emoji: dog.profileEmoji,
    circle_class: dog.circleClass,
    sort_order: index,
  }))

  const { data, error } = await supabase.from('dogs').insert(rows).select('*')
  if (error || !data) return dogs
  return (data as DogRow[]).map(dogRowToDog)
}

export async function updateDogForUser(
  userId: string,
  dogId: string,
  patch: Partial<Pick<Dog, 'name' | 'breed' | 'profileEmoji'>>,
) {
  const supabase = getSupabaseClient()
  if (!supabase) return

  const update: Record<string, string | undefined> = {}
  if (patch.name !== undefined) {
    update.name = patch.name
    update.initial = patch.name.charAt(0).toUpperCase()
  }
  if (patch.breed !== undefined) update.breed = patch.breed
  if (patch.profileEmoji !== undefined) update.profile_emoji = patch.profileEmoji

  await supabase.from('dogs').update(update).eq('id', dogId).eq('user_id', userId)
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
