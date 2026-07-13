import type { AppMode, TabId } from '../data/demo'

/** Live product gates — hide UI for features that are not fully shipped. */
export const LIVE_PRODUCT = {
  packAccess: true,
  calendarPresetPlan: false,
  bondProgressBar: false,
  statusBarChrome: false,
} as const

const NAV_TAB_ORDER: TabId[] = [
  'home',
  'plan',
  'journey',
  'profile',
]

export function isNavTabVisible(tab: TabId, mode: AppMode = 'app'): boolean {
  void mode
  return NAV_TAB_ORDER.includes(tab)
}

export function getVisibleNavTabs(mode: AppMode = 'app'): TabId[] {
  return NAV_TAB_ORDER.filter((tab) => isNavTabVisible(tab, mode))
}

export function getDefaultNavTab(): TabId {
  return 'home'
}
