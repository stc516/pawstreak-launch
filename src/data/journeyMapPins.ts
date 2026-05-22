import type { JourneyEntry } from './demo'

export type JourneyMapFilterId =
  | 'all'
  | 'beach'
  | 'trail'
  | 'road-trips'
  | 'parks'
  | 'cafes'

export interface JourneyMapPin {
  id: string
  label: string
  category: JourneyMapFilterId
  top: string
  left: string
  entryId?: string
}

const SEEDED_PIN_DEFS: Omit<JourneyMapPin, 'entryId'>[] = [
  { id: 'pin-torrey', label: 'Torrey Pines', category: 'trail', top: '28%', left: '22%' },
  { id: 'pin-balboa', label: 'Balboa Park', category: 'parks', top: '52%', left: '38%' },
  { id: 'pin-lestats', label: "Lestat's Coffee", category: 'cafes', top: '64%', left: '58%' },
  { id: 'pin-coronado', label: 'Coronado Beach', category: 'beach', top: '72%', left: '24%' },
  { id: 'pin-julian', label: 'Julian', category: 'road-trips', top: '18%', left: '68%' },
]

const SEEDED_PIN_ENTRY_IDS: Record<string, string> = {
  'pin-torrey': 'torrey-pines-tuesday',
  'pin-balboa': 'balboa-park-sunday',
  'pin-lestats': 'lestats-coffee-monday',
  'pin-coronado': 'dog-beach-today',
  'pin-julian': 'julian-saturday',
}

const GHOST_PIN_PREVIEWS: Record<
  string,
  { place: string; date: string; magicLine: string }
> = {
  'pin-torrey': {
    place: 'Torrey Pines State Reserve',
    date: 'Example trail day',
    magicLine: 'Ridge walks and ocean views — a classic San Diego trail.',
  },
  'pin-balboa': {
    place: 'Balboa Park',
    date: 'Example park stroll',
    magicLine: 'Fountains, gardens, and a golden-hour loop together.',
  },
  'pin-lestats': {
    place: "Lestat's Coffee House",
    date: 'Example patio hang',
    magicLine: 'Slow coffee mornings that become weekly rituals.',
  },
  'pin-coronado': {
    place: 'Coronado Beach',
    date: 'Example beach day',
    magicLine: 'Wide sand, gentle waves, and room to sprint.',
  },
  'pin-julian': {
    place: 'Julian Day Trip',
    date: 'Example road trip',
    magicLine: 'Mountain air, apple pie stops, and a big day out.',
  },
}

function categoryForEntry(entry: JourneyEntry): JourneyMapFilterId {
  const tagText = entry.tags.join(' ').toLowerCase()
  if (tagText.includes('road trip')) return 'road-trips'
  if (tagText.includes('beach')) return 'beach'
  if (tagText.includes('trail')) return 'trail'
  if (tagText.includes('park')) return 'parks'
  if (tagText.includes('coffee') || tagText.includes('cafe')) return 'cafes'
  return 'all'
}

export function getGhostPinPreview(pinId: string): {
  place: string
  date: string
  magicLine: string
} {
  return (
    GHOST_PIN_PREVIEWS[pinId] ?? {
      place: 'Future adventure',
      date: 'Example pin',
      magicLine: 'Your map fills in one outing at a time.',
    }
  )
}

export function buildJourneyMapPins(entries: JourneyEntry[]): JourneyMapPin[] {
  const entryIds = new Set(entries.map((entry) => entry.id))
  const seededEntryIds = new Set(Object.values(SEEDED_PIN_ENTRY_IDS))

  const entryPins = entries
    .filter((entry) => !seededEntryIds.has(entry.id))
    .map((entry, index) => {
      const positions = [
        { top: '34%', left: '46%' },
        { top: '58%', left: '72%' },
        { top: '42%', left: '18%' },
      ]

      return {
        id: `entry-${entry.id}`,
        label: entry.place,
        category: categoryForEntry(entry),
        top: positions[index % positions.length]?.top ?? '50%',
        left: positions[index % positions.length]?.left ?? '50%',
        entryId: entry.id,
      }
    })

  const seededPins = SEEDED_PIN_DEFS.map((pin) => {
    const entryId = SEEDED_PIN_ENTRY_IDS[pin.id]
    return {
      ...pin,
      entryId: entryIds.has(entryId) ? entryId : undefined,
    }
  })

  return [...seededPins, ...entryPins]
}

export function filterJourneyMapPins(
  pins: JourneyMapPin[],
  filterId: JourneyMapFilterId,
): JourneyMapPin[] {
  if (filterId === 'all') return pins
  return pins.filter((pin) => pin.category === filterId)
}
