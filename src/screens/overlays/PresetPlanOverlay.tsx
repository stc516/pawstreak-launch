import { useState } from 'react'
import { StatusBar } from '../../components/StatusBar'

interface PresetPlanOverlayProps {
  onClose: () => void
  isDemoMode?: boolean
}

const REMINDER_OPTIONS = [
  { id: 'weekly', label: 'Weekly adventure reminder', defaultOn: true },
  { id: 'weekend', label: 'Weekend adventure reminder', defaultOn: true },
  { id: 'training', label: 'Training reminder', defaultOn: false },
]

export function PresetPlanOverlay({ onClose, isDemoMode = false }: PresetPlanOverlayProps) {
  const [selected, setSelected] = useState<string[]>(
    REMINDER_OPTIONS.filter((option) => option.defaultOn).map((option) => option.id),
  )
  const [savedMessage, setSavedMessage] = useState<string | null>(null)

  const toggleReminder = (id: string) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )
  }

  const handleSave = () => {
    setSavedMessage(
      isDemoMode
        ? 'Saved to your PawStreak plan locally.'
        : 'Saved to your PawStreak plan.',
    )
    window.setTimeout(() => {
      setSavedMessage(null)
      onClose()
    }, 2200)
  }

  return (
    <div className="app-viewport">
      <div className="app-shell">
        <StatusBar />
        <main className="scroll scroll--overlay">
          <div className="overlay-topbar">
            <button type="button" className="overlay-back tap-target" onClick={onClose}>
              <i className="ti ti-arrow-left" aria-hidden="true" />
              Back
            </button>
          </div>

          <div className="preset-overlay-hero detail-tint detail-tint--warm">
            <div className="preset-overlay-icon" aria-hidden="true">
              📅
            </div>
            <h1 className="preset-overlay-title">Plan reminders</h1>
            <p className="preset-overlay-copy">
              Pick gentle reminders for adventures — saved to your PawStreak plan.
            </p>
          </div>

          <div className="preset-overlay-options detail-card-warm">
            {REMINDER_OPTIONS.map((option) => {
              const isOn = selected.includes(option.id)
              return (
                <button
                  key={option.id}
                  type="button"
                  className={`preset-overlay-option tap-target${isOn ? ' on' : ''}`}
                  aria-pressed={isOn}
                  onClick={() => toggleReminder(option.id)}
                >
                  <span>{option.label}</span>
                  {isOn ? <i className="ti ti-check" aria-hidden="true" /> : null}
                </button>
              )
            })}
          </div>

          {isDemoMode ? (
            <p className="preset-overlay-note">
              Device calendar export is not available yet.
            </p>
          ) : null}

          <button type="button" className="preset-overlay-btn tap-target" onClick={handleSave}>
            Save to Plan
          </button>

          {savedMessage ? (
            <p className="preset-overlay-toast" role="status">
              {savedMessage}
            </p>
          ) : null}
        </main>
      </div>
    </div>
  )
}
