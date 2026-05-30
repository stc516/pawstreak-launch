/** Curated local events — replace with API/regional feed later. */
export interface PlanEvent {
  id: string
  title: string
  schedule: string
  location: string
  emoji: string
}

export const PLAN_EVENTS: PlanEvent[] = [
  {
    id: 'dog-beach-meetup',
    title: 'Sunrise pack walk',
    schedule: 'Sat · 8:00 AM',
    location: 'Dog Beach, Ocean Beach',
    emoji: '🌅',
  },
  {
    id: 'puppy-social',
    title: 'Puppy social hour',
    schedule: 'Sun · 10:00 AM',
    location: 'Fiesta Island',
    emoji: '🐶',
  },
  {
    id: 'recall-class',
    title: 'Recall basics class',
    schedule: 'Wed · 6:00 PM',
    location: 'Balboa Park · 45 min',
    emoji: '🎓',
  },
]
