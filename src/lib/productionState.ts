import type { AppState, Dog, DogMode, RecapChip } from '../data/demo'
import { isDefaultDemoDogs } from './dogLabels'
import { calculateAdventureStreak } from './adventureStreak'
import { computeBondLevel } from './bondLevel'
import { resolveAchievements } from './achievementEngine'
import { buildRecentAdventuresFromJourney } from './recentAdventures'
import {
  buildAdventureRecapOptions,
  journeyTitleFor,
} from './onboardingProfile'

function buildMoodRecapOptions(dogs: Dog[]): RecapChip[] {
  const options: RecapChip[] = [
    { id: 'loved-every-second', label: 'Loved every second' },
    { id: 'needed-a-break', label: 'Needed a break' },
    { id: 'met-new-friends', label: 'Met new friends' },
    { id: 'found-a-new-spot', label: 'Found a new spot' },
  ]

  if (dogs.length >= 2) {
    options.push({
      id: 'dog2-pace',
      label: `${dogs[1].name} set the pace`,
    })
  } else if (dogs.length === 1) {
    options.push({
      id: 'dog-pace',
      label: `${dogs[0].name} set the pace`,
    })
  } else {
    options.push({ id: 'pace', label: 'They set the pace' })
  }

  return options
}

function buildDogModeOptions(dogs: Dog[]): { id: DogMode; label: string }[] {
  if (dogs.length <= 1) {
    return [{ id: 'both', label: dogs.length === 1 ? dogs[0].name : 'Your dog' }]
  }

  return [
    { id: 'both', label: 'Both' },
    { id: 'bailey', label: `${dogs[0].name} only` },
    { id: 'omi', label: `${dogs[1].name} only` },
  ]
}

export const DEMO_SEEDED_JOURNEY_ENTRY_IDS = new Set([
  'dog-beach-today',
  'torrey-pines-tuesday',
  'julian-saturday',
  'balboa-park-sunday',
  'lestats-coffee-monday',
])

export const DEMO_SEEDED_COMMUNITY_POST_IDS = new Set([
  'sophie-mango',
  'jake-luna-biscuit',
  'maria-cooper',
  'bailey-omi-patio',
])

export const DEMO_SEEDED_CHALLENGE_IDS = new Set(['summer-beach-challenge'])

export const DEMO_SEEDED_FAVORITE_IDS = new Set([
  'fav-dog-beach',
  'fav-torrey',
  'fav-julian',
])

export const EMPTY_COMMUNITY_LIVE: AppState['communityLive'] = {
  label: 'Community',
  count: '0',
  countLabel: 'pack members nearby',
  tagline: 'Share adventures when you are ready.',
  topSpot: 'Your neighborhood',
  topSpotNote: 'Community launches soon.',
  chips: [{ label: 'Coming soon' }],
}

export const EMPTY_BOND_LEVEL: AppState['bondLevel'] = {
  label: 'Bond level',
  rank: 'Getting started',
  fillWidth: '8%',
  subtitle: 'Every adventure builds your story together.',
  nextRank: 'Adventure buddy',
  nextUnlock: 'Save your first memory',
  favoriteCategory: '—',
  beachDays: 0,
  recentMoments: [],
}

export const EMPTY_FLASHBACK: AppState['flashback'] = {
  title: 'Your first memory is waiting',
  subtitle: 'Finish an adventure to start your journey.',
}

function countDistinctPlaces(entries: AppState['journeyEntries']): number {
  const ids = new Set(
    entries.map((entry) => entry.placeId).filter((id): id is string => Boolean(id)),
  )
  return ids.size
}

export function getJourneyMapSummary(state: AppState): AppState['journeyMap'] {
  if (state.adventureCount === 0) {
    return {
      title: 'Your map is waiting',
      subtitle: 'Your map starts with your first saved adventure.',
    }
  }

  const adventureLabel = `${state.adventureCount} adventure${state.adventureCount === 1 ? '' : 's'} on your map`
  const placeLabel = `${state.placeCount} place${state.placeCount === 1 ? '' : 's'} visited`

  return {
    title: adventureLabel,
    subtitle: `${placeLabel} · Tap to open your map`,
  }
}

export function getFlashbackForState(state: AppState): AppState['flashback'] {
  if (state.journeyEntries.length === 0) {
    return EMPTY_FLASHBACK
  }

  const latest = state.journeyEntries[0]
  const title =
    latest.date.toLowerCase() === 'today'
      ? 'Saved today'
      : `Remember ${latest.date.toLowerCase()}`

  return {
    title,
    subtitle: latest.magicLine ?? `A day at ${latest.place}.`,
  }
}

function looksLikeDemoCommunityLive(live: AppState['communityLive']): boolean {
  return live.count === '247' || live.countLabel.toLowerCase().includes('dogs out now')
}

function computeStreakForState(state: AppState): number {
  const realEntries = state.journeyEntries.filter(
    (entry) => !DEMO_SEEDED_JOURNEY_ENTRY_IDS.has(entry.id),
  )

  if (state.mode === 'demo' && realEntries.length === 0 && state.journeyEntries.length > 0) {
    return state.streak
  }

  const source = realEntries.length > 0 ? realEntries : state.journeyEntries
  return calculateAdventureStreak(source)
}

export function applyRealUserContent(state: AppState): AppState {
  const dogs = state.dogs
  const journeyTitle =
    dogs.length > 0 ? journeyTitleFor(dogs) : 'Your Journey'
  const streak = computeStreakForState(state)
  const recentAdventures = buildRecentAdventuresFromJourney(state.journeyEntries)

  return {
    ...state,
    journeyTitle,
    journeyMap: getJourneyMapSummary(state),
    flashback: getFlashbackForState(state),
    streak,
    recentAdventures,
    bondLevel: computeBondLevel({
      ...state,
      streak,
      recentAdventures,
    }),
    adventureRecapOptions: buildAdventureRecapOptions(dogs),
    moodRecapOptions: buildMoodRecapOptions(dogs),
    dogModeOptions: buildDogModeOptions(dogs),
    achievements: resolveAchievements(state),
  }
}

export function sanitizeProductionAppState(state: AppState): AppState {
  let next: AppState = { ...state }

  // Drop legacy prototype persistence-prompt fields from older local saves.
  const legacy = next as AppState & Record<string, unknown>
  for (const key of [
    'showSaveProgressBanner',
    'saveProgressDismissed',
    'showLocalOnlyBadge',
    'showSaveStoryBanner',
    'saveStoryDismissed',
    'showAccountPrompt',
  ]) {
    delete legacy[key]
  }

  if (isDefaultDemoDogs(next.dogs)) {
    next = {
      ...next,
      dogs: [],
      hasUserDogProfile: false,
      activeDogId: null,
    }
  }

  const journeyEntries = next.journeyEntries.filter(
    (entry) => !DEMO_SEEDED_JOURNEY_ENTRY_IDS.has(entry.id),
  )
  const communityPosts = next.communityPosts.filter(
    (post) => !DEMO_SEEDED_COMMUNITY_POST_IDS.has(post.id),
  )

  const adventureCount = journeyEntries.length
  const placeCount =
    adventureCount === 0 ? 0 : Math.max(next.placeCount, countDistinctPlaces(journeyEntries))

  const stripDemoHistory = adventureCount === 0

  next = {
    ...next,
    journeyEntries,
    communityPosts,
    adventureCount,
    placeCount,
    streak: stripDemoHistory ? 0 : next.streak,
    recentAdventures: stripDemoHistory ? [] : next.recentAdventures,
    joinedChallenges: stripDemoHistory
      ? []
      : (next.joinedChallenges ?? []).filter(
          (record) =>
            next.mode === 'demo' || !DEMO_SEEDED_CHALLENGE_IDS.has(record.challengeId),
        ),
    trainingLessonCompletions: stripDemoHistory ? [] : (next.trainingLessonCompletions ?? []),
    trainingRewardUnlocks: stripDemoHistory ? [] : (next.trainingRewardUnlocks ?? []),
    favoritePlaces: stripDemoHistory
      ? []
      : next.favoritePlaces.filter((item) => !DEMO_SEEDED_FAVORITE_IDS.has(item.id)),
    packAccessMembers: next.mode === 'app' ? [] : next.packAccessMembers,
    communityLive: looksLikeDemoCommunityLive(next.communityLive)
      ? EMPTY_COMMUNITY_LIVE
      : next.mode === 'app'
        ? EMPTY_COMMUNITY_LIVE
        : next.communityLive,
  }

  return applyRealUserContent(next)
}
