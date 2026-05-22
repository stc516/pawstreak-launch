import type { ReactNode } from 'react'
import type { TabId } from '../data/demo'
import { BottomNav } from './BottomNav'
import { DemoFeedbackCapture } from './DemoFeedbackCapture'
import { StatusBar } from './StatusBar'

interface AppShellProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  isDemoMode?: boolean
  children: ReactNode
}

export function AppShell({
  activeTab,
  onTabChange,
  isDemoMode = false,
  children,
}: AppShellProps) {
  return (
    <div className="app-viewport">
      <div className={`app-shell${isDemoMode ? ' app-shell--demo' : ''}`}>
        <StatusBar />
        {isDemoMode ? (
          <div className="demo-mode-bar" aria-label="Demo preview mode">
            <span className="demo-pill">Demo</span>
          </div>
        ) : null}
        <main className="scroll">{children}</main>
        {isDemoMode ? <DemoFeedbackCapture /> : null}
        <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
      </div>
    </div>
  )
}
