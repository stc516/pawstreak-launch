import { StatusBar } from '../../components/StatusBar'

interface PresetPlanOverlayProps {
  onClose: () => void
}

export function PresetPlanOverlay({ onClose }: PresetPlanOverlayProps) {
  return (
    <div className="app-viewport">
      <div className="app-shell">
        <StatusBar />
        <main className="scroll scroll--overlay">
          <div className="overlay-topbar">
            <button type="button" className="overlay-back" onClick={onClose}>
              <i className="ti ti-arrow-left" aria-hidden="true" />
              Back
            </button>
          </div>

          <div className="preset-overlay">
            <div className="preset-overlay-icon" aria-hidden="true">
              📅
            </div>
            <h1 className="preset-overlay-title">Calendar sync coming soon</h1>
            <p className="preset-overlay-copy">
              We are building a way to sync preset plans to your calendar with
              gentle reminders — so adventure days never slip by.
            </p>
            <button type="button" className="preset-overlay-btn" onClick={onClose}>
              Got it
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}
