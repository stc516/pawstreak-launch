export type TabId = 'home' | 'plan' | 'journey' | 'community' | 'milestones' | 'profile'

import type { CuratedPlanDraft, CuratedPlanResult } from '../lib/curatedPlan'
import { EMPTY_CURATED_PLAN_DRAFT } from '../lib/curatedPlan'

export interface Dog {
  id: string
  name: string
  initial: string
  avatarClass: 'da-b' | 'da-o'
  profileEmoji: string
  breed: string
  circleClass: 'dc-b' | 'dc-o'
}

export interface ActivityChip {
  id: string
  emoji: string
  label: string
}

export interface RecentAdventure {
  placeId: string
  title: string
  tag: string
}

export interface PlanCategory {
  id: string
  label: string
}

export interface MonthlyPlanOption {
  id: string
  icon: string
  title: string
  subtitle: string
}

export interface ActiveAdventure {
  placeId: string
  location: string
}

export type DogMode = 'both' | 'bailey' | 'omi'

export interface RecapChip {
  id: string
  label: string
}

export interface JourneyFilter {
  id: string
  label: string
}

export interface JourneyEntry {
  id: string
  placeId?: string
  place: string
  date: string
  magicLine?: string
  tags: string[]
}

export interface Flashback {
  title: string
  subtitle: string
}

export interface LiveChip {
  label: string
}

export interface CommunityPost {
  id: string
  placeId?: string
  avatarClass: 'cp-av1' | 'cp-av2'
  initial: string
  name: string
  meta: string
  caption: string
  location: string
  likes: number
  comments: number
}

export interface Challenge {
  id: string
  name: string
  progress: string
  fillWidth: string
  subtitle: string
  prize: string
}

export interface Achievement {
  id: string
  emoji: string
  title: string
  subtitle: string
  status: 'done' | 'active' | 'locked'
  badge: string
}

export interface FavoritePlace {
  id: string
  placeId: string
  emoji: string
  name: string
  visits: string
}

export interface AppState {
  onboardingComplete: boolean
  activeTab: TabId
  activeAdventure: ActiveAdventure | null
  selectedActivityId: string
  selectedPlanCategoryId: string
  selectedJourneyFilterId: string
  selectedMonthlyPlanId: string | null
  selectedJourneyEntryId: string | null
  selectedChallengeId: string | null
  curatedPlanFlowStep: number
  curatedPlanDraft: CuratedPlanDraft
  curatedPlanResult: CuratedPlanResult | null
  adventurePhotos: string[]
  zipCode: string
  dogs: Dog[]
  streak: number
  adventureCount: number
  placeCount: number
  durations: string[]
  activities: ActivityChip[]
  recentAdventures: RecentAdventure[]
  mapRegion: {
    title: string
    subtitle: string
  }
  planCategories: PlanCategory[]
  monthlyPlanOptions: MonthlyPlanOption[]
  moodRecapOptions: RecapChip[]
  highlightRecapOptions: RecapChip[]
  dogModeOptions: { id: DogMode; label: string }[]
  journeyTitle: string
  journeyMap: {
    title: string
    subtitle: string
  }
  journeyFilters: JourneyFilter[]
  flashback: Flashback
  journeyEntries: JourneyEntry[]
  communityLive: {
    label: string
    count: string
    subtitle: string
    chips: LiveChip[]
  }
  communityPosts: CommunityPost[]
  bondLevel: {
    label: string
    rank: string
    fillWidth: string
    subtitle: string
  }
  challenges: Challenge[]
  achievements: Achievement[]
  favoritePlaces: FavoritePlace[]
}

export const defaultAppState: AppState = {
  onboardingComplete: false,
  activeTab: 'home',
  activeAdventure: null,
  selectedActivityId: 'beach',
  selectedPlanCategoryId: 'all',
  selectedJourneyFilterId: 'all',
  selectedMonthlyPlanId: null,
  selectedJourneyEntryId: null,
  selectedChallengeId: null,
  curatedPlanFlowStep: 0,
  curatedPlanDraft: EMPTY_CURATED_PLAN_DRAFT,
  curatedPlanResult: null,
  adventurePhotos: ['', '', ''],
  zipCode: '',
  dogs: [
    {
      id: 'bailey',
      name: 'Bailey',
      initial: 'B',
      avatarClass: 'da-b',
      profileEmoji: '🐕',
      breed: 'Siberian Husky',
      circleClass: 'dc-b',
    },
    {
      id: 'omi',
      name: 'Omi',
      initial: 'O',
      avatarClass: 'da-o',
      profileEmoji: '🐾',
      breed: 'Lab Mix · Senior',
      circleClass: 'dc-o',
    },
  ],
  streak: 14,
  adventureCount: 47,
  placeCount: 22,
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
    { placeId: 'torrey-pines', title: 'Torrey Pines State Reserve', tag: 'Trail · Tue' },
    { placeId: 'lestats-coffee', title: "Lestat's Coffee House", tag: 'Coffee · Mon' },
    { placeId: 'balboa-park', title: 'Balboa Park', tag: 'Park · Sun' },
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
  journeyTitle: "Bailey + Omi's Journey",
  journeyMap: {
    title: '47 adventures across SD + OC',
    subtitle: '22 places · Tap any pin to see that day',
  },
  journeyFilters: [
    { id: 'all', label: 'All' },
    { id: 'beach', label: 'Beach' },
    { id: 'trail', label: 'Trail' },
    { id: 'road-trips', label: 'Road trips' },
    { id: 'map-view', label: 'Map view' },
  ],
  flashback: {
    title: '1 year ago today',
    subtitle:
      "Bailey's first visit to Torrey Pines. You've been back 6 times since.",
  },
  journeyEntries: [
    {
      id: 'dog-beach-today',
      placeId: 'dog-beach-ocean-beach',
      place: 'Dog Beach, OB',
      date: 'Today',
      magicLine: 'Popular with the pack right now.',
      tags: ['Beach', 'Off-leash', 'Bailey + Omi', 'Loved it'],
    },
    {
      id: 'julian-saturday',
      placeId: 'julian-day-trip',
      place: 'Julian Day Trip',
      date: 'Saturday',
      magicLine: 'Big adventure if they need to burn energy.',
      tags: ['Road trip', '62 mi', 'Both dogs', 'New place'],
    },
  ],
  communityLive: {
    label: 'Right now in San Diego',
    count: '247 dogs on adventure',
    subtitle: 'Your city is out there. Are you?',
    chips: [
      { label: '🏖️ 89 at the beach' },
      { label: '🌲 54 on trails' },
      { label: '☕ 41 at cafes' },
      { label: '🐕 38 at dog parks' },
      { label: '🚗 25 on road trips' },
    ],
  },
  communityPosts: [
    {
      id: 'sophie-mango',
      placeId: 'del-mar-dog-beach',
      avatarClass: 'cp-av1',
      initial: 'S',
      name: 'Sophie + Mango',
      meta: '2h ago · Day 31 streak',
      caption:
        "Mango absolutely lost his mind at the water today. Best $0 we've ever spent.",
      location: 'Del Mar Dog Beach',
      likes: 84,
      comments: 12,
    },
    {
      id: 'jake-luna-biscuit',
      placeId: 'julian-day-trip',
      avatarClass: 'cp-av2',
      initial: 'J',
      name: 'Jake + Luna + Biscuit',
      meta: '4h ago · Day 8 streak',
      caption:
        'First road trip with both dogs. Julian was worth every minute of the drive.',
      location: 'Julian, CA · Road trip',
      likes: 61,
      comments: 7,
    },
  ],
  bondLevel: {
    label: 'Bond level',
    rank: 'Trail Scout',
    fillWidth: '62%',
    subtitle: '47 adventures · 22 places · Bailey + Omi',
  },
  challenges: [
    {
      id: 'socal-beach',
      name: 'SoCal Beach Challenge',
      progress: '4 of 6',
      fillWidth: '66%',
      subtitle: '6 different SoCal dog beaches this month',
      prize: 'Win: PawStreak collar tag · Ends in 12 days',
    },
    {
      id: 'morning-crew',
      name: 'Morning Crew',
      progress: '12 of 20',
      fillWidth: '60%',
      subtitle: '20 walks before 9am',
      prize: 'Win: PawStreak bandana set',
    },
    {
      id: 'road-tripper',
      name: 'Road Tripper',
      progress: '1 of 3',
      fillWidth: '33%',
      subtitle: '3 day trips outside your home city',
      prize: 'Win: custom adventure patch',
    },
  ],
  achievements: [
    {
      id: 'first-beach',
      emoji: '🏖️',
      title: 'First Beach Day',
      subtitle: 'Dog Beach, OB · March 12',
      status: 'done',
      badge: 'Done',
    },
    {
      id: 'trail-scout',
      emoji: '🌲',
      title: 'Trail Scout',
      subtitle: '3 more trail walks',
      status: 'active',
      badge: 'In progress',
    },
    {
      id: 'road-tripper-ach',
      emoji: '🚗',
      title: 'Road Tripper',
      subtitle: 'Take 3 day trips',
      status: 'locked',
      badge: 'Locked',
    },
  ],
  favoritePlaces: [
    {
      id: 'fav-dog-beach',
      placeId: 'dog-beach-ocean-beach',
      emoji: '🏖️',
      name: 'Dog Beach, Ocean Beach',
      visits: '12 visits · photos · memories',
    },
    {
      id: 'fav-torrey',
      placeId: 'torrey-pines',
      emoji: '🌲',
      name: 'Torrey Pines Trail',
      visits: '6 visits · photos · memories',
    },
    {
      id: 'fav-julian',
      placeId: 'julian-day-trip',
      emoji: '🚗',
      name: 'Julian Day Trip',
      visits: '2 visits · road trip · photos',
    },
  ],
}

export function dogNamesLabel(dogs: Dog[]): string {
  return dogs.map((dog) => dog.name).join(' + ')
}

export function createActiveAdventure(
  placeId: string,
  location: string,
): ActiveAdventure {
  return { placeId, location }
}

export function formatTimer(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export interface OnboardingVibe {
  id: string
  emoji: string
  name: string
  description: string
}

export interface OnboardingPlace {
  id: string
  emoji: string
  name: string
  meta: string
}

export const onboardingVibes: OnboardingVibe[] = [
  { id: 'explorer', emoji: '🧭', name: 'Explorer', description: 'New trails, dense paths, untouched spots.' },
  { id: 'social', emoji: '🐾', name: 'Social Pup', description: 'Busy parks, tail wags, meeting new friends.' },
  { id: 'sunset', emoji: '🌅', name: 'Sunset Chaser', description: 'Quiet views and golden hour strolls.' },
  { id: 'cozy', emoji: '🏠', name: 'Cozy Companion', description: 'Short loops, neighborhood walks, chill days.' },
  { id: 'beach', emoji: '🏖️', name: 'Beach Dog', description: 'Sand, waves, off-leash freedom.' },
  { id: 'road-trip', emoji: '🚗', name: 'Road Tripper', description: 'Day trips, new cities, big adventures.' },
  { id: 'cafe', emoji: '☕', name: 'Cafe Pup', description: 'Dog patios, coffee runs, people watching.' },
  { id: 'legend', emoji: '⭐', name: 'Local Legend', description: 'Knows every block, owns the neighborhood.' },
]

export const onboardingCatChips = [
  { id: 'park', emoji: '🌲', label: 'Park' },
  { id: 'beach', emoji: '🏖️', label: 'Beach' },
  { id: 'trail', emoji: '🥾', label: 'Trail' },
  { id: 'cafe', emoji: '☕', label: 'Cafe' },
  { id: 'brewery', emoji: '🍺', label: 'Brewery' },
  { id: 'dog-park', emoji: '🐕', label: 'Dog park' },
  { id: 'gardens', emoji: '🌸', label: 'Gardens' },
]

export const onboardingPlaces: OnboardingPlace[] = [
  { id: 'oak-ridge', emoji: '🌲', name: 'Oak Ridge Dog Trail', meta: '0.8 mi away · Off-leash · Park' },
  { id: 'barking-bean', emoji: '☕', name: 'The Barking Bean', meta: '1.2 mi away · Dog treats · Cafe' },
  { id: 'dog-beach-ob', emoji: '🏖️', name: 'Dog Beach, Ocean Beach', meta: '3.4 mi away · Off-leash · SD' },
]

export const dogBreeds = [
  'Golden Retriever',
  'Labrador',
  'Husky',
  'Doodle',
  'Poodle',
  'Bulldog',
  'Beagle',
  'Shepherd',
  'Mixed / Other',
]

export const dogAges = [
  'Puppy (under 1)',
  '1–3 years',
  '4–7 years',
  '8+ years (senior)',
]
