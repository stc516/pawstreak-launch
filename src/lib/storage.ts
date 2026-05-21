import { defaultAppState, type AppState } from '../data/demo'

const STORAGE_KEY = 'pawstreak:app'

export function loadAppState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return defaultAppState
    }
    return { ...defaultAppState, ...JSON.parse(raw) } as AppState
  } catch {
    return defaultAppState
  }
}

export function saveAppState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}
