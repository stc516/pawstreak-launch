export interface ChallengePlace {
  id: string
  name: string
  completed: boolean
  imageUrl?: string
}

export interface ChallengePackDog {
  name: string
  initial: string
  progress: string
}

export interface ChallengeDetail {
  progressPercent: number
  motivationalLines: string[]
  completedPlaces: ChallengePlace[]
  remainingPlaces: ChallengePlace[]
  suggestedNext: {
    name: string
    reason: string
    imageUrl: string
  }
  stats: { label: string; value: string }[]
  memoryThumbnails: string[]
  packDogs: ChallengePackDog[]
  rewardTitle: string
  rewardDescription: string
  rewardEmoji: string
}

const CHALLENGE_DETAILS: Record<string, ChallengeDetail> = {
  'socal-beach': {
    progressPercent: 66,
    motivationalLines: [
      '2 beaches left to complete the challenge.',
      "You're ahead of 72% of beach explorers.",
      'Bailey seems happiest near the water.',
    ],
    completedPlaces: [
      { id: 'ob', name: 'Dog Beach, OB', completed: true, imageUrl: '/sample-images/beach.jpg' },
      { id: 'coronado', name: 'Coronado Dog Beach', completed: true, imageUrl: '/sample-images/coastal.jpg' },
      { id: 'del-mar', name: 'Del Mar Dog Beach', completed: true, imageUrl: '/sample-images/beach.jpg' },
      { id: 'huntington', name: 'Huntington Dog Beach', completed: true, imageUrl: '/sample-images/coastal.jpg' },
    ],
    remainingPlaces: [
      { id: 'carlsbad', name: 'Carlsbad Dog Beach', completed: false },
      { id: 'long-beach', name: "Rosie's Dog Beach", completed: false },
    ],
    suggestedNext: {
      name: 'Carlsbad Dog Beach',
      reason: 'Shorter drive, wide sand — perfect for a Bailey sprint day.',
      imageUrl: '/sample-images/beach.jpg',
    },
    stats: [
      { label: 'Beaches visited', value: '4 of 6' },
      { label: 'Days remaining', value: '12' },
      { label: 'Pack rank', value: 'Top 28%' },
    ],
    memoryThumbnails: [
      '/sample-images/beach.jpg',
      '/sample-images/coastal.jpg',
      '/sample-images/dogs-outdoors.jpg',
    ],
    packDogs: [
      { name: 'Mochi', initial: 'M', progress: '5 of 6' },
      { name: 'Rex', initial: 'R', progress: '4 of 6' },
      { name: 'Luna', initial: 'L', progress: '3 of 6' },
    ],
    rewardTitle: 'PawStreak collar tag',
    rewardDescription: 'Earned when you hit all 6 beaches this month.',
    rewardEmoji: '🏷️',
  },
  'morning-crew': {
    progressPercent: 60,
    motivationalLines: [
      '8 morning walks to go — you are building a real habit.',
      'Morning crew members finish 2× more challenges.',
      'Omi loves the quiet streets before 9am.',
    ],
    completedPlaces: [
      { id: 'balboa', name: 'Balboa Park loop', completed: true },
      { id: 'mission', name: 'Mission Bay trail', completed: true },
      { id: 'neighborhood', name: 'Neighborhood loop', completed: true },
    ],
    remainingPlaces: [
      { id: 'sunrise', name: 'Sunrise beach walk', completed: false },
      { id: 'canyon', name: 'Canyon trail AM', completed: false },
    ],
    suggestedNext: {
      name: 'Mission Bay trail',
      reason: 'You already know the route — easy win tomorrow morning.',
      imageUrl: '/sample-images/trail.jpg',
    },
    stats: [
      { label: 'Early walks', value: '12 of 20' },
      { label: 'Current streak', value: '4 days' },
      { label: 'Avg start time', value: '7:12 AM' },
    ],
    memoryThumbnails: [
      '/sample-images/trail.jpg',
      '/sample-images/park.jpg',
      '/sample-images/dogs-outdoors.jpg',
    ],
    packDogs: [
      { name: 'Cooper', initial: 'C', progress: '18 of 20' },
      { name: 'Piper', initial: 'P', progress: '14 of 20' },
      { name: 'Scout', initial: 'S', progress: '11 of 20' },
    ],
    rewardTitle: 'PawStreak bandana set',
    rewardDescription: 'Morning crew exclusive — ships when you hit 20.',
    rewardEmoji: '🎀',
  },
  'road-tripper': {
    progressPercent: 33,
    motivationalLines: [
      '2 day trips left — big memories ahead.',
      'Road trippers discover 40% more new places.',
      'Both dogs light up on the drive — keep going.',
    ],
    completedPlaces: [
      { id: 'julian', name: 'Julian day trip', completed: true, imageUrl: '/sample-images/mountain.jpg' },
    ],
    remainingPlaces: [
      { id: 'temecula', name: 'Temecula wine country', completed: false },
      { id: 'idylwild', name: 'Idyllwild mountain run', completed: false },
    ],
    suggestedNext: {
      name: 'Idyllwild mountain run',
      reason: 'Cooler air, pine trails — Bailey will love the elevation.',
      imageUrl: '/sample-images/mountain.jpg',
    },
    stats: [
      { label: 'Day trips', value: '1 of 3' },
      { label: 'Miles logged', value: '142' },
      { label: 'New places', value: '1' },
    ],
    memoryThumbnails: [
      '/sample-images/road-trip.jpg',
      '/sample-images/mountain.jpg',
      '/sample-images/trail.jpg',
    ],
    packDogs: [
      { name: 'Duke', initial: 'D', progress: '2 of 3' },
      { name: 'Willow', initial: 'W', progress: '1 of 3' },
      { name: 'Bear', initial: 'B', progress: '1 of 3' },
    ],
    rewardTitle: 'Custom adventure patch',
    rewardDescription: 'Sewn for explorers who leave their zip code behind.',
    rewardEmoji: '🧵',
  },
}

export function getChallengeDetail(challengeId: string): ChallengeDetail | null {
  return CHALLENGE_DETAILS[challengeId] ?? null
}
