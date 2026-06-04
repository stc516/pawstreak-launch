import type { ActiveAdventure, AppState } from '../data/demo'
import { getActiveAdventureElapsedSeconds } from '../data/demo'

export type ActiveAdventureView = 'minimized' | 'focused'

export function resolveActiveAdventureView(
  adventure: ActiveAdventure | null,
  view: ActiveAdventureView | null | undefined,
): ActiveAdventureView | null {
  if (!adventure) return null
  if (view === 'minimized' || view === 'focused') return view
  return adventure.started ? 'minimized' : 'focused'
}

export function showActiveAdventureBanner(
  adventure: ActiveAdventure | null,
  view: ActiveAdventureView | null,
): boolean {
  return Boolean(adventure?.started && view === 'minimized')
}

export function shouldShowFocusedAdventure(
  adventure: ActiveAdventure | null,
  view: ActiveAdventureView | null,
): boolean {
  return Boolean(adventure && view === 'focused')
}

export function viewForNewAdventure(adventure: ActiveAdventure): ActiveAdventureView {
  return adventure.started ? 'minimized' : 'focused'
}

export function hasMeaningfulAdventureProgress(state: AppState): boolean {
  if (!state.activeAdventure) return false
  if (state.adventurePhotos.some(Boolean)) return true
  const adventure = state.activeAdventure
  if (adventure.started && adventure.startedAt) {
    return getActiveAdventureElapsedSeconds(adventure) > 30
  }
  return false
}

export function clearActiveAdventureFields(): Pick<
  AppState,
  'activeAdventure' | 'activeAdventureView' | 'adventurePhotos'
> {
  return {
    activeAdventure: null,
    activeAdventureView: null,
    adventurePhotos: ['', '', ''],
  }
}
