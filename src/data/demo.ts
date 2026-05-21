export type TabId = 'home' | 'plan' | 'journey' | 'community' | 'milestones'

export interface Dog {
  id: string
  name: string
  initial: string
  avatarClass: 'da-b' | 'da-o'
}

export interface ActivityChip {
  id: string
  emoji: string
  label: string
}

export interface RecentAdventure {
  title: string
  tag: string
}

export interface PlanCategory {
  id: string
  label: string
}

export interface PlanPlace {
  id: string
  emoji: string
  name: string
  meta: string
}

export interface MonthlyPlanOption {
  id: string
  icon: string
  title: string
  subtitle: string
}

export interface ActiveAdventure {
  location: string
}

export type DogMode = 'both' | 'bailey' | 'omi'

export interface RecapChip {
  id: string
  label: string
}

export interface AppState {
  activeTab: TabId
  activeAdventure: ActiveAdventure | null
  selectedActivityId: string
  selectedPlanCategoryId: string
  zipCode: string
  dogs: Dog[]
  streak: number
  adventureCount: number
  placeCount: number
  heroSpot: {
    title: string
    subtitle: string
    badge: string
  }
  durations: string[]
  activities: ActivityChip[]
  recentAdventures: RecentAdventure[]
  mapRegion: {
    title: string
    subtitle: string
  }
  planCategories: PlanCategory[]
  planPlaces: PlanPlace[]
  monthlyPlanOptions: MonthlyPlanOption[]
  moodRecapOptions: RecapChip[]
  highlightRecapOptions: RecapChip[]
  dogModeOptions: { id: DogMode; label: string }[]
}

export const defaultAppState: AppState = {
  activeTab: 'home',
  activeAdventure: null,
  selectedActivityId: 'beach',
  selectedPlanCategoryId: 'all',
  zipCode: '',
  dogs: [
    { id: 'bailey', name: 'Bailey', initial: 'B', avatarClass: 'da-b' },
    { id: 'omi', name: 'Omi', initial: 'O', avatarClass: 'da-o' },
  ],
  streak: 14,
  adventureCount: 47,
  placeCount: 22,
  heroSpot: {
    title: 'Dog Beach, OB',
    subtitle: '1.4 mi · Off-leash · Both dogs welcome',
    badge: '🔥 Popular now',
  },
  durations: ['15 min', '30 min', 'Open end'],
  activities: [
    { id: 'beach', emoji: '🏖️', label: 'Beach' },
    { id: 'coffee', emoji: '☕', label: 'Coffee' },
    { id: 'trail', emoji: '🌲', label: 'Trail' },
    { id: 'road-trip', emoji: '🚗', label: 'Road trip' },
    { id: 'gardens', emoji: '🌸', label: 'Gardens' },
    { id: 'neighborhood', emoji: '🏘️', label: 'Neighborhood' },
    { id: 'dog-park', emoji: '🐕', label: 'Dog park' },
    { id: 'brewery', emoji: '🍺', label: 'Brewery' },
  ],
  recentAdventures: [
    { title: 'Torrey Pines', tag: 'Trail · Tue' },
    { title: "Lestat's Coffee", tag: 'Coffee · Mon' },
    { title: 'Balboa Park', tag: 'Park · Sun' },
  ],
  mapRegion: {
    title: 'San Diego + OC spots',
    subtitle: '200+ dog-friendly places mapped · Tap a pin to explore',
  },
  planCategories: [
    { id: 'all', label: 'All' },
    { id: 'beach', label: 'Beach' },
    { id: 'trail', label: 'Trail' },
    { id: 'coffee', label: 'Coffee' },
    { id: 'dog-park', label: 'Dog park' },
    { id: 'road-trip', label: 'Road trip' },
    { id: 'gardens', label: 'Gardens' },
  ],
  planPlaces: [
    {
      id: 'dog-beach-ob',
      emoji: '🏖️',
      name: 'Dog Beach, Ocean Beach',
      meta: '1.4 mi · Off-leash · SD',
    },
    {
      id: 'julian-day-trip',
      emoji: '🚗',
      name: 'Julian Dog-Friendly Day Trip',
      meta: '62 mi · Apple picking + trail + cafe',
    },
    {
      id: 'balboa-rose-garden',
      emoji: '🌸',
      name: 'Balboa Park Rose Garden',
      meta: '3.2 mi · Dogs on-leash · SD',
    },
    {
      id: 'nates-point',
      emoji: '🐕',
      name: "Nate's Point Dog Park",
      meta: '3.4 mi · Off-leash enclosed · SD',
    },
  ],
  monthlyPlanOptions: [
    {
      id: 'curated',
      icon: 'ti-sparkles',
      title: 'Curated for your dogs',
      subtitle: 'Based on what they love most',
    },
    {
      id: 'random',
      icon: 'ti-dice',
      title: 'Random adventure plan',
      subtitle: 'Surprise them every time',
    },
    {
      id: 'preset',
      icon: 'ti-calendar-event',
      title: 'Preset plan → sync to calendar',
      subtitle: 'Get reminders so you never miss a day',
    },
  ],
  moodRecapOptions: [
    { id: 'loved-every-second', label: 'Loved every second' },
    { id: 'needed-a-break', label: 'Needed a break' },
    { id: 'met-new-friends', label: 'Met new friends' },
    { id: 'found-a-new-spot', label: 'Found a new spot' },
    { id: 'omi-set-the-pace', label: 'Omi set the pace' },
  ],
  highlightRecapOptions: [
    { id: 'off-leash-run', label: 'Off-leash run' },
    { id: 'playing-in-water', label: 'Playing in water' },
    { id: 'new-smells-everywhere', label: 'New smells everywhere' },
    { id: 'just-being-together', label: 'Just being together' },
  ],
  dogModeOptions: [
    { id: 'both', label: 'Both' },
    { id: 'bailey', label: 'Bailey only' },
    { id: 'omi', label: 'Omi only' },
  ],
}

export function dogNamesLabel(dogs: Dog[]): string {
  return dogs.map((dog) => dog.name).join(' + ')
}

export function createActiveAdventure(location: string): ActiveAdventure {
  return { location }
}

export function formatTimer(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}
