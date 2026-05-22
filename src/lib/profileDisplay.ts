import type { AppState, Dog } from '../data/demo'
import {
  getDogPossessive,
  getPackDisplayName,
  isDefaultDemoDogs,
} from './dogLabels'
import { bondSubtitleFor, journeyTitleFor } from './onboardingProfile'

export function getProfileDogs(state: AppState): Dog[] {
  if (!state.onboardingComplete) return []
  return state.dogs
}

export function usesDemoDogNames(state: AppState): boolean {
  return state.onboardingComplete && isDefaultDemoDogs(state.dogs) && !state.hasUserDogProfile
}

export function getDisplayDogLabel(state: AppState): string {
  if (!state.onboardingComplete) return 'your dog'
  if (usesDemoDogNames(state)) return getPackDisplayName(state.dogs)
  if (state.dogs.length === 0) return 'your dog'
  return getPackDisplayName(state.dogs)
}

export function getDisplayDogPossessive(state: AppState): string {
  if (!state.onboardingComplete) return "your dog's"
  if (usesDemoDogNames(state)) return getDogPossessive(state.dogs)
  if (state.dogs.length === 0) return "your dog's"
  return getDogPossessive(state.dogs)
}

export function getDisplayJourneyTitle(state: AppState): string {
  if (!state.onboardingComplete) return 'Your Journey'
  if (usesDemoDogNames(state)) return state.journeyTitle
  if (state.dogs.length === 0) return 'Your Journey'
  return journeyTitleFor(state.dogs)
}

export function getDisplayBondSubtitle(state: AppState): string {
  if (!state.onboardingComplete) {
    return `${state.adventureCount} adventures · ${state.placeCount} places`
  }
  if (usesDemoDogNames(state)) return state.bondLevel.subtitle
  if (state.dogs.length === 0) {
    return `${state.adventureCount} adventures · ${state.placeCount} places`
  }
  return bondSubtitleFor(state.dogs, state.adventureCount, state.placeCount)
}

export function getDisplayDogsAreOutLabel(state: AppState): string {
  if (!state.onboardingComplete || state.dogs.length === 0) return 'Your pack is out'
  if (state.dogs.length === 1) return `${state.dogs[0].name} is out`
  return `${getPackDisplayName(state.dogs)} are out`
}

export function shouldPersonalizeContent(state: AppState): boolean {
  return state.onboardingComplete && !usesDemoDogNames(state) && state.dogs.length > 0
}

export function pageHasGhostNames(text: string): boolean {
  const lower = text.toLowerCase()
  return (
    lower.includes('bailey + omi') ||
    /\bbailey\b/.test(lower) ||
    /\bomi\b/.test(lower)
  )
}
