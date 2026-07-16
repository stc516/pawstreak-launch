import type { TabId } from '../data/demo'

export interface ProductTourStep {
  tab: TabId
  eyebrow: string
  title: string
  copy: string
  icon: string
}

export const PRODUCT_TOUR_STEPS: ProductTourStep[] = [
  {
    tab: 'home',
    eyebrow: 'Your launchpad',
    title: 'Today starts with one tap.',
    copy: 'Start a quick walk, pick something new, or jump back into training from here.',
    icon: 'ti-bolt',
  },
  {
    tab: 'plan',
    eyebrow: 'Choose the chaos',
    title: 'Explore adventures near you.',
    copy: 'Browse real places, spin up an idea, or add the weird little outing only your pack would understand.',
    icon: 'ti-map-2',
  },
  {
    tab: 'home',
    eyebrow: 'While you are out',
    title: 'Start it. Live it. Save it.',
    copy: 'Keep the adventure active, add a photo or note, then finish to turn the outing into a memory.',
    icon: 'ti-paw',
  },
  {
    tab: 'journey',
    eyebrow: 'The good stuff stays',
    title: 'Relive every real memory.',
    copy: 'Journey holds the photos, notes, and places you actually saved—then makes them ready to share.',
    icon: 'ti-photo-heart',
  },
  {
    tab: 'plan',
    eyebrow: 'Make it sticky',
    title: 'Schedule training and adventures.',
    copy: 'Calendar alerts and morning or evening reminders are optional. PawStreak always asks before turning them on.',
    icon: 'ti-calendar-heart',
  },
  {
    tab: 'profile',
    eyebrow: 'Your pack, your rules',
    title: 'Make PawStreak yours.',
    copy: 'Manage dogs, photos, location, pack access, and reminder preferences in Pack.',
    icon: 'ti-settings-heart',
  },
]
