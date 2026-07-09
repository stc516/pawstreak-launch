export type TabId =
  | 'home'
  | 'plan'
  | 'journey'
  | 'community'
  | 'milestones'
  | 'rewards'
  | 'achievements'
  | 'profile'

import type { CuratedPlanDraft, CuratedPlanResult } from '../lib/curatedPlan'
import { EMPTY_CURATED_PLAN_DRAFT } from '../lib/curatedPlan'
import type {
  MonthlyPlanDraft,
  MonthlyPlanResult,
} from '../lib/monthlyPlan'
import { EMPTY_MONTHLY_PLAN_DRAFT } from '../lib/monthlyPlan'
import type {
  ActiveTrainingSchedule,
  TrainingProgramDraft,
} from '../lib/trainingSchedule'
import { EMPTY_TRAINING_PROGRAM_DRAFT } from '../lib/trainingSchedule'
import type { MapCenter } from '../lib/mapbox'
import { DEFAULT_MAP_CENTER } from '../lib/mapbox'
import type { RandomPlanResult } from '../lib/randomPlan'
import {
  EMPTY_ADD_ADVENTURE_DRAFT,
  type AddAdventureDraft,
  type ScheduledAdventure,
} from '../lib/customAdventure'
import type { PackAccessMember } from './packAccess'
import { DEFAULT_PACK_ACCESS_MEMBERS } from './packAccess'
import type { Achievement } from './achievements'
import type { JoinedChallengeRecord } from './challenges'
import type { TrainingLessonCompletion, TrainingRewardUnlock } from './training'

export type {
  PackAccessMember,
  PackMemberRole,
  PackInviteRole,
} from './packAccess'
export {
  DEFAULT_PACK_ACCESS_MEMBERS,
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

export type AdventureSource = 'catalog' | 'neighborhood' | 'custom'

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
  source?: AdventureSource
  customTitle?: string
  customLocationLabel?: string
  userNotes?: string
  locationPermissionStatus?: 'unknown' | 'granted' | 'denied' | 'unavailable'
  startLat?: number
  startLng?: number
  endLat?: number
  endLng?: number
  locationCapturedAt?: string
  gpsSummary?: string
  routePoints?: {
    lat: number
    lng: number
    capturedAt: string
  }[]
}

export interface LocationCandidate {
  id: string
  sourceAdventureId: string
  sourceMemoryId?: string
  userId?: string
  customTitle: string
  customLocationLabel?: string
  normalizedTitle: string
  approximateLat: number
  approximateLng: number
  endLat?: number
  endLng?: number
  photoCount: number
  dogIds: string[]
  userNotes?: string
  createdAt: string
  reviewStatus: 'new' | 'reviewing' | 'approved' | 'rejected'
  candidateType: 'custom_adventure'
  source: 'user_custom_adventure'
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
  customLocationLabel?: string
  userNotes?: string
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
export type ActiveAdventureView = 'minimized' | 'focused'

export type { MapCenter } from '../lib/mapbox'

export interface AppState {
  mode?: AppMode
  demoEntry?: DemoEntry
  onboardingComplete: boolean
  activeTab: TabId
  activeAdventure: ActiveAdventure | null
  /** UI: banner across tabs vs full-screen adventure overlay */
  activeAdventureView: ActiveAdventureView | null
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
  buildMyMonthFlowStep: number
  buildMyMonthDraft: MonthlyPlanDraft
  monthlyPlanResult: MonthlyPlanResult | null
  trainingProgramFlowStep: number
  trainingProgramDraft: TrainingProgramDraft
  activeTrainingSchedule: ActiveTrainingSchedule | null
  randomPlanResult: RandomPlanResult | null
  showPresetPlanOverlay: boolean
  showJourneyMapOverlay: boolean
  showJourneyLevelOverlay: boolean
  showAddAdventureFlow: boolean
  addAdventureDraft: AddAdventureDraft
  scheduledAdventures: ScheduledAdventure[]
  locationCandidates: LocationCandidate[]
  adventurePhotos: string[]
  zipCode: string
  locationQuery: string
  locationLabel: string
  locationSupported: boolean
  resolvedLocation: import('../lib/geocode').ResolvedLocation | null
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
  mapCenter: MapCenter
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
  activeAdventureView: null,
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
  buildMyMonthFlowStep: 0,
  buildMyMonthDraft: EMPTY_MONTHLY_PLAN_DRAFT,
  monthlyPlanResult: null,
  trainingProgramFlowStep: 0,
  trainingProgramDraft: EMPTY_TRAINING_PROGRAM_DRAFT,
  activeTrainingSchedule: null,
  randomPlanResult: null,
  showPresetPlanOverlay: false,
  showJourneyMapOverlay: false,
  showJourneyLevelOverlay: false,
  showAddAdventureFlow: false,
  addAdventureDraft: EMPTY_ADD_ADVENTURE_DRAFT,
  scheduledAdventures: [],
  locationCandidates: [],
  adventurePhotos: ['', '', ''],
  zipCode: '',
  locationQuery: '',
  locationLabel: 'San Diego, CA',
  locationSupported: true,
  resolvedLocation: null,
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
      name: 'Meiomi',
      initial: 'M',
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
      memoryLine: 'Meiomi set the pace on the ridge.',
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
    subtitle: 'Dog-friendly spots nearby · Tap a pin to explore',
  },
  mapCenter: DEFAULT_MAP_CENTER,
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
      title: 'Curated Plan',
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
    { id: 'omi-set-the-pace', label: 'Meiomi set the pace' },
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
    { id: 'omi-pace', label: 'Meiomi set the pace' },
  ],
  dogModeOptions: [
    { id: 'both', label: 'Both' },
    { id: 'bailey', label: 'Bailey only' },
    { id: 'omi', label: 'Meiomi only' },
  ],
  journeyTitle: "Bailey + Meiomi's Journey",
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
      tags: ['Beach', 'Off-leash', 'Bailey + Meiomi', 'Loved it'],
      photoUrls: [],
    },
    {
      id: 'torrey-pines-tuesday',
      placeId: 'torrey-pines',
      place: 'Torrey Pines State Reserve',
      date: 'Tuesday',
      magicLine: 'Meiomi set the pace on the ridge.',
      tags: ['Trail', 'On-leash', 'Bailey + Meiomi', '6th visit'],
      photoUrls: [],
    },
    {
      id: 'julian-saturday',
      placeId: 'julian-day-trip',
      place: 'Julian Day Trip',
      date: 'Saturday',
      magicLine: 'Big adventure if they need to burn energy.',
      tags: ['Road trip', '62 mi', 'Both dogs', 'New place'],
      photoUrls: [],
    },
    {
      id: 'balboa-park-sunday',
      placeId: 'balboa-park',
      place: 'Balboa Park',
      date: 'Sunday',
      magicLine: 'Bailey kept pulling toward the fountain.',
      tags: ['Park', 'On-leash', 'Both dogs', 'Golden hour'],
      photoUrls: [],
    },
    {
      id: 'lestats-coffee-monday',
      placeId: 'lestats-coffee',
      place: "Lestat's Coffee House",
      date: 'Monday',
      magicLine: 'One of those small days that becomes a favorite.',
      tags: ['Coffee', 'Patio', 'Both dogs', 'Slow morning'],
      photoUrls: [],
    },
  ],
  communityLive: {
    label: 'Community',
    count: '0',
    countLabel: 'coming soon',
    tagline: 'Shared memories and pack activity are on the way.',
    topSpot: '',
    topSpotNote: '',
    chips: [],
  },
  communityPosts: [],
  bondLevel: {
    label: 'Journey Level',
    rank: 'Trail Scout',
    fillWidth: '62%',
    subtitle: '47 adventures · 22 places · Bailey + Meiomi',
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
  joinedChallenges: [
    {
      challengeId: 'summer-beach-challenge',
      joinedAt: '2026-05-10T15:00:00.000Z',
    },
  ],
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
    resolvedLocation: null,
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
    source?: AdventureSource
    customTitle?: string
    customLocationLabel?: string
    userNotes?: string
    locationPermissionStatus?: ActiveAdventure['locationPermissionStatus']
    startLat?: number
    startLng?: number
    endLat?: number
    endLng?: number
    locationCapturedAt?: string
    gpsSummary?: string
    routePoints?: ActiveAdventure['routePoints']
  } = {},
): ActiveAdventure {
  const serverId = options.serverId
  const source =
    options.source ??
    (placeId === 'custom-adventure'
      ? 'custom'
      : placeId === 'neighborhood-walk'
        ? 'neighborhood'
        : 'catalog')

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
    source,
    customTitle: options.customTitle,
    customLocationLabel: options.customLocationLabel,
    userNotes: options.userNotes,
    locationPermissionStatus: options.locationPermissionStatus,
    startLat: options.startLat,
    startLng: options.startLng,
    endLat: options.endLat,
    endLng: options.endLng,
    locationCapturedAt: options.locationCapturedAt,
    gpsSummary: options.gpsSummary,
    routePoints: options.routePoints,
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
