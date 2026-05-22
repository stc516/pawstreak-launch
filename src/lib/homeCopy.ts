import type { Dog } from '../data/demo'
import type { Place, PlaceCategory } from '../types/place'
import { getPackDisplayName } from './dogLabels'

function dogTarget(dogs: Dog[]): string {
  if (dogs.length === 1) return dogs[0].name
  if (dogs.length >= 2) return 'your pack'
  return 'your dog'
}

function namedTarget(dogLabel: string, dogCount: number): string {
  if (dogCount === 1 && dogLabel !== 'your dog') return dogLabel
  if (dogCount >= 2 && dogLabel !== 'your pack' && dogLabel !== 'your dog') {
    return dogLabel
  }
  return 'them'
}

export function getHomeKicker(dogLabel: string, dogCount: number): string {
  if (dogCount >= 1 && dogLabel !== 'your dog' && dogLabel !== 'your pack') {
    return `${dogLabel}'s next good memory starts here.`
  }
  return 'Small adventures count.'
}

export function getHomeHeadline(dogLabel: string, dogCount: number): string {
  const target = namedTarget(dogLabel, dogCount)
  if (target === 'them') return 'What kind of day are we giving them?'
  return `What kind of day are we giving ${target}?`
}

export function getHomeIntroSub(): string {
  return 'Pick a vibe. Your city is out there.'
}

export function getHeroEyebrow(dogLabel: string, dogCount: number): string {
  if (dogCount === 1 && dogLabel !== 'your dog') {
    return `Today's pick for ${dogLabel}`
  }
  if (dogCount >= 2 && dogLabel !== 'your pack') {
    return `Today's pick for ${dogLabel}`
  }
  return "Today's pick"
}

export function getHeroCuratedLabel(place: Place, dogs: Dog[]): string {
  const target = dogTarget(dogs)

  if (place.popularNow) return 'Popular with the pack right now.'
  if (place.energyLevel === 'High') {
    return place.category === 'Road trip'
      ? `Big adventure for ${target} today.`
      : `Big adventure for ${target} today.`
  }
  if (place.energyLevel === 'Low') return `Easy win for ${target} today.`
  if (place.featured) return `Perfect right now for ${target}.`
  if (place.category === 'Coffee' || place.category === 'Neighborhood') {
    return `Easy win for ${target} today.`
  }
  return `Worth getting out for ${target} today.`
}

const FIT_LINES: Partial<Record<PlaceCategory, (lead: string) => string>> = {
  Beach: (lead) => `Close by, off-leash friendly, and room for ${lead} to run.`,
  Trail: (lead) => `Fresh air, new smells, and a pace ${lead} can settle into.`,
  Coffee: () => 'Patio-friendly stop — close by and easy to fit in today.',
  'Dog park': (lead) => `Room to roam and meet the pack — ${lead} will love the energy.`,
  Park: (lead) => `Shaded paths and space to sniff — a calmer win for ${lead}.`,
  Brewery: () => 'Dog-friendly patio, close by, and low-pressure for a short outing.',
  Gardens: (lead) => `Quiet loops and new scents — a slower-paced day for ${lead}.`,
  'Road trip': (lead) => `Worth the drive when ${lead} needs a bigger day out.`,
  Neighborhood: () => 'Close by, dog-friendly, and enough room to sniff.',
}

export function getHeroFitLine(place: Place, dogs: Dog[]): string {
  const lead =
    dogs.length === 1
      ? dogs[0].name
      : dogs.length >= 2
        ? getPackDisplayName(dogs)
        : 'them'

  const template = FIT_LINES[place.category]
  if (template) return template(lead)
  return place.whyDogsLoveIt
}

export function getMemoryWarmLabel(index: number): string {
  if (index === 0) return 'Last good day out'
  if (index === 1) return 'Worth remembering'
  return 'A place they loved'
}

export function getPackEnergyNote(locationLabel: string): string {
  if (locationLabel && locationLabel !== 'Your area') {
    return `Your city is out there — ${locationLabel}.`
  }
  return 'Your city is out there.'
}
