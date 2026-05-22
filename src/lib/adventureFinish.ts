import type { Dog } from '../data/demo'
import { dogNamesLabel } from '../data/demo'

export interface AdventureFinishPayload {
  recapLabels: string[]
}

const STATIC_EMOTIONAL_LINES: Record<string, string> = {
  'Loved every second': 'One of those small days that becomes a favorite.',
  'Needed a slower pace': 'Stayed close, like they knew this was a slower day.',
  'Met new friends': 'A friendly hello turned the whole walk around.',
  'Found a new smell': 'Stopped at the same patch — worth remembering.',
}

function lineForLedWay(label: string): string {
  const name = label.replace(/ led the way$/, '')
  return `${name} kept pulling forward, tail high the whole time.`
}

function lineForSetPace(label: string, dogs: Dog[]): string {
  const name = label.replace(/ set the pace$/, '')
  if (name && name !== label) {
    return `${name} set the pace today — slow sniff, steady tail.`
  }
  const fallback = dogs[1]?.name ?? dogs[0]?.name ?? 'They'
  return `${fallback} set the pace today — slow sniff, steady tail.`
}

export function buildEmotionalMemoryLine(
  recapLabels: string[],
  dogs: Dog[] = [],
): string {
  for (const label of recapLabels) {
    if (label.endsWith('led the way')) return lineForLedWay(label)
    if (label.endsWith('set the pace')) return lineForSetPace(label, dogs)

    const staticLine = STATIC_EMOTIONAL_LINES[label]
    if (staticLine) {
      if (label === 'Needed a slower pace' && dogs.length === 1) {
        return `${dogs[0].name} stayed close, like they knew this was a slower day.`
      }
      if (label === 'Found a new smell' && dogs.length === 1) {
        return `${dogs[0].name} stopped at one patch and forgot the rest of the world.`
      }
      if (label === 'Found a new smell' && dogs.length >= 2) {
        return `${dogNamesLabel(dogs)} stopped at the same patch — worth remembering.`
      }
      return staticLine
    }
  }
  return 'Worth remembering.'
}

export function buildFavoriteMoment(recapLabels: string[], dogs: Dog[] = []): string {
  for (const label of recapLabels) {
    if (label.endsWith('led the way')) {
      const name = label.replace(/ led the way$/, '')
      return `${name} sprinting ahead, then checking back like they wanted you to see it too.`
    }
    if (label.endsWith('set the pace')) {
      const name = label.replace(/ set the pace$/, '') || dogs[0]?.name || 'They'
      return `${name} finding the best sniff spot and settling in for a long look around.`
    }
  }

  if (recapLabels.includes('Found a new smell')) {
    return dogs.length >= 2
      ? 'That one corner where both dogs stopped and forgot the rest of the world.'
      : `${dogs[0]?.name ?? 'They'} found one smell worth staying for.`
  }
  if (recapLabels.includes('Met new friends')) {
    return 'The moment tails started wagging at the same time.'
  }
  return 'The quiet middle of the outing — when everything felt easy.'
}
