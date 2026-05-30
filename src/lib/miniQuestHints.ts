export interface MiniQuestHint {
  id: string
  title: string
  emoji: string
  task: string
}

const NEIGHBORHOOD_HINTS: MiniQuestHint[] = [
  {
    id: 'sniff-safari',
    title: 'Sniff Safari',
    emoji: '👃',
    task: 'Let your dog stop for 3 good smells.',
  },
  {
    id: 'new-route',
    title: 'New Route',
    emoji: '🗺️',
    task: 'Take one street you usually skip.',
  },
  {
    id: 'flower-inspector',
    title: 'Flower Inspector',
    emoji: '🌸',
    task: 'Find 3 flowers and take 1 photo.',
  },
]

const PLACE_HINTS: MiniQuestHint[] = [
  {
    id: 'flower-inspector',
    title: 'Flower Inspector',
    emoji: '🌸',
    task: 'Find 3 flowers and take 1 photo.',
  },
  {
    id: 'new-route',
    title: 'New Route',
    emoji: '🗺️',
    task: 'Take one path you usually skip.',
  },
  {
    id: 'sniff-safari',
    title: 'Sniff Safari',
    emoji: '👃',
    task: 'Let your dog stop for 3 good smells.',
  },
  {
    id: 'photo-spot',
    title: 'Photo Spot',
    emoji: '📸',
    task: 'Find one view worth remembering and snap it.',
  },
]

function pickHint(hints: MiniQuestHint[], seed: number): MiniQuestHint {
  return hints[seed % hints.length]!
}

export function getMiniQuestHint(options: {
  placeId?: string
  isNeighborhood?: boolean
  date?: Date
}): MiniQuestHint {
  const date = options.date ?? new Date()
  const seed = date.getDay() + (options.placeId?.length ?? 0)
  const hints = options.isNeighborhood || options.placeId === 'neighborhood-walk'
    ? NEIGHBORHOOD_HINTS
    : PLACE_HINTS
  return pickHint(hints, seed)
}
