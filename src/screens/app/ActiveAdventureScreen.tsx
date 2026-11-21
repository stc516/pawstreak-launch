import { useEffect, useRef, useState } from 'react'
import type { AppState } from '../../data/demo'
import {
  formatTimer,
  getActiveAdventureElapsedSeconds,
} from '../../data/demo'
import {
  getDisplayDogLabelForIds,
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
  pausedAt?: number
  onTogglePause: () => void
  onStart: () => void
  onCancel: () => void
  onFinish: (payload: AdventureFinishPayload) => void | Promise<void>
  onMinimize?: () => void
  onToggleRoute: () => void
  onAddPhoto: (photoDataUrl: string) => void
  finishReviewRequested?: boolean
  onFinishReviewShown?: () => void
}

export function ActiveAdventureScreen({
  state,
  pausedAt,
  onTogglePause,
  onStart,
  onCancel,
  onFinish,
  onMinimize,
  onAddPhoto,
  onToggleRoute,
  finishReviewRequested = false,
  onFinishReviewShown,
}: ActiveAdventureScreenProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const finishReviewRef = useRef<HTMLElement>(null)
  const [, setTick] = useState(0)
  const isPaused = pausedAt !== undefined
  const [isFinishing, setIsFinishing] = useState(false)
  const [photoSaveMessage, setPhotoSaveMessage] = useState<string | null>(null)
  const [selectedRecaps, setSelectedRecaps] = useState<string[]>([])

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
      ? pausedAt !== undefined && adventure.startedAt
        ? Math.max(0, Math.floor((pausedAt - Date.parse(adventure.startedAt)) / 1000))
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

  useEffect(() => {
    if (!isStarted || !finishReviewRequested) return

    const frame = window.requestAnimationFrame(() => {
      finishReviewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      onFinishReviewShown?.()
    })

    return () => window.cancelAnimationFrame(frame)
  }, [finishReviewRequested, isStarted, onFinishReviewShown])

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
      setPhotoSaveMessage(null)
    } catch {
      setPhotoSaveMessage('That photo could not be added. Try another image or take a new one.')
      window.setTimeout(() => setPhotoSaveMessage(null), 4800)
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
        recapLabels: selectedRecaps,
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
    <div className="app-viewport trail-console">
      <div className="app-shell">
        <StatusBar />
        <main className="trail-scroll">
          <header className="trail-header">
            {onMinimize ? <button type="button" className="trail-browse tap-target" onClick={onMinimize} aria-label="Minimize active adventure">← Browse app</button> : null}
            <p className="field-kicker">Active adventure</p>
            <h1>{adventure.location}</h1>
            <div className="kinetic-timer-panel">
              <div className="trail-timer-label">{isPaused ? 'Elapsed · Paused' : 'Elapsed'}</div>
              <div className="trail-timer clk-time">{formatTimer(elapsedSeconds)}</div>
              <span className="kinetic-live-state">{isPaused ? 'Paused · take your time' : 'Out together'}</span>
            </div>
            <div className="kinetic-section-heading"><h2>Your Trail Pack</h2></div>
            <div className="trail-dogs">
              {getProfileDogs(state).filter(dog => !adventure.selectedDogIds?.length || adventure.selectedDogIds.includes(dog.id)).map(dog => (
                <span key={dog.id}>{dog.photoUrl ? <img src={dog.photoUrl} alt="" /> : <span aria-hidden="true">{dog.profileEmoji}</span>} {dog.name}</span>
              ))}
            </div>
          </header>
          <section ref={finishReviewRef} className="trail-actions" data-testid="adventure-finish-review" aria-label="Walk controls">
            <button type="button" className="field-primary cbtn--save-memory tap-target" disabled={isFinishing} aria-busy={isFinishing} onClick={() => void handleFinish()} aria-label="Finish walk">{isFinishing ? 'Saving…' : 'Finish walk'}</button>
            <button type="button" className="field-secondary tap-target" onClick={onTogglePause}>{isPaused ? 'Resume' : 'Pause'}</button>
            <button type="button" className="trail-cancel tap-target" onClick={onCancel}>Cancel adventure</button>
          </section>
          {(window.location.pathname.startsWith('/demo') || import.meta.env.VITE_WALK_ROUTE_ENABLED === 'true') ? <section className="trail-route" aria-label="Walk route">
            <button type="button" className="field-secondary tap-target" aria-pressed={adventure.routeRecording ?? false} onClick={onToggleRoute}>{adventure.routeRecording ? 'Stop route recording' : 'Record phone GPS route'}</button>
            <p>Optional. Records while PawStreak is visible; pauses when locked, backgrounded or the walk is paused.</p>
            <p role="status">{isPaused && adventure.routeRecording ? 'Route recording paused.' : adventure.routeMessage} {adventure.routePoints?.length ?? 0} GPS points saved.</p>
          </section> : null}
          <input ref={fileInputRef} className="cam-input" type="file" accept="image/*" capture="environment" onChange={handlePhotoSelected} />
          <button type="button" className="trail-add-photo tap-target" onClick={handleCaptureClick}><i className="ti ti-camera" aria-hidden="true" /> Add photo</button>
          {photoSaveMessage ? <p role="status">{photoSaveMessage}</p> : null}
          {hasPhotos ? <section className="trail-gallery">
            <div className="field-gallery-heading"><h2>Photos</h2><span>{photoCount} {photoCount === 1 ? 'photo' : 'photos'}</span></div>
            <div className="field-gallery">{state.adventurePhotos.filter(Boolean).map((photo, index) => (
              <button type="button" key={index} className="tap-target" onClick={() => void handleSavePhotoToPhone(photo, index)} aria-label={`Save photo ${index + 1} to Photos`}><img src={photo} alt={`Walk photo ${index + 1}`} /></button>
            ))}</div>
          </section> : null}
          <details className="trail-detail"><summary className="tap-target">Add a detail · optional</summary>
            <div className="rchips">{state.adventureRecapOptions.map(option => <button type="button" key={option.id} className={`rc tap-target${selectedRecaps.includes(option.label) ? ' on' : ''}`} aria-pressed={selectedRecaps.includes(option.label)} onClick={() => toggleRecap(option.label)}>{option.label}</button>)}</div>
          </details>
        </main>
      </div>
    </div>
  )
}
