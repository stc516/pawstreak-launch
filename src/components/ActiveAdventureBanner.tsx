import { useEffect, useState } from 'react'
import type { AppState } from '../data/demo'
import {
  formatTimerWithTarget,
  getActiveAdventureElapsedSeconds,
} from '../data/demo'
import { getDisplayDogLabel, getProfileDogs } from '../lib/profileDisplay'

interface ActiveAdventureBannerProps {
  state: AppState
  onResume: () => void
  onFinish: () => void
  onCancel: () => void
}

export function ActiveAdventureBanner({
  state,
  onResume,
  onFinish,
  onCancel,
}: ActiveAdventureBannerProps) {
  const [, setTick] = useState(0)
  const adventure = state.activeAdventure

  useEffect(() => {
    if (!adventure?.started || !adventure.startedAt) return
    const interval = window.setInterval(() => setTick((n) => n + 1), 1000)
    return () => window.clearInterval(interval)
  }, [adventure?.started, adventure?.startedAt])

  if (!adventure?.started) return null

  const elapsedSeconds = getActiveAdventureElapsedSeconds(adventure)
  const dogs = getProfileDogs(state)

  return (
    <section
      className="active-adventure-banner"
      aria-label="Active adventure"
      data-testid="active-adventure-banner"
    >
      <button
        type="button"
        className="active-adventure-banner-main tap-target"
        onClick={onResume}
      >
        <div className="active-adventure-banner-copy">
          <div className="active-adventure-banner-kicker">Active adventure</div>
          <div className="active-adventure-banner-title">{adventure.location}</div>
          <div className="active-adventure-banner-meta">
            <span className="active-adventure-banner-timer">
              {formatTimerWithTarget(elapsedSeconds, adventure.durationLabel)}
            </span>
            <span className="active-adventure-banner-dogs">{getDisplayDogLabel(state)}</span>
          </div>
        </div>
        {dogs.length > 0 ? (
          <div className="active-adventure-banner-avatars" aria-hidden="true">
            {dogs.slice(0, 2).map((dog) => (
              <div key={dog.id} className={`dog-av dog-av--sm ${dog.avatarClass}`}>
                {dog.photoUrl ? (
                  <img src={dog.photoUrl} alt="" className="dog-av-img" />
                ) : (
                  dog.initial
                )}
              </div>
            ))}
          </div>
        ) : null}
      </button>
      <div className="active-adventure-banner-actions">
        <button type="button" className="active-adventure-banner-btn tap-target" onClick={onResume}>
          Resume
        </button>
        <button
          type="button"
          className="active-adventure-banner-btn active-adventure-banner-btn--primary tap-target"
          onClick={onFinish}
        >
          Finish
        </button>
        <button type="button" className="active-adventure-banner-btn tap-target" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </section>
  )
}
