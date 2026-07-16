import { useEffect, useRef, useState } from 'react'
import type { AppState } from '../../data/demo'
import {
  formatTimerWithTarget,
  getActiveAdventureElapsedSeconds,
} from '../../data/demo'
import {
  getDisplayDogLabelForIds,
  getDisplayDogsAreOutLabel,
  getProfileDogs,
} from '../../lib/profileDisplay'
import type { AdventureFinishPayload } from '../../lib/adventureFinish'
import { readImageFileAsDataUrl } from '../../lib/imageUtils'
import { getPlaceById, getPlanMagicMeta } from '../../data/places'
import { getMiniQuestHint } from '../../lib/miniQuestHints'
import { CardImage } from '../../components/CardImage'
import { StatusBar } from '../../components/StatusBar'

interface ActiveAdventureScreenProps {
  state: AppState
  onStart: () => void
  onCancel: () => void
  onFinish: (payload: AdventureFinishPayload) => void | Promise<void>
  onMinimize?: () => void
  onAddPhoto: (photoDataUrl: string) => void
}

export function ActiveAdventureScreen({
  state,
  onStart,
  onCancel,
  onFinish,
  onMinimize,
  onAddPhoto,
}: ActiveAdventureScreenProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [, setTick] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isFinishing, setIsFinishing] = useState(false)
  const [pausedElapsed, setPausedElapsed] = useState<number | null>(null)
  const [selectedRecaps, setSelectedRecaps] = useState<string[]>([
    'Loved every second',
  ])

  const adventure = state.activeAdventure
  const place = getPlaceById(adventure?.placeId ?? '')
  const isNeighborhood =
    adventure?.placeId === 'neighborhood-walk' || !place || adventure?.location === 'Neighborhood walk'
  const miniQuest = getMiniQuestHint({
    placeId: adventure?.placeId,
    isNeighborhood,
  })
  const hasPhotos = state.adventurePhotos.some(Boolean)
  const isStarted = adventure?.started ?? false
  const elapsedSeconds =
    adventure && isStarted
      ? isPaused && pausedElapsed !== null
        ? pausedElapsed
        : getActiveAdventureElapsedSeconds(adventure)
      : 0

  useEffect(() => {
    if (!isStarted || isPaused || !adventure?.startedAt) {
      return
    }

    const refreshTimer = () => setTick((current) => current + 1)
    const interval = window.setInterval(refreshTimer, 1000)
    window.addEventListener('focus', refreshTimer)
    document.addEventListener('visibilitychange', refreshTimer)

    return () => {
      window.clearInterval(interval)
      window.removeEventListener('focus', refreshTimer)
      document.removeEventListener('visibilitychange', refreshTimer)
    }
  }, [adventure?.startedAt, isPaused, isStarted])

  const handleCaptureClick = () => {
    fileInputRef.current?.click()
  }

  const handlePhotoSelected = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    try {
      const dataUrl = await readImageFileAsDataUrl(file)
      onAddPhoto(dataUrl)
    } catch {
      // Ignore invalid selections for now.
    }
  }

  const toggleRecap = (label: string) => {
    setSelectedRecaps((current) =>
      current.includes(label)
        ? current.filter((item) => item !== label)
        : [...current, label],
    )
  }

  const handleFinish = async () => {
    if (isFinishing) return
    setIsFinishing(true)
    try {
      await onFinish({
        recapLabels:
          selectedRecaps.length > 0 ? selectedRecaps : ['Loved every second'],
      })
    } finally {
      setIsFinishing(false)
    }
  }

  if (!adventure) {
    return null
  }

  if (!isStarted) {
    return (
      <div className="app-viewport">
        <div className="app-shell">
          <StatusBar />
          <main className="scroll scroll--overlay">
            <div className="overlay-topbar">
              <button type="button" className="overlay-back tap-target" onClick={onCancel}>
                <i className="ti ti-arrow-left" aria-hidden="true" />
                Back
              </button>
            </div>

            <div className="adv-ready-hero detail-tint detail-tint--warm">
              {place ? (
                <CardImage
                  className="adv-ready-hero-img"
                  imageUrl={place.imageUrl}
                  imageAlt={place.imageAlt}
                  imageTone={place.imageTone}
                />
              ) : null}
              <div className="adv-ready-hero-text">
                <div className="adv-ready-label">Adventure ready</div>
                <div className="adv-ready-place">{adventure.location}</div>
              </div>
            </div>

            <div className="adv-ready-meta detail-card-warm">
              <div className="adv-ready-row">
                <span className="adv-ready-meta-label">Duration</span>
                <span>{adventure.durationLabel}</span>
              </div>
              <div className="adv-ready-row">
                <span className="adv-ready-meta-label">Dogs</span>
                <span>
                  {getDisplayDogLabelForIds(state, adventure.selectedDogIds)}
                </span>
              </div>
              {place ? (
                <div className="adv-ready-context">{getPlanMagicMeta(place)}</div>
              ) : null}
            </div>

            <div className="adv-mini-quest detail-card-warm">
              <div className="adv-mini-quest-kicker">Optional mini-quest</div>
              <div className="adv-mini-quest-title">
                <span aria-hidden="true">{miniQuest.emoji}</span> {miniQuest.title}
              </div>
              <p className="adv-mini-quest-task">{miniQuest.task}</p>
              <p className="adv-mini-quest-note">Ignore it and just enjoy the walk.</p>
            </div>

            <div className="detail-quote-block">
              <p className="detail-quote-text">
                Timer starts when you are ready — not before.
              </p>
            </div>

            <div className="adv-ready-actions">
              <button type="button" className="adv-ready-start tap-target" onClick={onStart}>
                Start adventure
              </button>
              <button type="button" className="adv-ready-back tap-target" onClick={onCancel}>
                Cancel adventure
              </button>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="app-viewport">
      <div className="app-shell">
        <StatusBar />

        <div className="clock-bg clock-bg--active detail-tint detail-tint--accent">
          <div className="clk-top">
            {onMinimize ? (
              <button
                type="button"
                className="active-adventure-minimize tap-target"
                onClick={onMinimize}
                aria-label="Minimize active adventure"
              >
                <i className="ti ti-chevrons-down" aria-hidden="true" />
                Browse app
              </button>
            ) : null}
            <div className="clk-sub">{adventure.location}</div>
            <div className="clk-time">
              {formatTimerWithTarget(elapsedSeconds, adventure.durationLabel)}
            </div>
            <div className="clk-duration">{adventure.durationLabel}</div>
            <div className="clk-where">
              <i className="ti ti-map-pin" aria-hidden="true" />
              Active adventure
            </div>
            <div className="clk-dogs">
              {getProfileDogs(state).map((dog) => (
                <div
                  key={dog.id}
                  className={`dog-av dog-av--sm ${dog.avatarClass}`}
                >
                  {dog.photoUrl ? (
                    <img src={dog.photoUrl} alt="" className="dog-av-img" />
                  ) : (
                    dog.initial
                  )}
                </div>
              ))}
              <span>{getDisplayDogsAreOutLabel(state)}</span>
            </div>
          </div>
        </div>

        <main className="scroll scroll--active">
          <div className="adv-mini-quest adv-mini-quest--active detail-card-warm">
            <div className="adv-mini-quest-kicker">Optional mini-quest</div>
            <div className="adv-mini-quest-title">
              <span aria-hidden="true">{miniQuest.emoji}</span> {miniQuest.title}
            </div>
            <p className="adv-mini-quest-task">{miniQuest.task}</p>
          </div>

          {place ? (
            <div className="adv-place-context detail-card-warm">
              <div className="adv-place-name">{place.name}</div>
              <div className="adv-place-meta">{getPlanMagicMeta(place)}</div>
            </div>
          ) : null}

          <div className="adv-capture-prompt detail-quote-block detail-quote-block--compact">
            <p className="detail-quote-text">
              Capture one thing you&apos;ll want to remember.
            </p>
          </div>

          <input
            ref={fileInputRef}
            className="cam-input"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoSelected}
          />

          <button type="button" className="cam-row tap-target" onClick={handleCaptureClick}>
            <i className="ti ti-camera" aria-hidden="true" />
            <span>Capture a moment</span>
          </button>

          {!hasPhotos ? (
            <div className="adv-photo-reminder">
              No photo yet — that is okay. You can still finish and save the memory.
            </div>
          ) : (
            <div className="adv-photo-reminder adv-photo-reminder--done">
              {state.adventurePhotos.filter(Boolean).length} moment
              {state.adventurePhotos.filter(Boolean).length === 1 ? '' : 's'} saved
            </div>
          )}

          <div className="rq">What made today worth remembering?</div>
          <div className="rchips">
            {state.adventureRecapOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`rc tap-target${selectedRecaps.includes(option.label) ? ' on' : ''}`}
                onClick={() => toggleRecap(option.label)}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="rq">Photos from today</div>
          <div className="rphotos">
            {state.adventurePhotos.map((photo, index) => (
              <div key={index} className="rph">
                {photo ? (
                  <img src={photo} alt="" className="rph-img" />
                ) : (
                  <i className="ti ti-photo" aria-hidden="true" />
                )}
              </div>
            ))}
          </div>

          <div className="adv-action-footer">
            <div className="clk-btns">
              <button
                type="button"
                className="cbtn tap-target"
                onClick={() => {
                  if (!adventure) return
                  setIsPaused((current) => {
                    if (current) {
                      setPausedElapsed(null)
                      return false
                    }
                    setPausedElapsed(getActiveAdventureElapsedSeconds(adventure))
                    return true
                  })
                }}
              >
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button
                type="button"
                className="cbtn pri tap-target"
                onClick={() => void handleFinish()}
                disabled={isFinishing}
                aria-busy={isFinishing}
                aria-label="Finish adventure"
              >
                {isFinishing ? 'Saving memory…' : 'Finish adventure + save memory'}
              </button>
            </div>
            <button type="button" className="adv-cancel-btn tap-target" onClick={onCancel}>
              Cancel adventure
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}
