import { useRef, useState } from 'react'
import type { AppState } from '../../data/demo'
import { getProfileDogs } from '../../lib/profileDisplay'
import type { AddAdventureDraft } from '../../lib/customAdventure'
import { isValidAddAdventureDraft } from '../../lib/customAdventure'
import { readImageFileAsDataUrl } from '../../lib/imageUtils'
import { StatusBar } from '../../components/StatusBar'

interface AddAdventureFlowProps {
  state: AppState
  draft: AddAdventureDraft
  onBack: () => void
  onTitleChange: (title: string) => void
  onLocationChange: (locationLabel: string) => void
  onNotesChange: (notes: string) => void
  onToggleDog: (dogId: string) => void
  onPhotoChange: (photoDataUrl: string | null) => void
  onStartNow: () => void
  onSaveForLater: () => void
}

export function AddAdventureFlow({
  state,
  draft,
  onBack,
  onTitleChange,
  onLocationChange,
  onNotesChange,
  onToggleDog,
  onPhotoChange,
  onStartNow,
  onSaveForLater,
}: AddAdventureFlowProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [titleError, setTitleError] = useState<string | null>(null)
  const dogs = getProfileDogs(state)
  const canSubmit = isValidAddAdventureDraft(draft)

  const handleStartNow = () => {
    if (!draft.title.trim()) {
      setTitleError('Add a title for this adventure.')
      return
    }
    if (draft.title.trim().length < 2) {
      setTitleError('Title needs at least 2 characters.')
      return
    }
    if (draft.selectedDogIds.length < 1) {
      setTitleError('Select at least one dog.')
      return
    }
    setTitleError(null)
    onStartNow()
  }

  const handleSaveLater = () => {
    if (!draft.title.trim()) {
      setTitleError('Add a title for this adventure.')
      return
    }
    if (draft.title.trim().length < 2) {
      setTitleError('Title needs at least 2 characters.')
      return
    }
    if (draft.selectedDogIds.length < 1) {
      setTitleError('Select at least one dog.')
      return
    }
    setTitleError(null)
    onSaveForLater()
  }

  const handlePhotoSelected = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      const dataUrl = await readImageFileAsDataUrl(file)
      onPhotoChange(dataUrl)
    } catch {
      // ignore invalid file
    }
  }

  return (
    <div className="app-viewport" data-testid="add-adventure-flow">
      <div className="app-shell">
        <StatusBar />
        <main className="scroll scroll--overlay">
          <div className="overlay-topbar">
            <button type="button" className="overlay-back tap-target" onClick={onBack}>
              <i className="ti ti-arrow-left" aria-hidden="true" />
              Back
            </button>
          </div>

          <div className="add-adventure-hero detail-tint detail-tint--warm">
            <div className="add-adventure-kicker">Add adventure</div>
            <h1 className="add-adventure-title">Your own outing</h1>
            <p className="add-adventure-copy">
              Golf, camping, brewery day — anything you want to remember with your pack.
            </p>
          </div>

          <section className="add-adventure-form detail-card-warm">
            <label className="add-adventure-field">
              <span className="add-adventure-label">
                Title <span className="add-adventure-required">*</span>
              </span>
              <input
                type="text"
                className={`add-adventure-input${titleError ? ' add-adventure-input--error' : ''}`}
                value={draft.title}
                onChange={(e) => {
                  setTitleError(null)
                  onTitleChange(e.target.value)
                }}
                placeholder="e.g. Golf, Boat Day, Camping"
                maxLength={80}
                data-testid="add-adventure-title"
              />
              {titleError ? (
                <span className="add-adventure-error" role="alert">
                  {titleError}
                </span>
              ) : null}
            </label>

            <div className="add-adventure-field">
              <span className="add-adventure-label">Dogs</span>
              <div className="add-adventure-dogs" data-testid="add-adventure-dogs">
                {dogs.map((dog) => {
                  const selected = draft.selectedDogIds.includes(dog.id)
                  return (
                    <button
                      key={dog.id}
                      type="button"
                      className={`add-adventure-dog tap-target${selected ? ' on' : ''}`}
                      onClick={() => onToggleDog(dog.id)}
                      aria-pressed={selected}
                    >
                      <span className={`dog-av dog-av--sm ${dog.avatarClass}`}>
                        {dog.photoUrl ? (
                          <img src={dog.photoUrl} alt="" className="dog-av-img" />
                        ) : (
                          dog.initial
                        )}
                      </span>
                      <span>{dog.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <label className="add-adventure-field">
              <span className="add-adventure-label">Location (optional)</span>
              <input
                type="text"
                className="add-adventure-input"
                value={draft.locationLabel}
                onChange={(e) => onLocationChange(e.target.value)}
                placeholder="e.g. Torrey Pines, home lake"
                data-testid="add-adventure-location"
              />
            </label>

            <label className="add-adventure-field">
              <span className="add-adventure-label">Notes (optional)</span>
              <textarea
                className="add-adventure-textarea"
                value={draft.notes}
                onChange={(e) => onNotesChange(e.target.value)}
                placeholder="Anything to remember before you go"
                rows={3}
                data-testid="add-adventure-notes"
              />
            </label>

            <div className="add-adventure-field">
              <span className="add-adventure-label">Photo (optional)</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="cam-input"
                onChange={handlePhotoSelected}
              />
              {draft.photoDataUrl ? (
                <div className="add-adventure-photo-preview">
                  <img src={draft.photoDataUrl} alt="" />
                  <button
                    type="button"
                    className="add-adventure-photo-remove tap-target"
                    onClick={() => onPhotoChange(null)}
                  >
                    Remove photo
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="add-adventure-photo-btn tap-target"
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="add-adventure-photo"
                >
                  <i className="ti ti-camera" aria-hidden="true" />
                  Add photo
                </button>
              )}
            </div>
          </section>

          <div className="add-adventure-actions">
            <button
              type="button"
              className="st-btn st-btn--primary tap-target"
              disabled={!canSubmit}
              onClick={handleStartNow}
              data-testid="add-adventure-start-now"
            >
              Start now
            </button>
            <button
              type="button"
              className="st-btn st-btn--secondary tap-target"
              disabled={!canSubmit}
              onClick={handleSaveLater}
              data-testid="add-adventure-save-later"
            >
              Save for later
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}
