import { useState, type FormEvent } from 'react'
import {
  EMPTY_DEMO_FEEDBACK_DRAFT,
  exportDemoFeedbackJson,
  isSupabaseConfigured,
  loadDemoFeedback,
  saveDemoFeedback,
  type DemoFeedbackDraft,
} from '../lib/demoFeedback'

export function DemoFeedbackCapture() {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<DemoFeedbackDraft>(EMPTY_DEMO_FEEDBACK_DRAFT)
  const [savedCount, setSavedCount] = useState(() => loadDemoFeedback().length)
  const [submitted, setSubmitted] = useState(false)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const supabaseReady = isSupabaseConfigured()
  const helperCopy = supabaseReady
    ? 'Short answers are perfect. Saved privately for the PawStreak team.'
    : 'Short answers are perfect. Everything stays on this device.'

  const closeOverlay = () => {
    setOpen(false)
    setSubmitted(false)
    setDraft(EMPTY_DEMO_FEEDBACK_DRAFT)
    setActionMessage(null)
  }

  const openOverlay = () => {
    setSavedCount(loadDemoFeedback().length)
    setSubmitted(false)
    setDraft(EMPTY_DEMO_FEEDBACK_DRAFT)
    setActionMessage(null)
    setOpen(true)
  }

  const updateField = (field: keyof DemoFeedbackDraft, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    saveDemoFeedback(draft)
    setSavedCount(loadDemoFeedback().length)
    setSubmitted(true)
    setDraft(EMPTY_DEMO_FEEDBACK_DRAFT)
    setActionMessage(null)
  }

  const handleCopy = async () => {
    const json = exportDemoFeedbackJson()
    await navigator.clipboard.writeText(json)
    setActionMessage('Feedback copied to clipboard.')
  }

  const handleExport = () => {
    const json = exportDemoFeedbackJson()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `pawstreak-demo-feedback-${new Date().toISOString().slice(0, 10)}.json`
    anchor.click()
    URL.revokeObjectURL(url)
    setActionMessage('Feedback JSON downloaded.')
  }

  return (
    <>
      <button
        type="button"
        className="demo-feedback-trigger tap-target"
        onClick={openOverlay}
        aria-label="Leave quick feedback"
      >
        Feedback
      </button>

      <div
        className={`modal-overlay demo-feedback-overlay${open ? ' open' : ''}`}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            closeOverlay()
          }
        }}
      >
        <div
          className="modal-sheet demo-feedback-sheet"
          role="dialog"
          aria-modal="true"
          aria-labelledby="demo-feedback-title"
        >
          <div className="modal-handle" aria-hidden="true" />

          {submitted ? (
            <div className="demo-feedback-success">
              <h2 id="demo-feedback-title" className="demo-feedback-title">
                Thanks for the feedback
              </h2>
              <p className="demo-feedback-copy">
                {supabaseReady
                  ? `Thanks — saved for the PawStreak team (${savedCount} response${savedCount === 1 ? '' : 's'} on this device).`
                  : `Saved locally (${savedCount} response${savedCount === 1 ? '' : 's'}).`}
              </p>
              <div className="demo-feedback-actions">
                <button
                  type="button"
                  className="demo-feedback-btn demo-feedback-btn--secondary"
                  onClick={handleCopy}
                >
                  Copy JSON
                </button>
                <button
                  type="button"
                  className="demo-feedback-btn"
                  onClick={handleExport}
                >
                  Export JSON
                </button>
              </div>
              <button
                type="button"
                className="demo-feedback-link"
                onClick={() => {
                  setSubmitted(false)
                  setActionMessage(null)
                }}
              >
                Leave more feedback
              </button>
              <button
                type="button"
                className="demo-feedback-link"
                onClick={closeOverlay}
              >
                Close
              </button>
            </div>
          ) : (
            <form className="demo-feedback-form" onSubmit={handleSubmit}>
              <h2 id="demo-feedback-title" className="demo-feedback-title">
                Quick demo feedback
              </h2>
              <p className="demo-feedback-copy">{helperCopy}</p>

              <label className="demo-feedback-field">
                <span>What do you think PawStreak is for?</span>
                <textarea
                  rows={2}
                  value={draft.whatIsItFor}
                  onChange={(event) => updateField('whatIsItFor', event.target.value)}
                />
              </label>

              <label className="demo-feedback-field">
                <span>Would you use this with your dog?</span>
                <textarea
                  rows={2}
                  value={draft.wouldUseWithDog}
                  onChange={(event) =>
                    updateField('wouldUseWithDog', event.target.value)
                  }
                />
              </label>

              <label className="demo-feedback-field">
                <span>What confused you?</span>
                <textarea
                  rows={2}
                  value={draft.whatConfused}
                  onChange={(event) => updateField('whatConfused', event.target.value)}
                />
              </label>

              <label className="demo-feedback-field">
                <span>What did you like most?</span>
                <textarea
                  rows={2}
                  value={draft.whatLikedMost}
                  onChange={(event) => updateField('whatLikedMost', event.target.value)}
                />
              </label>

              <label className="demo-feedback-field demo-feedback-field--optional">
                <span>
                  If PawStreak helped save your dog&apos;s memories, find better adventures,
                  and keep family connected, what would make it worth paying for?{' '}
                  <em>(optional)</em>
                </span>
                <textarea
                  rows={3}
                  value={draft.premiumValue}
                  onChange={(event) => updateField('premiumValue', event.target.value)}
                />
              </label>

              <div className="demo-feedback-actions">
                <button
                  type="button"
                  className="demo-feedback-btn demo-feedback-btn--secondary"
                  onClick={closeOverlay}
                >
                  Cancel
                </button>
                <button type="submit" className="demo-feedback-btn">
                  Save feedback
                </button>
              </div>

              {savedCount > 0 ? (
                <div className="demo-feedback-export-row">
                  <span>{savedCount} saved</span>
                  <button
                    type="button"
                    className="demo-feedback-link"
                    onClick={handleCopy}
                  >
                    Copy JSON
                  </button>
                  <button
                    type="button"
                    className="demo-feedback-link"
                    onClick={handleExport}
                  >
                    Export JSON
                  </button>
                </div>
              ) : null}
            </form>
          )}

          {actionMessage ? (
            <p className="demo-feedback-status" role="status">
              {actionMessage}
            </p>
          ) : null}
        </div>
      </div>
    </>
  )
}
