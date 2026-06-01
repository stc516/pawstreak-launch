import type { TabId } from '../data/demo'
import { getVisibleNavTabs } from '../lib/liveProductFeatures'

interface BottomNavProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  className?: string
  mode?: 'app' | 'demo'
}

const TAB_META: Record<
  Exclude<TabId, 'profile'>,
  { label: string; icon: string }
> = {
  home: { label: 'Home', icon: 'ti-home' },
  plan: { label: 'Plan', icon: 'ti-map' },
  journey: { label: 'Journey', icon: 'ti-compass' },
  community: { label: 'Community', icon: 'ti-users' },
  milestones: { label: 'Challenges', icon: 'ti-trophy' },
  achievements: { label: 'Achievements', icon: 'ti-medal' },
}

export function BottomNav({
  activeTab,
  onTabChange,
  className = 'bnav bnav--stitch bnav--six',
  mode = 'app',
}: BottomNavProps) {
  const tabs = getVisibleNavTabs(mode)

  return (
    <nav className={className} aria-label="Main navigation">
      {tabs.map((tab) => {
        if (tab === 'profile') return null
        const isActive = activeTab === tab
        const meta = TAB_META[tab]

        return (
          <button
            key={tab}
            type="button"
            className={`ni tap-target${isActive ? ' on' : ''}`}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onTabChange(tab)}
          >
            <i className={`ti ${meta.icon}`} aria-hidden="true" />
            <span>{meta.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
