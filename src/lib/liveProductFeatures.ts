import type { AppMode, TabId } from '../data/demo'

/** Live product gates — hide UI for features that are not fully shipped. */
export const LIVE_PRODUCT = {
  packAccess: false,
  calendarPresetPlan: false,
  bondProgressBar: false,
  statusBarChrome: false,
} as const

const NAV_TAB_ORDER: TabId[] = [
  'home',
  'plan',
  'journey',
  'milestones',
  'achievements',
  'community',
]

export function isNavTabVisible(tab: TabId, _mode: AppMode = 'app'): boolean {
  return NAV_TAB_ORDER.includes(tab)
}

export function getVisibleNavTabs(mode: AppMode = 'app'): TabId[] {
  return NAV_TAB_ORDER.filter((tab) => isNavTabVisible(tab, mode))
}

export function getDefaultNavTab(): TabId {
  return 'home'
}
