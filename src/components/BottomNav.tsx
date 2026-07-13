import type { TabId } from '../data/demo'
import { getVisibleNavTabs } from '../lib/liveProductFeatures'

interface BottomNavProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  className?: string
  mode?: 'app' | 'demo'
}

const TAB_META: Record<TabId, { label: string; icon: string }> = {
  home: { label: 'Today', icon: 'ti-home' },
  plan: { label: 'Explore', icon: 'ti-map' },
  journey: { label: 'Journey', icon: 'ti-compass' },
  community: { label: 'Community', icon: 'ti-users' },
  milestones: { label: 'Challenges', icon: 'ti-trophy' },
  rewards: { label: 'Rewards', icon: 'ti-medal' },
  achievements: { label: 'Achievements', icon: 'ti-medal' },
  profile: { label: 'Pack', icon: 'ti-paw' },
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
