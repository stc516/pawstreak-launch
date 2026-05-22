import type { AppState, Dog, DogMode, RecapChip } from '../data/demo'
import {
  getDogDisplayName,
  getPackDisplayName,
  personalizeGhostText,
} from './dogLabels'
import { buildAdventureRecapOptions, bondSubtitleFor, journeyTitleFor } from './onboardingProfile'

function buildMoodRecapOptions(dogs: Dog[]): RecapChip[] {
  const options: RecapChip[] = [
    { id: 'loved-every-second', label: 'Loved every second' },
    { id: 'needed-a-break', label: 'Needed a break' },
    { id: 'met-new-friends', label: 'Met new friends' },
    { id: 'found-a-new-spot', label: 'Found a new spot' },
  ]

  if (dogs.length >= 2) {
    options.push({
      id: 'dog2-pace',
      label: `${dogs[1].name} set the pace`,
    })
  } else if (dogs.length === 1) {
    options.push({
      id: 'dog-pace',
      label: `${dogs[0].name} set the pace`,
    })
  } else {
    options.push({ id: 'pace', label: 'They set the pace' })
  }

  return options
}

function buildDogModeOptions(dogs: Dog[]): { id: DogMode; label: string }[] {
  if (dogs.length <= 1) {
    return [{ id: 'both', label: dogs.length === 1 ? dogs[0].name : 'Your dog' }]
  }

  return [
    { id: 'both', label: 'Both' },
    { id: 'bailey', label: `${dogs[0].name} only` },
    { id: 'omi', label: `${dogs[1].name} only` },
  ]
}

function packTagFor(dogs: Dog[]): string {
  if (dogs.length === 0) return 'Your pack'
  if (dogs.length === 1) return dogs[0].name
  return getPackDisplayName(dogs)
}

function bothTagFor(dogs: Dog[]): string {
  if (dogs.length === 0) return 'Your pack'
  if (dogs.length === 1) return dogs[0].name
  return 'Both dogs'
}

export function personalizeAppContentForDogs(
  current: AppState,
  dogs: Dog[],
): Partial<AppState> {
  const lead = getDogDisplayName(dogs, 0)

  return {
    hasUserDogProfile: true,
    journeyTitle: journeyTitleFor(dogs),
    bondLevel: {
      ...current.bondLevel,
      subtitle: bondSubtitleFor(dogs, current.adventureCount, current.placeCount),
    },
    adventureRecapOptions: buildAdventureRecapOptions(dogs),
    moodRecapOptions: buildMoodRecapOptions(dogs),
    dogModeOptions: buildDogModeOptions(dogs),
    flashback: {
      title: current.flashback.title,
      subtitle: personalizeGhostText(
        dogs.length === 1
          ? `${lead}'s first visit to Torrey Pines. You've been back 6 times since.`
          : dogs.length >= 2
            ? current.flashback.subtitle
            : 'Your first visit to Torrey Pines. You have been back 6 times since.',
        dogs,
      ),
    },
    journeyEntries: current.journeyEntries.map((entry) => ({
      ...entry,
      tags: entry.tags.map((tag) => {
        if (tag === 'Bailey + Omi') return packTagFor(dogs)
        if (tag === 'Both dogs') return bothTagFor(dogs)
        return personalizeGhostText(tag, dogs)
      }),
      magicLine: entry.magicLine
        ? personalizeGhostText(entry.magicLine, dogs)
        : entry.magicLine,
    })),
    recentAdventures: current.recentAdventures.map((adventure) => ({
      ...adventure,
      memoryLine: adventure.memoryLine
        ? personalizeGhostText(adventure.memoryLine, dogs)
        : adventure.memoryLine,
    })),
    monthlyPlanOptions: current.monthlyPlanOptions.map((option) =>
      option.id === 'curated'
        ? {
            ...option,
            subtitle:
              dogs.length === 1
                ? `Based on what ${lead} loves most`
                : dogs.length >= 2
                  ? 'Based on what they love most'
                  : 'Based on what your dog loves most',
          }
        : option.id === 'random'
          ? {
              ...option,
              subtitle:
                dogs.length === 1
                  ? `Surprise ${lead} every time`
                  : 'Surprise them every time',
            }
          : option,
    ),
  }
}
