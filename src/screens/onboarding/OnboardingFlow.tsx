import { useMemo, useState } from 'react'
import {
  dogAges,
  dogBreeds,
  onboardingCatChips,
  onboardingPlaces,
  onboardingVibes,
} from '../../data/demo'

const arrowIcon = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path
      d="M3.75 9h10.5M9.75 4.5L14.25 9l-4.5 4.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

function StepsIndicator({ current }: { current: number }) {
  return (
    <div className="steps">
      {Array.from({ length: 6 }, (_, index) => {
        const step = index + 1
        let className = 'dot'
        if (step < current) className += ' done'
        if (step === current) className += ' active'
        return <div key={step} className={className} />
      })}
    </div>
  )
}

interface OnboardingFlowProps {
  onComplete: () => void
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(1)
  const [userName, setUserName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [dogName, setDogName] = useState('')
  const [secondDogOn, setSecondDogOn] = useState(false)
  const [selectedVibes, setSelectedVibes] = useState<string[]>([])
  const [selectedCats, setSelectedCats] = useState<string[]>(['park'])
  const [modalOpen, setModalOpen] = useState(false)

  const signupValid =
    userName.trim().length > 0 &&
    email.includes('@') &&
    password.trim().length >= 8
  const dogValid = dogName.trim().length > 0
  const vibesValid = selectedVibes.length > 0

  const displayDogName = dogName.trim() || 'your dog'
  const confirmStyles = useMemo(
    () => (selectedVibes.length ? selectedVibes.join(', ') : '—'),
    [selectedVibes],
  )

  const toggleVibe = (name: string) => {
    setSelectedVibes((current) =>
      current.includes(name)
        ? current.filter((vibe) => vibe !== name)
        : [...current, name],
    )
  }

  const toggleCat = (id: string) => {
    setSelectedCats((current) =>
      current.includes(id)
        ? current.filter((chip) => chip !== id)
        : [...current, id],
    )
  }

  return (
    <div className="onboarding-root">
      {step === 1 && (
        <div className="screen active">
          <div className="blob b1" />
          <div className="blob b2" />
          <div className="screen-body onboarding-body--welcome">
            <div className="welcome-hero">
              <div className="hero-name">PawStreak</div>
              <svg
                className="welcome-hero-svg"
                viewBox="0 0 380 230"
                preserveAspectRatio="xMidYMid slice"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="380" height="230" fill="url(#sky)" />
                <defs>
                  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#87CEEB" />
                    <stop offset="60%" stopColor="#98D4A3" />
                    <stop offset="100%" stopColor="#7DB88A" />
                  </linearGradient>
                  <linearGradient id="hill1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5a9467" />
                    <stop offset="100%" stopColor="#436444" />
                  </linearGradient>
                  <linearGradient id="hill2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6faa7a" />
                    <stop offset="100%" stopColor="#5a9467" />
                  </linearGradient>
                </defs>
                <circle cx="190" cy="72" r="34" fill="rgba(255,220,80,.18)" />
                <circle cx="190" cy="72" r="22" fill="rgba(255,220,80,.3)" />
                <circle cx="190" cy="72" r="14" fill="rgba(255,230,100,.9)" />
                <ellipse cx="190" cy="200" rx="240" ry="80" fill="url(#hill2)" />
                <ellipse cx="100" cy="220" rx="180" ry="70" fill="url(#hill1)" />
                <ellipse cx="300" cy="225" rx="160" ry="65" fill="url(#hill1)" />
                <path
                  d="M160 230 Q180 190 190 170 Q200 190 220 230"
                  fill="rgba(255,255,255,.15)"
                />
              </svg>
              <div className="hero-chips">
                <div className="hero-chip">
                  <div className="live-dot" />
                  247 dogs out right now
                </div>
                <div className="hero-chip">🔥 14 day streak</div>
              </div>
            </div>

            <h1 className="h1 onboarding-welcome-title">
              Your dog gives you
              <br />
              everything. Give them
              <br />
              their best day.
            </h1>
            <p className="body onboarding-welcome-copy">
              Adventures, memories, and the life your dog deserves — all in one
              place.
            </p>
            <div className="onboarding-spacer-20" />
          </div>
          <div className="bottom-bar">
            <button type="button" className="btn-primary" onClick={() => setStep(2)}>
              Get started
              {arrowIcon}
            </button>
            <div className="divider onboarding-divider">
              <span>already have an account?</span>
            </div>
            <button type="button" className="btn-google" onClick={() => setStep(2)}>
              Sign in
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="screen active">
          <div className="blob b1 onboarding-blob--soft" />
          <div className="blob b2 onboarding-blob--soft" />
          <StepsIndicator current={1} />
          <div className="screen-body onboarding-body--signup">
            <div className="onboarding-center-emoji">🐾</div>
            <h2 className="h2 onboarding-center-title">Create your account</h2>
            <p className="body onboarding-center-copy">
              Free to start. Your dog's story starts here.
            </p>

            <button type="button" className="btn-google onboarding-google-gap" onClick={() => setStep(3)}>
              Continue with Google
            </button>
            <button type="button" className="btn-google onboarding-google-bottom" onClick={() => setStep(3)}>
              Continue with Apple
            </button>

            <div className="divider">
              <span>or sign up with email</span>
            </div>

            <div className="field">
              <span className="field-label">Your Name</span>
              <input
                className="field-input"
                type="text"
                placeholder="First name"
                value={userName}
                onChange={(event) => setUserName(event.target.value)}
              />
            </div>
            <div className="field">
              <span className="field-label">Email</span>
              <input
                className="field-input"
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="field">
              <span className="field-label">Password</span>
              <input
                className="field-input"
                type="password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            <div className="onboarding-spacer-8" />
          </div>
          <div className="bottom-bar">
            <button
              type="button"
              className="btn-primary"
              disabled={!signupValid}
              onClick={() => setStep(3)}
            >
              Create account
              {arrowIcon}
            </button>
            <p className="caption onboarding-legal">
              By joining you agree to our{' '}
              <a href="#" className="onboarding-link">
                Privacy Policy
              </a>{' '}
              and{' '}
              <a href="#" className="onboarding-link">
                Terms
              </a>
              .
            </p>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="screen active">
          <div className="blob b1 onboarding-blob--faint" />
          <div className="blob b3" />
          <StepsIndicator current={2} />
          <div className="screen-body onboarding-body--dog">
            <div className="onboarding-badge-wrap">
              <span className="onboarding-badge">NEW JOURNEY</span>
            </div>
            <h2 className="h2 onboarding-center-title onboarding-dog-title">
              Your dog's daily
              <br />
              adventure starts here.
            </h2>
            <p className="body onboarding-center-copy">Tell us about your companion.</p>

            <div className="photo-wrap">
              <div className="photo-circle">
                <div className="photo-placeholder">
                  <span className="photo-upload-label">UPLOAD</span>
                </div>
              </div>
              <div className="photo-edit">
                <svg viewBox="0 0 14 14" stroke="white" fill="none" strokeWidth="1.5">
                  <path d="M9.5 2.5l2 2-7 7H2.5v-2l7-7z" />
                </svg>
              </div>
            </div>

            <div className="field">
              <span className="field-label">Dog Name</span>
              <input
                className="field-input"
                type="text"
                placeholder="e.g. Bailey"
                value={dogName}
                onChange={(event) => setDogName(event.target.value)}
              />
            </div>
            <div className="onboarding-grid-2">
              <div className="field onboarding-field-flush">
                <span className="field-label">Breed</span>
                <select className="field-input" defaultValue="">
                  <option value="">Select</option>
                  {dogBreeds.map((breed) => (
                    <option key={breed}>{breed}</option>
                  ))}
                </select>
              </div>
              <div className="field onboarding-field-flush">
                <span className="field-label">Age</span>
                <select className="field-input" defaultValue={dogAges[1]}>
                  {dogAges.map((age) => (
                    <option key={age}>{age}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="button"
              className="toggle-row"
              onClick={() => setSecondDogOn((current) => !current)}
            >
              <div>
                <div className="label onboarding-toggle-label">
                  Got another dog? Add them too.
                </div>
                <div className="caption onboarding-toggle-caption">
                  Both dogs show on every adventure card.
                </div>
              </div>
              <div className={`tog${secondDogOn ? ' on' : ''}`} />
            </button>

            {secondDogOn && (
              <div className="second-dog-form">
                <div className="label onboarding-second-dog-label">Second dog</div>
                <div className="field">
                  <span className="field-label">Name</span>
                  <input className="field-input" type="text" placeholder="e.g. Omi" />
                </div>
                <div className="onboarding-grid-2">
                  <div className="field onboarding-field-flush">
                    <span className="field-label">Breed</span>
                    <select className="field-input" defaultValue="">
                      <option value="">Select</option>
                      {dogBreeds.map((breed) => (
                        <option key={breed}>{breed}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field onboarding-field-flush">
                    <span className="field-label">Age</span>
                    <select className="field-input" defaultValue={dogAges[3]}>
                      {dogAges.map((age) => (
                        <option key={age}>{age}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
            <div className="onboarding-spacer-24" />
          </div>
          <div className="bottom-bar">
            <button
              type="button"
              className="btn-primary"
              disabled={!dogValid}
              onClick={() => setStep(4)}
            >
              Next
              {arrowIcon}
            </button>
            <div className="privacy-note">
              <span className="caption">Your dog's privacy is our top priority.</span>
            </div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="screen active">
          <div className="blob b2 onboarding-blob--faint" />
          <div className="blob b3 onboarding-blob--soft" />
          <StepsIndicator current={3} />
          <div className="screen-body onboarding-body--vibes">
            <h2 className="h2 onboarding-vibes-title">
              What does {displayDogName} love most?
            </h2>
            <p className="body onboarding-vibes-copy">
              Pick everything that fits — dogs are into multiple things.
            </p>
            <p className="select-hint">Tap all that apply</p>

            <div className="vibe-grid">
              {onboardingVibes.map((vibe) => (
                <button
                  key={vibe.id}
                  type="button"
                  className={`vibe-card${selectedVibes.includes(vibe.name) ? ' selected' : ''}`}
                  onClick={() => toggleVibe(vibe.name)}
                >
                  <div className="vibe-check">
                    <svg viewBox="0 0 10 10">
                      <polyline points="1.5,5 4,7.5 8.5,2.5" />
                    </svg>
                  </div>
                  <div className="vibe-icon">{vibe.emoji}</div>
                  <div className="vibe-name">{vibe.name}</div>
                  <div className="vibe-desc">{vibe.description}</div>
                </button>
              ))}
            </div>
            <div className="onboarding-spacer-12" />
          </div>
          <div className="bottom-bar bottom-bar--split">
            <button type="button" className="btn-back" onClick={() => setStep(3)}>
              Back
            </button>
            <button
              type="button"
              className="btn-primary onboarding-next-flex"
              disabled={!vibesValid}
              onClick={() => setStep(5)}
            >
              Next
              {arrowIcon}
            </button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="screen active">
          <div className="blob b1 onboarding-blob--soft" />
          <div className="blob b2 onboarding-blob--lighter" />
          <StepsIndicator current={4} />
          <div className="screen-body onboarding-body--local">
            <h2 className="h2 onboarding-local-title">
              Where do you and {displayDogName} usually adventure?
            </h2>
            <p className="body onboarding-local-copy">
              We'll map out spots you'll both love nearby.
            </p>

            <div className="search-wrap">
              <svg
                className="search-icon"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="8" cy="8" r="5" />
                <path d="M13 13l3 3" />
              </svg>
              <input
                className="search-input"
                type="text"
                placeholder="Search for a park, trail, or city..."
              />
            </div>

            <div className="map-mock">
              <div className="map-you">
                <span className="map-you-dot" />
                You're here
              </div>
              <div className="map-count">200+ spots</div>
            </div>

            <div className="cat-chips">
              {onboardingCatChips.map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  className={`cat-chip${selectedCats.includes(chip.id) ? ' selected' : ''}`}
                  onClick={() => toggleCat(chip.id)}
                >
                  {chip.emoji} {chip.label}
                </button>
              ))}
            </div>

            <div className="label onboarding-nearby-label">
              <span className="onboarding-nearby-star">✦</span> Nearby spots
            </div>

            {onboardingPlaces.map((place) => (
              <div key={place.id} className="place-item">
                <div className="place-thumb">{place.emoji}</div>
                <div>
                  <div className="place-name">{place.name}</div>
                  <div className="place-meta">{place.meta}</div>
                </div>
                <div className="place-arrow">›</div>
              </div>
            ))}

            <div className="onboarding-spacer-24" />
          </div>
          <div className="bottom-bar bottom-bar--split">
            <button type="button" className="btn-back" onClick={() => setStep(4)}>
              Back
            </button>
            <button
              type="button"
              className="btn-primary onboarding-next-flex"
              onClick={() => setStep(6)}
            >
              Create our world
              {arrowIcon}
            </button>
          </div>
        </div>
      )}

      {step === 6 && (
        <div className="screen active">
          <div className="blob b1 onboarding-blob--strong" />
          <div className="blob b2 onboarding-blob--strong" />
          <div className="blob b3 onboarding-blob--soft" />
          <StepsIndicator current={6} />
          <div className="screen-body onboarding-body--done">
            <div className="onboarding-done-top">
              <div className="onboarding-done-emoji">🐾</div>
              <h1 className="h1 onboarding-done-title">
                You're all set,
                <br />
                <span className="onboarding-done-name">
                  {dogName.trim() || 'friend'}
                </span>
                !
              </h1>
              <p className="body onboarding-done-copy">
                Your adventure journal is ready.
                <br />
                Let's make every day count.
              </p>
            </div>

            <div className="confirm-card">
              <div className="confirm-row">
                <span className="confirm-key">Dog</span>
                <span className="confirm-val">{dogName.trim() || '—'}</span>
              </div>
              <div className="confirm-row">
                <span className="confirm-key">Adventure styles</span>
                <span className="confirm-val">{confirmStyles}</span>
              </div>
              <div className="confirm-row">
                <span className="confirm-key">Area</span>
                <span className="confirm-val">San Diego, CA</span>
              </div>
              <div className="confirm-row">
                <span className="confirm-key">Spots ready</span>
                <span className="confirm-val onboarding-spots-ready">200+ nearby</span>
              </div>
            </div>

            <div className="onboarding-done-features">
              <div className="place-item onboarding-feature-item">
                <div className="onboarding-feature-emoji">🗓️</div>
                <div>
                  <div className="label onboarding-feature-label">
                    Monthly adventure plan
                  </div>
                  <div className="caption">
                    Curated for your dog · syncs to calendar
                  </div>
                </div>
              </div>
              <div className="place-item onboarding-feature-item">
                <div className="onboarding-feature-emoji">✨</div>
                <div>
                  <div className="label onboarding-feature-label">
                    Flashbacks &amp; memories
                  </div>
                  <div className="caption">Every adventure saved, forever</div>
                </div>
              </div>
              <div className="place-item onboarding-feature-item">
                <div className="onboarding-feature-emoji">🏅</div>
                <div>
                  <div className="label onboarding-feature-label">
                    SoCal Beach Challenge
                  </div>
                  <div className="caption">6 beaches. 1 month. Starts now.</div>
                </div>
              </div>
            </div>
          </div>
          <div className="bottom-bar">
            <button type="button" className="btn-primary" onClick={onComplete}>
              Start your first adventure
              {arrowIcon}
            </button>
          </div>
        </div>
      )}

      <div
        className={`modal-overlay${modalOpen ? ' open' : ''}`}
        onClick={() => setModalOpen(false)}
      >
        <div className="modal-sheet" onClick={(event) => event.stopPropagation()}>
          <div className="modal-handle" />
          <h2 className="h2 onboarding-modal-title">Add a spot</h2>
          <p className="body onboarding-modal-copy">
            Know somewhere great we haven't mapped? Tell us and we'll add it for
            the whole community.
          </p>
          <div className="field">
            <span className="field-label">Place Name</span>
            <input
              className="field-input"
              type="text"
              placeholder="e.g. Secret Cove Trail"
            />
          </div>
          <button type="button" className="btn-primary" onClick={() => setModalOpen(false)}>
            Submit this spot
          </button>
        </div>
      </div>
    </div>
  )
}
