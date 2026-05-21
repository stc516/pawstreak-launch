import type { ReactNode } from 'react'
import type { TabId } from '../data/demo'
import { BottomNav } from './BottomNav'
import { StatusBar } from './StatusBar'

interface AppShellProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  children: ReactNode
}

export function AppShell({ activeTab, onTabChange, children }: AppShellProps) {
  return (
    <div className="app-viewport">
      <div className="app-shell">
        <StatusBar />
        <main className="scroll">{children}</main>
        <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
      </div>
    </div>
  )
}
