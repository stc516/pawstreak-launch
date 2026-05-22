import { StatusBar } from '../../components/StatusBar'

interface DemoLauncherProps {
  onOpenFullDemo: () => void
  onTryOnboarding: () => void
  onResetDemo: () => void
}

export function DemoLauncher({
  onOpenFullDemo,
  onTryOnboarding,
  onResetDemo,
}: DemoLauncherProps) {
  return (
    <div className="app-viewport">
      <div className="app-shell">
        <StatusBar />
        <main className="scroll demo-launcher">
          <div className="demo-launcher-hero detail-tint detail-tint--warm">
            <div className="demo-launcher-kicker">PawStreak demo</div>
            <h1 className="demo-launcher-title">Try PawStreak</h1>
            <p className="demo-launcher-sub">
              Jump into the full demo, or walk through onboarding like a first-time
              dog parent.
            </p>
          </div>

          <div className="demo-launcher-actions">
            <button
              type="button"
              className="demo-launcher-btn demo-launcher-btn--primary tap-target"
              onClick={onOpenFullDemo}
            >
              Open full demo
            </button>
            <button
              type="button"
              className="demo-launcher-btn tap-target detail-card-warm"
              onClick={onTryOnboarding}
            >
              Try onboarding
            </button>
          </div>

          <button
            type="button"
            className="demo-launcher-reset tap-target"
            onClick={onResetDemo}
          >
            Reset demo
          </button>
        </main>
      </div>
    </div>
  )
}
