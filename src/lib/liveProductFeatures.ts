import type { AppMode, TabId } from '../data/demo'

/** Live product gates — hide UI for features that are not fully shipped. */
export const LIVE_PRODUCT = {
  communityTab: false,
  packAccess: false,
  calendarPresetPlan: false,
  bondProgressBar: false,
  statusBarChrome: false,
} as const

const NAV_TAB_ORDER: TabId[] = ['home', 'plan', 'journey', 'community', 'milestones']

export function isNavTabVisible(tab: TabId, mode: AppMode = 'app'): boolean {
  if (tab === 'community') {
    if (mode === 'demo') return true
    return LIVE_PRODUCT.communityTab
  }
  return NAV_TAB_ORDER.includes(tab)
}

export function getVisibleNavTabs(mode: AppMode = 'app'): TabId[] {
  return NAV_TAB_ORDER.filter((tab) => isNavTabVisible(tab, mode))
}

export function getDefaultNavTab(): TabId {
  return 'home'
}
