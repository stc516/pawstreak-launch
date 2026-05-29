import type { TabId } from '../data/demo'
import { getVisibleNavTabs } from '../lib/liveProductFeatures'

interface BottomNavProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  className?: string
  mode?: 'app' | 'demo'
}

const TAB_META: Record<TabId, { label: string; icon: string }> = {
  home: { label: 'Home', icon: 'ti-home' },
  plan: { label: 'Plan', icon: 'ti-compass' },
  journey: { label: 'Journey', icon: 'ti-map-2' },
  community: { label: 'Community', icon: 'ti-users' },
  milestones: { label: 'Milestones', icon: 'ti-trophy' },
  profile: { label: 'Profile', icon: 'ti-trophy' },
}

export function BottomNav({
  activeTab,
  onTabChange,
  className = 'bnav',
  mode = 'app',
}: BottomNavProps) {
  const tabs = getVisibleNavTabs(mode)

  return (
    <nav className={className}>
      {tabs.map((tab) => {
        const isProfileTab = tab === 'milestones'
        const isActive =
          activeTab === tab || (isProfileTab && activeTab === 'profile')
        const label =
          isProfileTab && activeTab === 'profile' ? 'Profile' : TAB_META[tab].label

        return (
          <button
            key={tab}
            type="button"
            className={`ni tap-target${isActive ? ' on' : ''}`}
            onClick={() => {
              if (isProfileTab && activeTab === 'profile') return
              onTabChange(tab)
            }}
          >
            <i className={`ti ${TAB_META[tab].icon}`} aria-hidden="true" />
            <span>{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
