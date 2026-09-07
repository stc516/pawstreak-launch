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
import { captureNativeAdventurePhoto } from '../../lib/nativePhotos'
import { subscribeToNativeRestoredPhotos } from '../../lib/nativePhotoRestore'

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
  const [photoSaveMessage, setPhotoSaveMessage] = useState<string | null>(null)
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
  const photoCount = state.adventurePhotos.filter(Boolean).length
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

  useEffect(() => {
    if (!isStarted) return

    return subscribeToNativeRestoredPhotos((dataUrl) => {
      onAddPhoto(dataUrl)
      setPhotoSaveMessage('Recovered your camera photo and saved it to PawStreak.')
      window.setTimeout(() => setPhotoSaveMessage(null), 3200)
    })
  }, [isStarted, onAddPhoto])

  const handleCaptureClick = async () => {
    try {
      const nativePhoto = await captureNativeAdventurePhoto()
      if (nativePhoto) {
        onAddPhoto(nativePhoto.dataUrl)
        setPhotoSaveMessage(
          nativePhoto.savedToGallery
            ? 'Saved to PawStreak and your phone photos.'
            : 'Saved to PawStreak.',
        )
        window.setTimeout(() => setPhotoSaveMessage(null), 3200)
        return
      }
    } catch (error) {
      setPhotoSaveMessage(error instanceof Error ? error.message : 'Could not capture that photo.')
      window.setTimeout(() => setPhotoSaveMessage(null), 3200)
      return
    }

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

  const dataUrlToPhotoFile = async (photoDataUrl: string, index: number): Promise<File> => {
    const response = await fetch(photoDataUrl)
    const blob = await response.blob()
    return new File([blob], `pawstreak-adventure-photo-${index + 1}.jpg`, {
      type: blob.type || 'image/jpeg',
    })
  }

  const downloadPhotoFile = (file: File) => {
    const url = URL.createObjectURL(file)
    const link = document.createElement('a')
    link.href = url
    link.download = file.name
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const handleSavePhotoToPhone = async (photoDataUrl: string, index: number) => {
    setPhotoSaveMessage('Preparing photo...')
    try {
      const file = await dataUrlToPhotoFile(photoDataUrl, index)

      if (typeof navigator.share === 'function') {
        const payload: ShareData = { files: [file] }
        let canSharePhoto = typeof navigator.canShare !== 'function'
        if (!canSharePhoto) {
          try {
            canSharePhoto = navigator.canShare(payload)
          } catch {
            canSharePhoto = false
          }
        }

        if (canSharePhoto) {
          try {
            await navigator.share(payload)
            setPhotoSaveMessage('Choose “Save Image” to add it to Photos.')
            window.setTimeout(() => setPhotoSaveMessage(null), 3200)
            return
          } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
              setPhotoSaveMessage('Save cancelled.')
              window.setTimeout(() => setPhotoSaveMessage(null), 2200)
              return
            }
          }
        }
      }

      downloadPhotoFile(file)
      setPhotoSaveMessage('Downloaded photo. Open it and save to Photos if needed.')
    } catch {
      setPhotoSaveMessage('Could not prepare that photo.')
    }
    window.setTimeout(() => setPhotoSaveMessage(null), 3200)
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
              <div className="adv-mini-quest-kicker">Optional adventure bonus</div>
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
            <div className="adv-mini-quest-kicker">Optional adventure bonus</div>
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
              Grab one tiny proof that today happened.
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

          <button type="button" className="cam-row cam-row--memory tap-target" onClick={handleCaptureClick}>
            <i className="ti ti-camera" aria-hidden="true" />
            <span>{hasPhotos ? 'Add another moment' : 'Capture the memory'}</span>
          </button>

          {!hasPhotos ? (
            <div className="adv-photo-reminder">
              No photo yet — that is okay. You can still finish and save the memory.
            </div>
          ) : (
            <div className="adv-photo-reminder adv-photo-reminder--done">
              {photoCount} moment{photoCount === 1 ? '' : 's'} saved to PawStreak. Tap a photo to save it to Photos too.
            </div>
          )}

          <section className="adventure-finish-payoff" aria-label="Adventure payoff">
            <div className="adventure-finish-payoff-dogs" aria-hidden="true">
              {getProfileDogs(state).slice(0, 2).map((dog) => (
                <span key={dog.id} className={`adventure-finish-dog ${dog.avatarClass}`}>
                  {dog.photoUrl ? <img src={dog.photoUrl} alt="" /> : <span>{dog.profileEmoji}</span>}
                </span>
              ))}
            </div>
            <div className="adventure-finish-payoff-copy">
              <span>Memory checkpoint</span>
              <strong>You gave {getDisplayDogLabelForIds(state, adventure.selectedDogIds)} a better day.</strong>
              <p>
                Save the good part now — the place, the proof, and the little details you&apos;ll want back later.
              </p>
            </div>
            <div className="adventure-finish-payoff-meta">
              <span>{formatTimerWithTarget(elapsedSeconds, adventure.durationLabel)}</span>
              <span>{photoCount > 0 ? `${photoCount} photo${photoCount === 1 ? '' : 's'}` : 'photo optional'}</span>
            </div>
          </section>

          <div className="rq rq--memory">What made today worth remembering?</div>
          <div className="rchips rchips--memory">
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

          <div className="rq rq--memory">Photos from today</div>
          <div className="rphotos rphotos--memory">
            {state.adventurePhotos.map((photo, index) => (
              <div key={index} className="rph" style={{ position: 'relative' }}>
                {photo ? (
                  <>
                    <img src={photo} alt="" className="rph-img" />
                    <button
                      type="button"
                      className="tap-target"
                      style={{
                        position: 'absolute',
                        right: 5,
                        bottom: 5,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3,
                        minHeight: 26,
                        border: 0,
                        borderRadius: 999,
                        background: 'rgba(20, 53, 42, 0.88)',
                        color: '#fff',
                        padding: '0 8px',
                        fontSize: 10,
                        fontWeight: 900,
                        boxShadow: '0 6px 16px rgba(13, 39, 29, 0.24)',
                      }}
                      onClick={() => void handleSavePhotoToPhone(photo, index)}
                      aria-label={`Save photo ${index + 1} to Photos`}
                    >
                      <i className="ti ti-photo-plus" aria-hidden="true" style={{ color: 'inherit', fontSize: 13 }} />
                      Save
                    </button>
                  </>
                ) : (
                  <i className="ti ti-photo" aria-hidden="true" />
                )}
              </div>
            ))}
          </div>
          {photoSaveMessage ? (
            <div
              role="status"
              style={{
                margin: '8px 0 14px',
                borderRadius: 14,
                background: 'rgba(20, 53, 42, 0.1)',
                border: '1px solid rgba(20, 53, 42, 0.14)',
                color: 'var(--accent-deep)',
                padding: '9px 11px',
                fontSize: 11,
                fontWeight: 800,
              }}
            >
              {photoSaveMessage}
            </div>
          ) : null}

          <div className="adv-action-footer adv-action-footer--memory">
            <div className="clk-btns clk-btns--memory">
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
                className="cbtn pri cbtn--save-memory tap-target"
                onClick={() => void handleFinish()}
                disabled={isFinishing}
                aria-busy={isFinishing}
                aria-label="Finish adventure and save memory"
              >
                {isFinishing ? 'Saving memory…' : 'Save this adventure'}
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
