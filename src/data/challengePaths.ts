import { NEIGHBORHOOD_WALK_PLACE_ID } from './places'

export interface ChallengePathNode {
  id: string
  placeId: string
  name: string
  order: number
}

export type ChallengePathAccent = 'coastal' | 'forest' | 'warm'
export type ChallengeCompletionMode = 'place' | 'neighborhood-count'

export interface ChallengePathDefinition {
  id: string
  title: string
  subtitle: string
  description: string
  accent: ChallengePathAccent
  completionMode?: ChallengeCompletionMode
  fallbackImage: string
  /** Demo-only place completions when journey data is sparse. */
  demoCompletedPlaceIds?: string[]
  /** Demo-only count completions for neighborhood-count paths. */
  demoCompletedCount?: number
  nodes: ChallengePathNode[]
}

export const SAN_DIEGO_BEACH_QUEST_PATH: ChallengePathDefinition = {
  id: 'san-diego-beach-quest',
  title: 'San Diego Beach Quest',
  subtitle: '8 beaches · build your coastal map',
  description: 'Visit every classic San Diego dog beach and fill in your coastal map.',
  accent: 'coastal',
  fallbackImage: '/sample-images/beach.jpg',
  demoCompletedPlaceIds: [
    'dog-beach-ocean-beach',
    'fiesta-island',
    'coronado-dog-beach',
  ],
  nodes: [
    { id: 'sd-beach-1', placeId: 'dog-beach-ocean-beach', name: 'Dog Beach, Ocean Beach', order: 1 },
    { id: 'sd-beach-2', placeId: 'fiesta-island', name: 'Fiesta Island', order: 2 },
    { id: 'sd-beach-3', placeId: 'coronado-dog-beach', name: 'Coronado Dog Beach', order: 3 },
    { id: 'sd-beach-4', placeId: 'del-mar-dog-beach', name: 'Del Mar Dog Beach', order: 4 },
    { id: 'sd-beach-5', placeId: 'mission-bay', name: 'Mission Bay', order: 5 },
    { id: 'sd-beach-6', placeId: 'la-jolla-shores', name: 'La Jolla Shores', order: 6 },
    { id: 'sd-beach-7', placeId: 'pacific-beach', name: 'Pacific Beach', order: 7 },
    { id: 'sd-beach-8', placeId: 'cardiff-dog-beach', name: 'Cardiff Dog Beach', order: 8 },
  ],
}

export const TRAIL_SNIFFER_SERIES_PATH: ChallengePathDefinition = {
  id: 'trail-sniffer-series',
  title: 'Trail Sniffer Series',
  subtitle: '5 trails · ridge lines and wild smells',
  description: 'Five sniff-heavy trails that turn exercise into a story worth saving.',
  accent: 'forest',
  fallbackImage: '/sample-images/trail.jpg',
  demoCompletedPlaceIds: ['torrey-pines'],
  nodes: [
    { id: 'trail-1', placeId: 'torrey-pines', name: 'Torrey Pines State Reserve', order: 1 },
    { id: 'trail-2', placeId: 'cowles-mountain', name: 'Cowles Mountain Trail', order: 2 },
    { id: 'trail-3', placeId: 'iron-mountain', name: 'Iron Mountain Trail', order: 3 },
    { id: 'trail-4', placeId: 'mission-trails-kwaay-paay', name: 'Mission Trails — Kwaay Paay Peak', order: 4 },
    { id: 'trail-5', placeId: 'laguna-coast-wilderness', name: 'Laguna Coast Wilderness Park', order: 5 },
  ],
}

export const NEIGHBORHOOD_HERO_PATH: ChallengePathDefinition = {
  id: 'neighborhood-hero',
  title: 'Neighborhood Hero',
  subtitle: '10 walks · everyday loops at home',
  description: 'Ten neighborhood walks that prove the small days matter just as much.',
  accent: 'warm',
  completionMode: 'neighborhood-count',
  fallbackImage: '/sample-images/neighborhood.jpg',
  demoCompletedCount: 2,
  nodes: Array.from({ length: 10 }, (_, index) => ({
    id: `neighborhood-${index + 1}`,
    placeId: NEIGHBORHOOD_WALK_PLACE_ID,
    name: `Neighborhood walk ${index + 1}`,
    order: index + 1,
  })),
}

export const COFFEE_PATIO_TOUR_PATH: ChallengePathDefinition = {
  id: 'coffee-patio-tour',
  title: 'Coffee Patio Tour',
  subtitle: '5 coffee stops · patio hangs with the pack',
  description: 'Five patio coffee stops for slow mornings and people-watching with your dogs.',
  accent: 'warm',
  fallbackImage: '/sample-images/cafe.jpg',
  demoCompletedPlaceIds: ['lestats-coffee'],
  nodes: [
    { id: 'coffee-1', placeId: 'lestats-coffee', name: "Lestat's Coffee House", order: 1 },
    { id: 'coffee-2', placeId: 'better-buzz-hillcrest', name: 'Better Buzz Coffee — Hillcrest', order: 2 },
    { id: 'coffee-3', placeId: 'holsem-coffee', name: 'Holsem Coffee', order: 3 },
    { id: 'coffee-4', placeId: 'training-calm-cafe', name: 'Calm cafe sit', order: 4 },
    { id: 'coffee-5', placeId: 'dark-horse-coffee', name: 'Dark Horse Coffee Roasters', order: 5 },
  ],
}

export const CHALLENGE_PATHS: ChallengePathDefinition[] = [
  SAN_DIEGO_BEACH_QUEST_PATH,
  TRAIL_SNIFFER_SERIES_PATH,
  NEIGHBORHOOD_HERO_PATH,
  COFFEE_PATIO_TOUR_PATH,
]

export function getChallengePathById(id: string): ChallengePathDefinition | undefined {
  return CHALLENGE_PATHS.find((path) => path.id === id)
}

export function isChallengePathId(id: string): boolean {
  return CHALLENGE_PATHS.some((path) => path.id === id)
}
