import type { JourneyEntry, Dog } from './demo'
import { getPlaceById } from './places'
import { personalizeGhostText } from '../lib/dogLabels'

export interface JourneyMemoryDetail {
  memorySubtitle: string
  visitCount: number
  dogLoveLine: string
  emotionalRecaps: string[]
  favoriteMoment: string
  whatDogsLoved: string[]
  adventureChips: string[]
  photoUrls: string[]
  memoryMood: string
  adventureType: string
  dogTags: string[]
}

const MEMORY_BY_ENTRY: Record<string, Partial<JourneyMemoryDetail>> = {
  'dog-beach-today': {
    memorySubtitle: 'One of those small days that becomes a favorite.',
    visitCount: 12,
    dogLoveLine: 'Bailey loved this place.',
    emotionalRecaps: [
      'Bailey kept pulling toward the water.',
      'Omi stayed close, like she knew this was a slower day.',
      'Worth remembering.',
    ],
    favoriteMoment: 'Bailey sprinting through the shallows while Omi watched from the sand.',
    whatDogsLoved: ['Shallow water sprints', 'Wide open sand', 'Room to run together'],
    adventureChips: ['Off-leash run', 'Playing in water', 'Loved every second'],
    photoUrls: [
      '/sample-images/dogs-outdoors.jpg',
      '/sample-images/beach.jpg',
      '/sample-images/dog-park.jpg',
    ],
    memoryMood: 'Joyful + tired',
    adventureType: 'Beach',
    dogTags: ['Bailey · high energy', 'Omi · easy pace'],
  },
  'julian-saturday': {
    memorySubtitle: 'A big day worth keeping.',
    visitCount: 2,
    dogLoveLine: 'Bailey loved this place.',
    emotionalRecaps: [
      'New mountain smells everywhere on the drive up.',
      'Bailey led on the trail; Omi found the best patch of shade.',
      'One of those simple perfect days away from the usual loop.',
    ],
    favoriteMoment: 'Both dogs glued to the windows on the way up — tails going before you parked.',
    whatDogsLoved: ['Mountain air', 'New trail smells', 'Cool shade breaks'],
    adventureChips: ['Road trip', 'Found a new spot', 'Just being together'],
    photoUrls: [
      '/sample-images/dogs-outdoors.jpg',
      '/sample-images/road-trip.jpg',
      '/sample-images/trail.jpg',
    ],
    memoryMood: 'Adventurous + calm',
    adventureType: 'Road trip',
    dogTags: ['Bailey · explorer', 'Omi · senior-friendly'],
  },
}

const DEFAULT_MEMORY: JourneyMemoryDetail = {
  memorySubtitle: 'Worth remembering.',
  visitCount: 1,
  dogLoveLine: 'Your dog loved this place.',
  emotionalRecaps: [
    'One of those small days that becomes a favorite.',
    'A good outing worth keeping.',
  ],
  favoriteMoment: 'The quiet middle of the outing — when everything felt easy.',
  whatDogsLoved: ['New smells', 'Being together', 'A familiar route done differently'],
  adventureChips: ['Loved every second', 'Just being together'],
  photoUrls: [],
  memoryMood: 'Warm + steady',
  adventureType: 'Adventure',
  dogTags: ['Your pack'],
}

export function getJourneyMemoryDetail(
  entry: JourneyEntry,
  dogs: Dog[] = [],
): JourneyMemoryDetail {
  const base = {
    ...DEFAULT_MEMORY,
    ...(MEMORY_BY_ENTRY[entry.id] ?? {}),
  }

  const place = entry.placeId ? getPlaceById(entry.placeId) : undefined

  if (entry.emotionalLine) {
    base.emotionalRecaps = [
      entry.emotionalLine,
      ...(entry.recapLabels?.length
        ? [`You tagged it: ${entry.recapLabels.join(' · ')}.`]
        : []),
    ]
  }

  if (entry.favoriteMoment) {
    base.favoriteMoment = entry.favoriteMoment
  }

  if (entry.recapLabels?.length) {
    base.adventureChips = entry.recapLabels
    base.whatDogsLoved = entry.recapLabels.map((label) => {
      if (label.endsWith('led the way')) return 'Leading the route'
      if (label.endsWith('set the pace')) return 'Setting a slower rhythm'
      if (label === 'Found a new smell') return 'Deep sniff time'
      return label
    })
  }

  if (entry.memoryMood) {
    base.memoryMood = entry.memoryMood
  }

  if (entry.durationLabel) {
    base.memorySubtitle = `${entry.durationLabel} · ${base.memorySubtitle}`
  }

  if (place) {
    base.adventureType = place.category
  }

  if (entry.photoUrls?.length) {
    base.photoUrls = [...entry.photoUrls]
  } else {
    base.photoUrls = []
  }

  base.dogTags = entry.dogTags ?? base.dogTags

  if (entry.magicLine && !entry.emotionalLine) {
    base.emotionalRecaps = [entry.magicLine, ...base.emotionalRecaps.slice(0, 2)]
  }

  if (dogs.length > 0) {
    return {
      ...base,
      dogLoveLine: personalizeGhostText(base.dogLoveLine, dogs),
      emotionalRecaps: base.emotionalRecaps.map((line) =>
        personalizeGhostText(line, dogs),
      ),
      favoriteMoment: personalizeGhostText(base.favoriteMoment, dogs),
      dogTags: base.dogTags.map((tag) => personalizeGhostText(tag, dogs)),
      whatDogsLoved: base.whatDogsLoved.map((item) => personalizeGhostText(item, dogs)),
    }
  }

  return base
}
