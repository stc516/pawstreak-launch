/**
 * Generic adventure types shown to users outside developed regions.
 * No curated places, no distances — honest prompts that work anywhere.
 */
export interface GenericAdventureType {
  id: string
  emoji: string
  label: string
  prompt: string
  action: 'quick-walk' | 'add-adventure'
}

export const GENERIC_ADVENTURE_TYPES: GenericAdventureType[] = [
  {
    id: 'neighborhood-walk',
    emoji: '🏘️',
    label: 'Neighborhood walk',
    prompt: 'Start now — no planning needed',
    action: 'quick-walk',
  },
  {
    id: 'park',
    emoji: '🌳',
    label: 'Park',
    prompt: 'Your favorite local green space',
    action: 'add-adventure',
  },
  {
    id: 'trail',
    emoji: '🌲',
    label: 'Trail',
    prompt: 'A hike or nature path near you',
    action: 'add-adventure',
  },
  {
    id: 'coffee',
    emoji: '☕',
    label: 'Coffee',
    prompt: 'A dog-friendly cafe stop',
    action: 'add-adventure',
  },
  {
    id: 'patio',
    emoji: '🍽️',
    label: 'Patio',
    prompt: 'Outdoor dining with your pup',
    action: 'add-adventure',
  },
  {
    id: 'brewery',
    emoji: '🍺',
    label: 'Brewery',
    prompt: 'A local taproom that welcomes dogs',
    action: 'add-adventure',
  },
  {
    id: 'dog-park',
    emoji: '🐕',
    label: 'Dog park',
    prompt: 'Off-leash play near you',
    action: 'add-adventure',
  },
  {
    id: 'scenic-walk',
    emoji: '🌅',
    label: 'Scenic walk',
    prompt: 'A view worth walking to',
    action: 'add-adventure',
  },
]
