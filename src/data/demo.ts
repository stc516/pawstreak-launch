export type TabId = 'home' | 'plan' | 'journey' | 'community' | 'milestones' | 'profile'

import type { CuratedPlanDraft, CuratedPlanResult } from '../lib/curatedPlan'
import { EMPTY_CURATED_PLAN_DRAFT } from '../lib/curatedPlan'
import type { RandomPlanResult } from '../lib/randomPlan'
import type { PackAccessMember } from './packAccess'
import { DEFAULT_PACK_ACCESS_MEMBERS } from './packAccess'
import type { Achievement } from './achievements'
import type { JoinedChallengeRecord } from './challenges'
import type { TrainingLessonCompletion, TrainingRewardUnlock } from './training'

export type {
  PackAccessMember,
  PackInviteAccessLevel,
  PackInviteRole,
} from './packAccess'
export {
  DEFAULT_PACK_ACCESS_MEMBERS,
  PACK_INVITE_ACCESS_LEVELS,
  PACK_INVITE_ROLES,
} from './packAccess'

export interface Dog {
  id: string
  name: string
  initial: string
  avatarClass: 'da-b' | 'da-o'
  profileEmoji: string
  breed: string
  age?: string
  circleClass: 'dc-b' | 'dc-o'
  photoUrl?: string
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
  memoryLine?: string
  photoUrl?: string
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
  id: string
  serverId?: string
  dogId?: string
  selectedDogIds?: string[]
  placeId: string
  location: string
  durationLabel: string
  started: boolean
  startedAt?: string
  status: 'active'
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
  occurredAt?: string
  magicLine?: string
  tags: string[]
  photoUrls?: string[]
  durationLabel?: string
  recapLabels?: string[]
  emotionalLine?: string
  favoriteMoment?: string
  memoryMood?: string
  dogTags?: string[]
}

export interface Flashback {
  title: string
  subtitle: string
}

export interface LiveChip {
  label: string
}

export interface CommunityComment {
  id: string
  author: string
  initial: string
  text: string
}

export interface CommunityPost {
  id: string
  placeId?: string
  photoUrl?: string
  avatarClass: 'cp-av1' | 'cp-av2'
  initial: string
  name: string
  meta: string
  caption: string
  location: string
  likes: number
  comments: number
  likedByUser?: boolean
  commentList?: CommunityComment[]
  isUserPost?: boolean
}

export type { Achievement } from './achievements'
export type { JoinedChallengeRecord } from './challenges'
export type { TrainingLessonCompletion, TrainingRewardUnlock } from './training'

export interface FavoritePlace {
  id: string
  placeId: string
  emoji: string
  name: string
  visits: string
}

export type AppMode = 'app' | 'demo'
export type DemoEntry = 'seeded' | 'onboarding'

export interface AppState {
  mode?: AppMode
  demoEntry?: DemoEntry
  onboardingComplete: boolean
  activeTab: TabId
  activeAdventure: ActiveAdventure | null
  selectedActivityId: string
  selectedPlanCategoryId: string
  selectedJourneyFilterId: string
  selectedMonthlyPlanId: string | null
  selectedJourneyEntryId: string | null
  selectedChallengeId: string | null
  selectedAchievementId: string | null
  selectedTrainingProgramId: string | null
  showCommunityCompose: boolean
  memorySaveToast: string | null
  curatedPlanFlowStep: number
  curatedPlanDraft: CuratedPlanDraft
  curatedPlanResult: CuratedPlanResult | null
  randomPlanResult: RandomPlanResult | null
  showPresetPlanOverlay: boolean
  showJourneyMapOverlay: boolean
  showJourneyLevelOverlay: boolean
  adventurePhotos: string[]
  zipCode: string
  locationQuery: string
  locationLabel: string
  locationSupported: boolean
  userName: string
  dogVibeNames: string[]
  onboardingCategoryIds: string[]
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
  adventureRecapOptions: RecapChip[]
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
    countLabel: string
    tagline: string
    topSpot: string
    topSpotNote: string
    chips: LiveChip[]
  }
  communityPosts: CommunityPost[]
  bondLevel: {
    label: string
    rank: string
    fillWidth: string
    subtitle: string
    nextRank: string
    nextUnlock: string
    favoriteCategory: string
    beachDays: number
    recentMoments: {
      emoji: string
      title: string
      subtitle: string
    }[]
  }
  joinedChallenges: JoinedChallengeRecord[]
  trainingLessonCompletions: TrainingLessonCompletion[]
  trainingRewardUnlocks: TrainingRewardUnlock[]
  achievements: Achievement[]
  favoritePlaces: FavoritePlace[]
  hasUserDogProfile: boolean
  packAccessMembers: PackAccessMember[]
  showPackInviteOverlay: boolean
  packAccessToast: string | null
  activeDogId?: string | null
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
  selectedAchievementId: null,
  selectedTrainingProgramId: null,
  showCommunityCompose: false,
  memorySaveToast: null,
  curatedPlanFlowStep: 0,
  curatedPlanDraft: EMPTY_CURATED_PLAN_DRAFT,
  curatedPlanResult: null,
  randomPlanResult: null,
  showPresetPlanOverlay: false,
  showJourneyMapOverlay: false,
  showJourneyLevelOverlay: false,
  adventurePhotos: ['', '', ''],
  zipCode: '',
  locationQuery: '',
  locationLabel: 'San Diego, CA',
  locationSupported: true,
  userName: '',
  dogVibeNames: [],
  onboardingCategoryIds: [],
  dogs: [
    {
      id: 'bailey',
      name: 'Bailey',
      initial: 'B',
      avatarClass: 'da-b',
      profileEmoji: '🐕',
      breed: 'Siberian Husky',
      age: '4 years',
      circleClass: 'dc-b',
    },
    {
      id: 'omi',
      name: 'Omi',
      initial: 'O',
      avatarClass: 'da-o',
      profileEmoji: '🐾',
      breed: 'Lab Mix',
      age: 'Senior',
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
    {
      placeId: 'torrey-pines',
      title: 'Torrey Pines State Reserve',
      tag: 'Trail · Tue',
      memoryLine: 'Omi set the pace on the ridge.',
    },
    {
      placeId: 'lestats-coffee',
      title: "Lestat's Coffee House",
      tag: 'Coffee · Mon',
      memoryLine: 'One of those small days that becomes a favorite.',
    },
    {
      placeId: 'balboa-park',
      title: 'Balboa Park',
      tag: 'Park · Sun',
      memoryLine: 'Bailey kept pulling toward the fountain.',
    },
  ],
  mapRegion: {
    title: 'San Diego + OC spots',
    subtitle: 'Curated dog-friendly picks in your area · Tap a pin to explore',
  },
  planCategories: [
    { id: 'all', label: 'All' },
    { id: 'beach', label: 'Beach' },
    { id: 'trail', label: 'Trail' },
    { id: 'coffee', label: 'Coffee' },
    { id: 'dog-park', label: 'Dog park' },
    { id: 'road-trip', label: 'Road trip' },
    { id: 'gardens', label: 'Gardens' },
    { id: 'training', label: 'Training' },
  ],
  monthlyPlanOptions: [
    {
      id: 'curated',
      icon: 'ti-sparkles',
      title: 'Curated plan',
      subtitle: 'Built around what your dog loves',
    },
    {
      id: 'random',
      icon: 'ti-dice',
      title: 'Surprise me',
      subtitle: 'Fresh adventure ideas when you need an easy win',
    },
    {
      id: 'preset',
      icon: 'ti-calendar-event',
      title: 'Calendar plan',
      subtitle: 'Pick days and reminders for your next adventures',
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
  adventureRecapOptions: [
    { id: 'loved-every-second', label: 'Loved every second' },
    { id: 'slower-pace', label: 'Needed a slower pace' },
    { id: 'met-new-friends', label: 'Met new friends' },
    { id: 'new-smell', label: 'Found a new smell' },
    { id: 'bailey-led', label: 'Bailey led the way' },
    { id: 'omi-pace', label: 'Omi set the pace' },
  ],
  dogModeOptions: [
    { id: 'both', label: 'Both' },
    { id: 'bailey', label: 'Bailey only' },
    { id: 'omi', label: 'Omi only' },
  ],
  journeyTitle: "Bailey + Omi's Journey",
  journeyMap: {
    title: '47 adventures saved',
    subtitle: '22 places discovered · Tap to open your map',
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
      magicLine: 'Bailey sprinted through the shallows.',
      tags: ['Beach', 'Off-leash', 'Bailey + Omi', 'Loved it'],
      photoUrls: ['/sample-images/beach.jpg', '/sample-images/coastal.jpg'],
    },
    {
      id: 'torrey-pines-tuesday',
      placeId: 'torrey-pines',
      place: 'Torrey Pines State Reserve',
      date: 'Tuesday',
      magicLine: 'Omi set the pace on the ridge.',
      tags: ['Trail', 'On-leash', 'Bailey + Omi', '6th visit'],
      photoUrls: ['/sample-images/trail.jpg', '/sample-images/park.jpg'],
    },
    {
      id: 'julian-saturday',
      placeId: 'julian-day-trip',
      place: 'Julian Day Trip',
      date: 'Saturday',
      magicLine: 'Big adventure if they need to burn energy.',
      tags: ['Road trip', '62 mi', 'Both dogs', 'New place'],
      photoUrls: ['/sample-images/road-trip.jpg', '/sample-images/mountain.jpg'],
    },
    {
      id: 'balboa-park-sunday',
      placeId: 'balboa-park',
      place: 'Balboa Park',
      date: 'Sunday',
      magicLine: 'Bailey kept pulling toward the fountain.',
      tags: ['Park', 'On-leash', 'Both dogs', 'Golden hour'],
      photoUrls: ['/sample-images/park.jpg', '/sample-images/dogs-outdoors.jpg'],
    },
    {
      id: 'lestats-coffee-monday',
      placeId: 'lestats-coffee',
      place: "Lestat's Coffee House",
      date: 'Monday',
      magicLine: 'One of those small days that becomes a favorite.',
      tags: ['Coffee', 'Patio', 'Both dogs', 'Slow morning'],
      photoUrls: ['/sample-images/cafe.jpg', '/sample-images/neighborhood.jpg'],
    },
  ],
  communityLive: {
    label: 'Right now in San Diego',
    count: '247',
    countLabel: 'dogs out now',
    tagline: 'Beach walks, trail runs, patio hangs.',
    topSpot: 'Dog Beach',
    topSpotNote: 'Pack favorite today',
    chips: [
      { label: '89 beach adventures' },
      { label: '54 trails' },
      { label: '41 cafes' },
      { label: '38 dog parks' },
      { label: '25 road trips' },
    ],
  },
  communityPosts: [
    {
      id: 'sophie-mango',
      placeId: 'del-mar-dog-beach',
      photoUrl: '/sample-images/beach.jpg',
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
      photoUrl: '/sample-images/road-trip.jpg',
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
    {
      id: 'maria-cooper',
      placeId: 'torrey-pines',
      photoUrl: '/sample-images/trail.jpg',
      avatarClass: 'cp-av1',
      initial: 'M',
      name: 'Maria + Cooper',
      meta: '6h ago · Day 14 streak',
      caption:
        'Trail day at Torrey Pines — Cooper finally stopped to smell every pine cone.',
      location: 'Torrey Pines State Reserve',
      likes: 47,
      comments: 5,
    },
    {
      id: 'bailey-omi-patio',
      placeId: 'lestats-coffee',
      photoUrl: '/sample-images/cafe.jpg',
      avatarClass: 'cp-av2',
      initial: 'B',
      name: 'Bailey + Omi',
      meta: 'Yesterday · Day 14 streak',
      caption:
        'Slow morning on the patio — Omi people-watched while Bailey guarded the treats.',
      location: "Lestat's Coffee House · Patio hang",
      likes: 52,
      comments: 9,
    },
  ],
  bondLevel: {
    label: 'Journey Level',
    rank: 'Trail Scout',
    fillWidth: '62%',
    subtitle: '47 adventures · 22 places · Bailey + Omi',
    nextRank: 'Local Legend',
    nextUnlock: '3 more trail adventures to reach Local Legend.',
    favoriteCategory: 'Beach days',
    beachDays: 8,
    recentMoments: [
      {
        emoji: '🏖️',
        title: 'First Beach Day',
        subtitle: 'Dog Beach, OB · March 12',
      },
      {
        emoji: '🌲',
        title: 'Trail Scout progress',
        subtitle: 'Torrey Pines · 6 visits',
      },
      {
        emoji: '🚗',
        title: 'Julian day trip saved',
        subtitle: 'New place · both dogs',
      },
    ],
  },
  joinedChallenges: [],
  trainingLessonCompletions: [],
  trainingRewardUnlocks: [],
  achievements: [],
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
  hasUserDogProfile: false,
  packAccessMembers: DEFAULT_PACK_ACCESS_MEMBERS,
  showPackInviteOverlay: false,
  packAccessToast: null,
  activeDogId: 'bailey',
}

export function createSeededDemoState(): AppState {
  return {
    ...defaultAppState,
    mode: 'demo',
    demoEntry: 'seeded',
    onboardingComplete: true,
    activeTab: 'home',
    hasUserDogProfile: false,
  }
}

export function createDemoOnboardingState(): AppState {
  return {
    ...defaultAppState,
    mode: 'demo',
    demoEntry: 'onboarding',
    onboardingComplete: false,
    activeTab: 'home',
    hasUserDogProfile: false,
    dogs: [],
    streak: 0,
    adventureCount: 0,
    placeCount: 0,
    journeyEntries: [],
    activeAdventure: null,
    userName: '',
    dogVibeNames: [],
    onboardingCategoryIds: [],
    zipCode: '',
    locationQuery: '',
    locationLabel: 'San Diego, CA',
    locationSupported: true,
  }
}

export {
  dogNamesLabel,
  dogPossessiveLabel,
  getAdventureDogLabel,
  getDogCountLabel,
  getDogDisplayName,
  getDogPossessive,
  getPackDisplayName,
  isDefaultDemoDogs,
  personalizeGhostText,
} from '../lib/dogLabels'
export {
  getDisplayBondSubtitle,
  getDisplayDogLabel,
  getDisplayDogPossessive,
  getDisplayDogsAreOutLabel,
  getDisplayJourneyTitle,
  getProfileDogs,
} from '../lib/profileDisplay'

export function createActiveAdventure(
  placeId: string,
  location: string,
  durationLabel = 'Open end',
  options: {
    started?: boolean
    startedAt?: string
    serverId?: string
    dogId?: string
    selectedDogIds?: string[]
  } = {},
): ActiveAdventure {
  const serverId = options.serverId
  return {
    id: serverId ?? crypto.randomUUID(),
    serverId,
    dogId: options.dogId,
    selectedDogIds: options.selectedDogIds,
    placeId,
    location,
    durationLabel,
    started: options.started ?? false,
    startedAt: options.startedAt,
    status: 'active',
  }
}

export function getActiveAdventureElapsedSeconds(adventure: ActiveAdventure): number {
  if (!adventure.started || !adventure.startedAt) return 0
  const startedMs = new Date(adventure.startedAt).getTime()
  if (Number.isNaN(startedMs)) return 0
  return Math.max(0, Math.floor((Date.now() - startedMs) / 1000))
}

export function getFinishedDurationLabel(adventure: ActiveAdventure): string {
  if (adventure.started && adventure.startedAt) {
    const elapsedSeconds = getActiveAdventureElapsedSeconds(adventure)
    if (elapsedSeconds > 0) return formatTimer(elapsedSeconds)
  }
  return adventure.durationLabel
}

export function formatTimerWithTarget(
  elapsedSeconds: number,
  durationLabel: string,
): string {
  const elapsed = formatTimer(elapsedSeconds)
  if (durationLabel === 'Open end') {
    return elapsed
  }
  return `${elapsed} / ${durationLabel}`
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
  { id: 'slow-sniffer', emoji: '👃', name: 'Slow Sniffer', description: 'Easy walks, neighborhood loops, taking in every smell.' },
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
  'German Shepherd',
  'Australian Shepherd',
  'French Bulldog',
  'Bulldog',
  'Beagle',
  'Boxer',
  'Dachshund',
  'Chihuahua',
  'Pit Bull / Staffy',
  'Border Collie',
  'Poodle',
  'Doodle',
  'Corgi',
  'Shih Tzu',
  'Terrier',
  'Mixed / Other',
]

export const dogAges = [
  'Puppy (under 1)',
  '1–3 years',
  '4–7 years',
  '8+ years (senior)',
]
