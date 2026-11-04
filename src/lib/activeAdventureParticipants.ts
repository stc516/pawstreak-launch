import type { ActiveAdventure, AppState, Dog } from '../data/demo'
import { getPackDisplayName } from './dogLabels'
import { getProfileDogs } from './profileDisplay'

/**
 * A completed two-dog profile does not mean both dogs joined this outing.
 * Explicit selectedDogIds take precedence over the older single dogId field.
 * Adventures saved before dog selection was introduced retain pack-wide display.
 */
export function getActiveAdventureParticipants(
  state: AppState,
  adventure: ActiveAdventure | null,
): Dog[] {
  const profileDogs = getProfileDogs(state)
  if (!adventure) return []

  const selectedIds = adventure.selectedDogIds?.length
    ? adventure.selectedDogIds
    : adventure.dogId
      ? [adventure.dogId]
      : null

  if (!selectedIds) return profileDogs
  return profileDogs.filter((dog) => selectedIds.includes(dog.id))
}

export function getActiveAdventureParticipantLabel(dogs: Dog[]): string {
  return dogs.length ? getPackDisplayName(dogs) : 'your dog'
}

export function getActiveAdventureOutLabel(dogs: Dog[]): string {
  if (!dogs.length) return 'Adventure in progress'
  if (dogs.length === 1) return `${dogs[0].name} is out`
  if (dogs.length > 2) return `${dogs.length} dogs are out`
  return `${getPackDisplayName(dogs)} are out`
}
