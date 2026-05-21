import type { TabId } from '../data/demo'

const tabs: { id: TabId; label: string; icon: string }[] = [
  { id: 'home', label: 'Home', icon: 'ti-home' },
  { id: 'plan', label: 'Plan', icon: 'ti-compass' },
  { id: 'journey', label: 'Journey', icon: 'ti-map-2' },
  { id: 'community', label: 'Community', icon: 'ti-users' },
  { id: 'milestones', label: 'Milestones', icon: 'ti-trophy' },
]

interface BottomNavProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  className?: string
}

export function BottomNav({ activeTab, onTabChange, className = 'bnav' }: BottomNavProps) {
  return (
    <nav className={className}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`ni${activeTab === tab.id ? ' on' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          <i className={`ti ${tab.icon}`} aria-hidden="true" />
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}
