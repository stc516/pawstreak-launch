export interface AdventureFinishPayload {
  recapLabels: string[]
}

const RECAP_EMOTIONAL_LINES: Record<string, string> = {
  'Loved every second': 'One of those small days that becomes a favorite.',
  'Needed a slower pace': 'Omi stayed close, like she knew this was a slower day.',
  'Met new friends': 'A friendly hello turned the whole walk around.',
  'Found a new smell': 'Both dogs stopped at the same patch — worth remembering.',
  'Bailey led the way': 'Bailey kept pulling forward, tail high the whole time.',
  'Omi set the pace': 'Omi set the pace today — slow sniff, steady tail.',
}

export function buildEmotionalMemoryLine(recapLabels: string[]): string {
  for (const label of recapLabels) {
    const line = RECAP_EMOTIONAL_LINES[label]
    if (line) return line
  }
  return 'Worth remembering.'
}

export function buildFavoriteMoment(recapLabels: string[]): string {
  if (recapLabels.includes('Bailey led the way')) {
    return 'Bailey sprinting ahead, then checking back like she wanted you to see it too.'
  }
  if (recapLabels.includes('Omi set the pace')) {
    return 'Omi finding the best sniff spot and settling in for a long look around.'
  }
  if (recapLabels.includes('Found a new smell')) {
    return 'That one corner where both dogs stopped and forgot the rest of the world.'
  }
  if (recapLabels.includes('Met new friends')) {
    return 'The moment tails started wagging at the same time.'
  }
  return 'The quiet middle of the outing — when everything felt easy.'
}
