export type DogProgressionMetricKind =
  | 'total_adventures'
  | 'beach_adventures'
  | 'trail_adventures'
  | 'distinct_places'
  | 'road_trip_adventures'

export interface DogProgressionNode {
  id: string
  order: number
  chapter: string
  title: string
  description: string
  emoji: string
  threshold: number
  metric: DogProgressionMetricKind
  planHint: string
}

export interface DogProgressionPath {
  id: string
  title: string
  subtitle: string
  nodes: DogProgressionNode[]
}

export const DOG_PROGRESSION_PATH: DogProgressionPath = {
  id: 'dog-life-story',
  title: "Your dog's story",
  subtitle: 'Every adventure adds a chapter',
  nodes: [
    {
      id: 'story-first-adventure',
      order: 1,
      chapter: 'Chapter 1',
      title: 'The first adventure',
      description: 'Where it all begins — one outing, one memory saved.',
      emoji: '🐾',
      threshold: 1,
      metric: 'total_adventures',
      planHint: 'Start a neighborhood walk or plan your first outing',
    },
    {
      id: 'story-neighborhood-rhythm',
      order: 2,
      chapter: 'Chapter 2',
      title: 'Finding our rhythm',
      description: 'Daily loops and small wins that become your pack ritual.',
      emoji: '🏘️',
      threshold: 2,
      metric: 'total_adventures',
      planHint: 'Another neighborhood walk or quick park loop',
    },
    {
      id: 'story-beach-chapter',
      order: 3,
      chapter: 'Chapter 3',
      title: 'Sand between the paws',
      description: 'A beach day saved — splashes, zoomies, and salty fur.',
      emoji: '🏖️',
      threshold: 1,
      metric: 'beach_adventures',
      planHint: 'Plan a beach day or off-leash shoreline run',
    },
    {
      id: 'story-trail-scout',
      order: 4,
      chapter: 'Chapter 4',
      title: 'Trail scout',
      description: 'Ridge lines, pine needles, and paws on dirt.',
      emoji: '🌲',
      threshold: 1,
      metric: 'trail_adventures',
      planHint: 'Pick a trail adventure from Plan',
    },
    {
      id: 'story-new-places',
      order: 5,
      chapter: 'Chapter 5',
      title: 'New places discovered',
      description: 'Three different spots on the map — your world is growing.',
      emoji: '📍',
      threshold: 3,
      metric: 'distinct_places',
      planHint: 'Try somewhere you have not logged yet',
    },
    {
      id: 'story-road-trip',
      order: 6,
      chapter: 'Chapter 6',
      title: 'Big adventure day',
      description: 'Road trip energy — windows down, tails up, miles logged.',
      emoji: '🚗',
      threshold: 1,
      metric: 'road_trip_adventures',
      planHint: 'Plan a road trip or day-trip outing',
    },
    {
      id: 'story-memory-keeper',
      order: 7,
      chapter: 'Chapter 7',
      title: 'Memory keeper',
      description: 'Six adventures deep — this is a life you are building together.',
      emoji: '✨',
      threshold: 6,
      metric: 'total_adventures',
      planHint: 'Keep going — your story is still being written',
    },
  ],
}

export const DOG_PROGRESSION_RANKS = [
  { minCompleted: 0, rank: 'New pack', nextUnlock: 'Complete your first chapter' },
  { minCompleted: 1, rank: 'First steps', nextUnlock: 'Find your neighborhood rhythm' },
  { minCompleted: 2, rank: 'Daily walkers', nextUnlock: 'Save a beach day memory' },
  { minCompleted: 3, rank: 'Beach buddies', nextUnlock: 'Earn your trail scout chapter' },
  { minCompleted: 4, rank: 'Trail scout', nextUnlock: 'Discover three different places' },
  { minCompleted: 5, rank: 'Place explorer', nextUnlock: 'Log a big road trip day' },
  { minCompleted: 6, rank: 'Adventure crew', nextUnlock: 'Reach memory keeper status' },
  { minCompleted: 7, rank: 'Memory keeper', nextUnlock: 'Every new adventure adds more' },
] as const
