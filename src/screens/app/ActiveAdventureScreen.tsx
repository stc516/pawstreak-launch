import { useEffect, useRef, useState } from 'react'
import type { AppState } from '../../data/demo'
import { dogNamesLabel, formatTimer } from '../../data/demo'
import type { AdventureFinishPayload } from '../../lib/adventureFinish'
import { readImageFileAsDataUrl } from '../../lib/imageUtils'
import { getPlaceById, getPlanMagicMeta } from '../../data/places'
import { BottomNav } from '../../components/BottomNav'
import { StatusBar } from '../../components/StatusBar'
import type { TabId } from '../../data/demo'

const INITIAL_SECONDS = 24 * 60 + 7

interface ActiveAdventureScreenProps {
  state: AppState
  onFinish: (payload: AdventureFinishPayload) => void
  onTabChange: (tab: TabId) => void
  onAddPhoto: (photoDataUrl: string) => void
}

export function ActiveAdventureScreen({
  state,
  onFinish,
  onTabChange,
  onAddPhoto,
}: ActiveAdventureScreenProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(INITIAL_SECONDS)
  const [isPaused, setIsPaused] = useState(false)
  const [selectedRecaps, setSelectedRecaps] = useState<string[]>([
    'Loved every second',
  ])

  const place = getPlaceById(state.activeAdventure?.placeId ?? '')
  const hasPhotos = state.adventurePhotos.some(Boolean)

  useEffect(() => {
    if (isPaused) {
      return
    }

    const interval = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1)
    }, 1000)

    return () => window.clearInterval(interval)
  }, [isPaused])

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

  const handleFinish = () => {
    onFinish({
      recapLabels:
        selectedRecaps.length > 0 ? selectedRecaps : ['Loved every second'],
    })
  }

  if (!state.activeAdventure) {
    return null
  }

  return (
    <div className="app-viewport">
      <div className="app-shell">
        <StatusBar />

        <div className="clock-bg">
          <div className="clk-top">
            <div className="clk-sub">{state.activeAdventure.location}</div>
            <div className="clk-time">{formatTimer(elapsedSeconds)}</div>
            <div className="clk-duration">{state.activeAdventure.durationLabel}</div>
            <div className="clk-where">
              <i className="ti ti-map-pin" aria-hidden="true" />
              Active adventure
            </div>
            <div className="clk-dogs">
              {state.dogs.map((dog) => (
                <div
                  key={dog.id}
                  className={`dog-av dog-av--sm ${dog.avatarClass}`}
                >
                  {dog.initial}
                </div>
              ))}
              <span>{dogNamesLabel(state.dogs)} are out</span>
            </div>
          </div>
        </div>

        <main className="scroll scroll--active">
          {place ? (
            <div className="adv-place-context">
              <div className="adv-place-name">{place.name}</div>
              <div className="adv-place-meta">{getPlanMagicMeta(place)}</div>
              <div className="adv-place-note">{place.whyDogsLoveIt}</div>
            </div>
          ) : null}

          <div className="adv-capture-prompt">
            Capture one thing you&apos;ll want to remember.
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

          <div className="clk-btns">
            <button
              type="button"
              className="cbtn tap-target"
              onClick={() => setIsPaused((current) => !current)}
            >
              Pause
            </button>
            <button type="button" className="cbtn pri tap-target" onClick={handleFinish}>
              Finish
            </button>
          </div>
        </main>

        <BottomNav
          activeTab="plan"
          onTabChange={onTabChange}
          className="bnav bnav--white"
        />
      </div>
    </div>
  )
}
