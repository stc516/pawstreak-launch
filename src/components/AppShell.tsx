import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { TabId } from '../data/demo'
import { LIVE_PRODUCT } from '../lib/liveProductFeatures'
import { BottomNav } from './BottomNav'
import { StatusBar } from './StatusBar'

interface AppShellProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  isDemoMode?: boolean
  showNavigation?: boolean
  activeAdventureBanner?: ReactNode
  scrollKey?: string
  children: ReactNode
}

export function AppShell({
  activeTab,
  onTabChange,
  isDemoMode = false,
  showNavigation = true,
  activeAdventureBanner = null,
  scrollKey,
  children,
}: AppShellProps) {
  const scrollRef = useRef<HTMLElement | null>(null)
  const [navTapCount, setNavTapCount] = useState(0)
  const hasActiveBanner = Boolean(activeAdventureBanner)

  useEffect(() => {
    const scrollEl = scrollRef.current
    if (!scrollEl) return

    scrollEl.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [activeTab, scrollKey, navTapCount])

  const handleTabChange = (tab: TabId) => {
    setNavTapCount((current) => current + 1)
    onTabChange(tab)
  }

  return (
    <div className="app-viewport">
      <div
        className={`app-shell${isDemoMode ? ' app-shell--demo' : ''}${hasActiveBanner ? ' app-shell--active-adventure' : ''}`}
      >
        {LIVE_PRODUCT.statusBarChrome ? <StatusBar /> : null}
        {isDemoMode ? (
          <div className="demo-mode-bar" aria-label="Demo preview mode">
            <span className="demo-pill">Demo</span>
          </div>
        ) : null}
        <main
          ref={scrollRef}
          className={`scroll${activeTab === 'home' ? ' scroll--home' : ''}`}
        >
          {children}
        </main>
        {showNavigation ? (
          <footer className="app-shell-footer">
            {activeAdventureBanner}
            <BottomNav
              activeTab={activeTab}
              onTabChange={handleTabChange}
              mode={isDemoMode ? 'demo' : 'app'}
            />
          </footer>
        ) : null}
      </div>
    </div>
  )
}
