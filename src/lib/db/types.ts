export type UserEventName =
  | 'signup'
  | 'onboarding_complete'
  | 'adventure_started'
  | 'adventure_completed'
  | 'memory_created'
  | 'early_access_joined'

export interface ProfileRow {
  id: string
  display_name: string
  email: string | null
  zip_code: string
  location_query: string
  location_label: string
  location_supported: boolean
  dog_vibe_names: string[]
  onboarding_category_ids: string[]
  active_dog_id: string | null
  onboarding_complete: boolean
  created_at: string
  updated_at: string
}

export interface DogRow {
  id: string
  user_id: string
  name: string
  breed: string
  age: string
  initial: string
  avatar_class: string
  profile_emoji: string
  circle_class: string
  sort_order: number
  created_at: string
  updated_at: string
}

export interface PlaceRow {
  id: string
  name: string
  city: string
  region: string
  category: string
  tags: string[]
  distance_label: string
  leash_info: string
  dog_friendly_notes: string
  why_dogs_love_it: string
  best_time: string
  energy_level: string
  address_label: string | null
  lat: number | null
  lng: number | null
  featured: boolean
  popular_now: boolean
  image_url: string | null
  image_alt: string | null
  image_tone: string | null
  is_active: boolean
}

export interface AdventureRow {
  id: string
  user_id: string
  dog_id: string
  place_id: string
  status: 'active' | 'completed' | 'cancelled'
  started_at: string
  finished_at: string | null
  duration_label: string
  notes: string
  recap_labels: string[]
  created_at: string
  updated_at: string
}

export interface MemoryRow {
  id: string
  user_id: string
  dog_id: string
  adventure_id: string | null
  place_id: string
  place_name: string
  occurred_at: string
  magic_line: string
  emotional_line: string
  favorite_moment: string
  memory_mood: string
  tags: string[]
  recap_labels: string[]
  duration_label: string
  photo_paths: string[]
  created_at: string
  updated_at: string
}

export interface EarlyAccessSignupInput {
  email: string
  name?: string
  dogName?: string
  zipOrCity?: string
  instagramHandle?: string
  source?: string
  userId?: string | null
}
