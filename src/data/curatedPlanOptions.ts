export interface CuratedPlanOption {
  id: string
  label: string
  emoji: string
}

export const CURATED_OPTIMIZE_OPTIONS: CuratedPlanOption[] = [
  { id: 'burn-energy', label: 'Burn energy', emoji: '⚡' },
  { id: 'confidence', label: 'Confidence', emoji: '💪' },
  { id: 'behavior', label: 'Better behavior', emoji: '🎯' },
  { id: 'social', label: 'More social time', emoji: '🐕' },
  { id: 'calmer', label: 'Calmer walks', emoji: '🌿' },
  { id: 'bonding', label: 'Bonding time', emoji: '❤️' },
  { id: 'weight', label: 'Weight loss', emoji: '🏃' },
  { id: 'puppy', label: 'Puppy exposure', emoji: '🐾' },
  { id: 'puppy-basics', label: 'Puppy basics', emoji: '🍼' },
  { id: 'weekend', label: 'Weekend adventures', emoji: '🗺️' },
  { id: 'training', label: 'Training consistency', emoji: '📅' },
]

export const CURATED_TIME_OPTIONS: CuratedPlanOption[] = [
  { id: '15min', label: '15 min daily', emoji: '⏱️' },
  { id: '30min', label: '30 min daily', emoji: '🕐' },
  { id: 'hour', label: 'Hour-long adventures', emoji: '🌅' },
  { id: 'weekends', label: 'Weekends only', emoji: '📆' },
  { id: 'flexible', label: 'Flexible', emoji: '✨' },
]

export const CURATED_LOVE_OPTIONS: CuratedPlanOption[] = [
  { id: 'beaches', label: 'Beaches', emoji: '🏖️' },
  { id: 'trails', label: 'Trails', emoji: '🥾' },
  { id: 'cafes', label: 'Cafes', emoji: '☕' },
  { id: 'new-dogs', label: 'New dogs', emoji: '🐶' },
  { id: 'sniffing', label: 'Sniffing', emoji: '👃' },
  { id: 'water', label: 'Water', emoji: '💧' },
  { id: 'road-trips', label: 'Road trips', emoji: '🚗' },
  { id: 'off-leash', label: 'Off-leash time', emoji: '🎾' },
]
