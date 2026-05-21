export interface JourneyMemoryDetail {
  memorySubtitle: string
  visitCount: number
  dogLoveLine: string
  emotionalRecaps: string[]
  adventureChips: string[]
  photoUrls: string[]
}

const MEMORY_BY_ENTRY: Record<string, JourneyMemoryDetail> = {
  'dog-beach-today': {
    memorySubtitle: 'One of those simple perfect days.',
    visitCount: 12,
    dogLoveLine: 'Bailey loved this place.',
    emotionalRecaps: [
      "Bailey couldn't stop sprinting through the water.",
      'Omi set the pace today — slow sniff, happy tail.',
      'You stayed until the light went soft and neither dog wanted to leave.',
    ],
    adventureChips: ['Off-leash run', 'Playing in water', 'Loved every second'],
    photoUrls: [
      '/sample-images/beach.jpg',
      '/sample-images/coastal.jpg',
      '/sample-images/dogs-outdoors.jpg',
    ],
  },
  'julian-saturday': {
    memorySubtitle: 'A big day worth remembering.',
    visitCount: 2,
    dogLoveLine: 'Bailey loved this place.',
    emotionalRecaps: [
      'New mountain smells everywhere — both dogs were glued to the windows on the drive up.',
      'Bailey led on the trail; Omi found the best patch of shade.',
      'One of those simple perfect days away from the usual loop.',
    ],
    adventureChips: ['Road trip', 'Found a new spot', 'Just being together'],
    photoUrls: [
      '/sample-images/road-trip.jpg',
      '/sample-images/mountain.jpg',
      '/sample-images/trail.jpg',
    ],
  },
}

const DEFAULT_MEMORY: JourneyMemoryDetail = {
  memorySubtitle: 'A day worth keeping.',
  visitCount: 1,
  dogLoveLine: 'Bailey loved this place.',
  emotionalRecaps: [
    'One of those simple perfect days.',
    'Both dogs came home tired and happy.',
  ],
  adventureChips: ['Loved every second', 'Just being together'],
  photoUrls: ['/sample-images/park.jpg', '/sample-images/dogs-outdoors.jpg'],
}

export function getJourneyMemoryDetail(entryId: string): JourneyMemoryDetail {
  return MEMORY_BY_ENTRY[entryId] ?? DEFAULT_MEMORY
}
