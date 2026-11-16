/** Reconcile an async memory response only for the dog currently selected. */
export function reconcileSelectedDogMemories<
  Entry,
  State extends {
    activeDogId?: string | null
    journeyEntries: Entry[]
    adventureCount: number
    placeCount: number
  },
>(
  state: State,
  requestedDogId: string,
  entries: Entry[],
  getPlaceKey: (entry: Entry) => string,
): State {
  // Switching A -> B may finish B's fetch first. A must never overwrite B.
  if (state.activeDogId !== requestedDogId) return state

  return {
    ...state,
    journeyEntries: entries,
    adventureCount: entries.length,
    placeCount: new Set(entries.map(getPlaceKey)).size,
  }
}
