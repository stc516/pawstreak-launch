import type { Dog } from '../data/demo'
import type { Place, PlaceCategory } from '../types/place'
import { getPackDisplayName } from './dogLabels'

function dogTarget(dogs: Dog[]): string {
  if (dogs.length === 1) return dogs[0].name
  if (dogs.length >= 2) return 'your pack'
  return 'your dog'
}

export function getHomeDogActivityLine(
  dogLabel: string,
  dogCount: number,
  activityLabel: string,
): string {
  if (dogCount >= 2 && dogLabel !== 'your pack' && dogLabel !== 'your dog') {
    return `${dogLabel} · ${activityLabel}`
  }
  if (dogCount === 1 && dogLabel !== 'your dog') {
    return `${dogLabel} · ${activityLabel}`
  }
  return activityLabel
}

export function getHomeKicker(dogLabel: string, dogCount: number): string {
  if (dogCount >= 1 && dogLabel !== 'your dog' && dogLabel !== 'your pack') {
    return `${dogLabel}'s next good memory starts here.`
  }
  return 'Small adventures count.'
}

const HOME_HEADLINE_LINES = [
  'Where are we headed today?',
  'Ready for your next adventure?',
  "Let's make today count.",
  'What memory are we making today?',
  null,
  "Pick today's adventure.",
  'Where should the paws take us?',
] as const

function getRoamHeadline(dogLabel: string, dogCount: number): string {
  if (dogCount >= 2 && dogLabel !== 'your pack' && dogLabel !== 'your dog') {
    return `${dogLabel} are ready to roam.`
  }
  if (dogCount === 1 && dogLabel !== 'your dog') {
    return `${dogLabel} is ready to roam.`
  }
  return 'Your dog is ready to roam.'
}

/** Rotates through seven headlines by day-of-week (stable for the whole day). */
export function getHomeHeadline(
  dogLabel: string,
  dogCount: number,
  date: Date = new Date(),
): string {
  const line = HOME_HEADLINE_LINES[date.getDay()]
  if (line === null) return getRoamHeadline(dogLabel, dogCount)
  return line
}

export function getHomeWelcomeGreeting(date: Date = new Date()): string {
  const hour = date.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function getHomeHeroQuestion(dogLabel: string, dogCount: number): string {
  if (dogCount >= 2 && dogLabel !== 'your pack' && dogLabel !== 'your dog') {
    return `What adventure are ${dogLabel} going on today?`
  }
  if (dogCount === 1 && dogLabel !== 'your dog') {
    return `What adventure is ${dogLabel} going on today?`
  }
  return 'What adventure are you going on today?'
}

export function getHomeIntroSub(locationLabel = 'Your area'): string {
  if (locationLabel && locationLabel !== 'Your area') {
    return `${locationLabel} is out there. Pick today's adventure.`
  }
  return "Pick a vibe. We'll find a good one nearby."
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

  if (place.popularNow) return `Worth an early visit for ${target}.`
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

// Fit copy should inspire an outing without inventing access rules, travel time,
// shade, or other amenities that are not confirmed by a specific listing.
const FIT_LINES: Partial<Record<PlaceCategory, (lead: string) => string>> = {
  Trail: (lead) => `A trail to explore at ${lead}'s pace, with fresh scents along the way.`,
  Coffee: (lead) => `A coffee break with ${lead}; confirm current outdoor dog rules first.`,
  'Dog Park': (lead) => `A new stop for ${lead} to sniff and socialize; check park rules.`,
  Park: (lead) => `Fresh air and new corners for ${lead} to explore.`,
  Brewery: (lead) => `An outdoor stop with ${lead}; confirm the current dog policy.`,
  Gardens: (lead) => `A change of scenery for ${lead}; check dog-access rules first.`,
  'Road trip': (lead) => `A bigger day out together, with something new for ${lead}.`,
  Neighborhood: (lead) => `A familiar walk with something new to sniff for ${lead}.`,
  Patio: (lead) => `A patio stop with ${lead}; confirm current dog access first.`,
  Restaurant: (lead) => `A meal stop with ${lead}; check outdoor dog access first.`,
  Lake: (lead) => `Water views and new scents for ${lead}; follow posted rules.`,
  Campground: (lead) => `A bigger outdoor day for ${lead}; check campground pet rules.`,
  'Scenic Spot': (lead) => `A scenic pause and a new shared memory for ${lead}.`,
}

function getBeachFitLine(place: Place, lead: string): string {
  // A beach category does not imply off-leash access. Only repeat clear
  // catalog labels and remind people that seasonal hours and rules can change.
  const leashRule = place.leashInfo.trim().toLowerCase()
  if (/^on-leash\\.?$/.test(leashRule)) {
    return `Beach air for ${lead}. Listed on-leash—check current access hours.`
  }
  if (/^off-leash(?: area)?\\.?$/.test(leashRule)) {
    return `Beach time for ${lead}. Listed off-leash—check posted rules.`
  }
  return `Beach air for ${lead}. Check current dog-access and leash rules.`
}

export function getHeroFitLine(place: Place, dogs: Dog[]): string {
  const lead =
    dogs.length === 1
      ? dogs[0].name
      : dogs.length >= 2
        ? getPackDisplayName(dogs)
        : 'your dog'

  if (place.category === 'Beach') return getBeachFitLine(place, lead)

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
  void locationLabel
  return 'The pack is out exploring — your turn next.'
}
