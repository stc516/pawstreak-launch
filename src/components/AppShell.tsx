import type { ReactNode } from 'react'
import type { TabId } from '../data/demo'
import { LIVE_PRODUCT } from '../lib/liveProductFeatures'
import { BottomNav } from './BottomNav'
import { DemoFeedbackCapture } from './DemoFeedbackCapture'
import { StatusBar } from './StatusBar'

interface AppShellProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  isDemoMode?: boolean
  showNavigation?: boolean
  activeAdventureBanner?: ReactNode
  children: ReactNode
}

export function AppShell({
  activeTab,
  onTabChange,
  isDemoMode = false,
  showNavigation = true,
  activeAdventureBanner = null,
  children,
}: AppShellProps) {
  const hasActiveBanner = Boolean(activeAdventureBanner)
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
        <main className={`scroll${activeTab === 'home' ? ' scroll--home' : ''}`}>{children}</main>
        {showNavigation ? (
          <footer className="app-shell-footer">
            {activeAdventureBanner}
            {isDemoMode ? (
              <div className="demo-feedback-bar">
                <DemoFeedbackCapture />
              </div>
            ) : null}
            <BottomNav
              activeTab={activeTab}
              onTabChange={onTabChange}
              mode={isDemoMode ? 'demo' : 'app'}
            />
          </footer>
        ) : null}
      </div>
    </div>
  )
}
