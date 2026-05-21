import { useEffect, useRef, useState } from 'react'
import type { AppState, DogMode } from '../../data/demo'
import { dogNamesLabel, formatTimer } from '../../data/demo'
import { readImageFileAsDataUrl } from '../../lib/imageUtils'
import { BottomNav } from '../../components/BottomNav'
import { StatusBar } from '../../components/StatusBar'
import type { TabId } from '../../data/demo'

const INITIAL_SECONDS = 24 * 60 + 7

interface ActiveAdventureScreenProps {
  state: AppState
  onFinish: () => void
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
  const [dogMode, setDogMode] = useState<DogMode>('both')
  const [moodRecapId, setMoodRecapId] = useState('loved-every-second')
  const [highlightRecapId, setHighlightRecapId] = useState('off-leash-run')

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
          <div className="two-dog-toggle">
            <div className="tdt-left">
              {state.dogs.map((dog) => (
                <div
                  key={dog.id}
                  className={`dog-av dog-av--md ${dog.avatarClass}`}
                >
                  {dog.initial}
                </div>
              ))}
              <span className="tdt-label">Both dogs today</span>
            </div>
            <div className="tdt-right">
              {state.dogModeOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`tdt-btn${dogMode === option.id ? '' : ' off'}`}
                  onClick={() => setDogMode(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
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

          <div className="clk-btns">
            <button
              type="button"
              className="cbtn tap-target"
              onClick={() => setIsPaused((current) => !current)}
            >
              Pause
            </button>
            <button type="button" className="cbtn pri tap-target" onClick={onFinish}>
              Finish
            </button>
          </div>

          <div className="recap-divider">
            <div className="rq">How did they do today?</div>
            <div className="rchips">
              {state.moodRecapOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`rc${moodRecapId === option.id ? ' on' : ''}`}
                  onClick={() => setMoodRecapId(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rq">What was the highlight?</div>
          <div className="rchips">
            {state.highlightRecapOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`rc${highlightRecapId === option.id ? ' on' : ''}`}
                onClick={() => setHighlightRecapId(option.id)}
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
