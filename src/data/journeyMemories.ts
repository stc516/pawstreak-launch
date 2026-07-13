import type { JourneyEntry, Dog } from './demo'
import { getPlaceById } from './places'

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

export function getJourneyMemoryDetail(
  entry: JourneyEntry,
  dogs: Dog[] = [],
): JourneyMemoryDetail {
  const place = entry.placeId ? getPlaceById(entry.placeId) : undefined
  const recapLabels = entry.recapLabels ?? []
  const whatDogsLoved = recapLabels.map((label) => {
      if (label.endsWith('led the way')) return 'Leading the route'
      if (label.endsWith('set the pace')) return 'Setting a slower rhythm'
      if (label === 'Found a new smell') return 'Deep sniff time'
      return label
    })
  const dogLabel = dogs.length > 0 ? dogs.map((dog) => dog.name).join(' + ') : 'Your dog'
  const emotionalRecaps = [entry.emotionalLine, entry.magicLine, entry.userNotes]
    .filter((line): line is string => Boolean(line?.trim()))

  return {
    memorySubtitle: entry.durationLabel ? `${entry.durationLabel} · Saved to the Journey` : 'Saved to the Journey',
    visitCount: 1,
    dogLoveLine: `${dogLabel}'s day, saved.`,
    emotionalRecaps: emotionalRecaps.length > 0 ? [...new Set(emotionalRecaps)] : ['No recap was added.'],
    favoriteMoment: entry.favoriteMoment ?? entry.magicLine ?? 'No favorite moment was added.',
    whatDogsLoved,
    adventureChips: recapLabels,
    photoUrls: entry.photoUrls?.filter(Boolean) ?? [],
    memoryMood: entry.memoryMood ?? 'Not added',
    adventureType: place?.category ?? 'Adventure',
    dogTags: entry.dogTags ?? dogs.map((dog) => dog.name),
  }
}
