import { useMemo, useRef, useState } from 'react'
import {
  dogAges,
  dogBreeds,
  onboardingCatChips,
  onboardingPlaces,
  onboardingVibes,
} from '../../data/demo'
import { readImageFileAsDataUrl } from '../../lib/imageUtils'
import type { OnboardingResult } from '../../lib/onboardingProfile'
import { resolveLocationProfile } from '../../lib/onboardingProfile'
import { BrandLogoCircle } from '../../components/BrandLogoCircle'
import { OnboardingEntryPreview } from '../../components/OnboardingEntryPreview'
import {
  APP_ENTRY_SUBHEAD,
  APP_ENTRY_TITLE,
  BRAND_NAME,
  CTA_LOGIN_SIGNUP,
} from '../../lib/brand'

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

function formatOnboardingDoneNames(names: string[]): string {
  if (names.length === 0) return 'friend'
  if (names.length === 1) return names[0]
  if (names.length === 2) return `${names[0]} & ${names[1]}`
  return `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`
}

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
  onComplete: (result: OnboardingResult) => void
  initialStep?: number
  authConfigured?: boolean
  authLoading?: boolean
  authError?: string | null
  onEmailAuth?: (
    mode: 'signup' | 'signin',
    input: { email: string; password: string; userName: string },
  ) => Promise<void>
  onGoogleAuth?: () => Promise<void>
}

export function OnboardingFlow({
  onComplete,
  initialStep = 1,
  authConfigured = false,
  authLoading = false,
  authError = null,
  onEmailAuth,
  onGoogleAuth,
}: OnboardingFlowProps) {
  const [step, setStep] = useState(initialStep)
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup')
  const [userName, setUserName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [dogName, setDogName] = useState('')
  const [dogBreed, setDogBreed] = useState('')
  const [dogOtherBreed, setDogOtherBreed] = useState('')
  const [dogAge, setDogAge] = useState(dogAges[1])
  const [secondDogOn, setSecondDogOn] = useState(false)
  const [secondDogName, setSecondDogName] = useState('')
  const [secondDogBreed, setSecondDogBreed] = useState('')
  const [secondDogOtherBreed, setSecondDogOtherBreed] = useState('')
  const [secondDogAge, setSecondDogAge] = useState(dogAges[3])
  const [selectedVibes, setSelectedVibes] = useState<string[]>([])
  const [selectedCats, setSelectedCats] = useState<string[]>(['park'])
  const [locationQuery, setLocationQuery] = useState('92123')
  const [modalOpen, setModalOpen] = useState(false)
  const [dogPhotoPreview, setDogPhotoPreview] = useState<string | null>(null)
  const [dogPhotoError, setDogPhotoError] = useState<string | null>(null)
  const dogPhotoInputRef = useRef<HTMLInputElement>(null)

  const signupValid =
    email.includes('@') &&
    password.trim().length >= 8 &&
    (authMode === 'signin' || userName.trim().length > 0)
  const dogValid = dogName.trim().length > 0
  const vibesValid = selectedVibes.length > 0

  const displayDogName = dogName.trim() || 'your dog'
  const locationProfile = useMemo(
    () => resolveLocationProfile(locationQuery),
    [locationQuery],
  )
  const confirmStyles = useMemo(
    () => (selectedVibes.length ? selectedVibes.join(', ') : '—'),
    [selectedVibes],
  )
  const onboardingDogNames = useMemo(() => {
    const names: string[] = []
    if (dogName.trim()) names.push(dogName.trim())
    if (secondDogOn && secondDogName.trim()) names.push(secondDogName.trim())
    return names
  }, [dogName, secondDogOn, secondDogName])
  const onboardingDoneNames = formatOnboardingDoneNames(onboardingDogNames)
  const onboardingDogSummary =
    onboardingDogNames.length > 0 ? onboardingDogNames.join(', ') : '—'

  const handleComplete = () => {
    const dogs = [
      {
        name: dogName,
        breed: dogBreed,
        otherBreed: dogOtherBreed,
        age: dogAge,
      },
    ]

    if (secondDogOn && secondDogName.trim()) {
      dogs.push({
        name: secondDogName,
        breed: secondDogBreed,
        otherBreed: secondDogOtherBreed,
        age: secondDogAge,
      })
    }

    onComplete({
      userName,
      dogs,
      vibeNames: selectedVibes,
      categoryIds: selectedCats,
      locationQuery,
    })
  }

  const handleAuthContinue = async () => {
    try {
      if (authConfigured && onEmailAuth) {
        await onEmailAuth(authMode, { email, password, userName })
      }
      setStep(3)
    } catch {
      // Stay on auth step when sign-in/up fails.
    }
  }

  const handleGoogleContinue = async () => {
    if (authConfigured && onGoogleAuth) {
      await onGoogleAuth()
      return
    }
    setStep(3)
  }

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

  const handleDogPhotoPick = () => {
    setDogPhotoError(null)
    dogPhotoInputRef.current?.click()
  }

  const handleDogPhotoSelected = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    try {
      const dataUrl = await readImageFileAsDataUrl(file)
      setDogPhotoPreview(dataUrl)
      setDogPhotoError(null)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Could not load that photo'
      console.warn('Onboarding dog photo failed:', message)
      setDogPhotoError('Could not load that photo. Try another image.')
    }
  }

  return (
    <div className="app-viewport">
      <div className="app-shell app-shell--onboarding">
        <div className="onboarding-root">
      {step === 1 && (
        <div className="screen active">
          <div className="blob b1 onboarding-blob--warm" />
          <div className="blob b2 onboarding-blob--warm" />
          <div className="screen-body onboarding-body--welcome onboarding-welcome-entry">
            <div className="onboarding-welcome-header">
              <BrandLogoCircle className="brand-logo-circle--nav" size={44} />
              <span className="onboarding-welcome-brand">{BRAND_NAME}</span>
            </div>

            <h1 className="h1 onboarding-welcome-title">{APP_ENTRY_TITLE}</h1>
            <p className="body onboarding-welcome-subhead">{APP_ENTRY_SUBHEAD}</p>

            <OnboardingEntryPreview />
          </div>
          <div className="bottom-bar">
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                setAuthMode('signup')
                setStep(2)
              }}
            >
              {CTA_LOGIN_SIGNUP}
              {arrowIcon}
            </button>
            {authConfigured ? (
              <button
                type="button"
                className="demo-feedback-link onboarding-welcome-signin"
                onClick={() => {
                  setAuthMode('signin')
                  setStep(2)
                }}
              >
                Already have an account? Sign in
              </button>
            ) : null}
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
            <h2 className="h2 onboarding-center-title">
              {authMode === 'signup' ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="body onboarding-center-copy">
              {authConfigured
                ? authMode === 'signup'
                  ? 'Free to start. Your dog\'s story starts here.'
                  : 'Sign in to pick up your pack\'s story.'
                : 'Free to start. Your dog\'s story starts here.'}
            </p>

            <button type="button" className="btn-google onboarding-google-gap" onClick={handleGoogleContinue}>
              Continue with Google
            </button>
            <button type="button" className="btn-google onboarding-google-bottom" disabled>
              Continue with Apple (soon)
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
                disabled={authMode === 'signin'}
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
              disabled={!signupValid || authLoading}
              onClick={handleAuthContinue}
            >
              {authLoading
                ? 'Working…'
                : authMode === 'signup'
                  ? 'Create account'
                  : 'Sign in'}
              {arrowIcon}
            </button>
            <button
              type="button"
              className="demo-feedback-link"
              onClick={() =>
                setAuthMode((current) => (current === 'signup' ? 'signin' : 'signup'))
              }
            >
              {authMode === 'signup'
                ? 'Already have an account? Sign in'
                : 'Need an account? Create one'}
            </button>
            {authError ? (
              <p className="demo-feedback-status" role="alert">
                {authError}
              </p>
            ) : null}
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
              <input
                ref={dogPhotoInputRef}
                className="cam-input"
                type="file"
                accept="image/*"
                onChange={handleDogPhotoSelected}
                tabIndex={-1}
                aria-hidden="true"
              />
              <button
                type="button"
                className="photo-circle"
                onClick={handleDogPhotoPick}
                aria-label="Upload dog photo"
                style={{ overflow: 'hidden', padding: 0, cursor: 'pointer' }}
              >
                {dogPhotoPreview ? (
                  <img
                    src={dogPhotoPreview}
                    alt=""
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                ) : (
                  <div className="photo-placeholder">
                    <span className="photo-upload-label">UPLOAD</span>
                  </div>
                )}
              </button>
              <button
                type="button"
                className="photo-edit"
                onClick={handleDogPhotoPick}
                aria-label="Change dog photo"
                style={{ border: 'none', padding: 0, cursor: 'pointer' }}
              >
                <svg viewBox="0 0 14 14" stroke="white" fill="none" strokeWidth="1.5">
                  <path d="M9.5 2.5l2 2-7 7H2.5v-2l7-7z" />
                </svg>
              </button>
              {dogPhotoError ? (
                <p
                  className="caption"
                  role="alert"
                  style={{ textAlign: 'center', marginTop: 8 }}
                >
                  {dogPhotoError}
                </p>
              ) : null}
            </div>

            <div className="field">
              <span className="field-label">Dog Name</span>
              <input
                className="field-input"
                type="text"
                placeholder="e.g. Luna"
                value={dogName}
                onChange={(event) => setDogName(event.target.value)}
              />
            </div>
            <div className="onboarding-grid-2">
              <div className="field onboarding-field-flush">
                <span className="field-label">Breed</span>
                <select
                  className="field-input"
                  value={dogBreed}
                  onChange={(event) => setDogBreed(event.target.value)}
                >
                  <option value="">Select</option>
                  {dogBreeds.map((breed) => (
                    <option key={breed} value={breed}>
                      {breed}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field onboarding-field-flush">
                <span className="field-label">Age</span>
                <select
                  className="field-input"
                  value={dogAge}
                  onChange={(event) => setDogAge(event.target.value)}
                >
                  {dogAges.map((age) => (
                    <option key={age} value={age}>
                      {age}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {dogBreed === 'Mixed / Other' ? (
              <div className="field">
                <span className="field-label">Breed details</span>
                <input
                  className="field-input"
                  type="text"
                  placeholder="Tell us the mix or breed"
                  value={dogOtherBreed}
                  onChange={(event) => setDogOtherBreed(event.target.value)}
                />
              </div>
            ) : null}

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
                  Every dog in your pack shows on adventure cards.
                </div>
              </div>
              <div className={`tog${secondDogOn ? ' on' : ''}`} />
            </button>

            {secondDogOn && (
              <div className="second-dog-form">
                <div className="label onboarding-second-dog-label">Second dog</div>
                <div className="field">
                  <span className="field-label">Name</span>
                  <input
                    className="field-input"
                    type="text"
                    placeholder="e.g. Max"
                    value={secondDogName}
                    onChange={(event) => setSecondDogName(event.target.value)}
                  />
                </div>
                <div className="onboarding-grid-2">
                  <div className="field onboarding-field-flush">
                    <span className="field-label">Breed</span>
                    <select
                      className="field-input"
                      value={secondDogBreed}
                      onChange={(event) => setSecondDogBreed(event.target.value)}
                    >
                      <option value="">Select</option>
                      {dogBreeds.map((breed) => (
                        <option key={breed} value={breed}>
                          {breed}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field onboarding-field-flush">
                    <span className="field-label">Age</span>
                    <select
                      className="field-input"
                      value={secondDogAge}
                      onChange={(event) => setSecondDogAge(event.target.value)}
                    >
                      {dogAges.map((age) => (
                        <option key={age} value={age}>
                          {age}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {secondDogBreed === 'Mixed / Other' ? (
                  <div className="field">
                    <span className="field-label">Breed details</span>
                    <input
                      className="field-input"
                      type="text"
                      placeholder="Tell us the mix or breed"
                      value={secondDogOtherBreed}
                      onChange={(event) => setSecondDogOtherBreed(event.target.value)}
                    />
                  </div>
                ) : null}
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
                placeholder="ZIP, city, or neighborhood — e.g. 92123 or San Diego"
                value={locationQuery}
                onChange={(event) => setLocationQuery(event.target.value)}
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
                  {onboardingDoneNames}!
                </span>
              </h1>
              <p className="body onboarding-done-copy">
                Your adventure journal is ready.
                <br />
                Let's make every day count.
              </p>
            </div>

            <div className="confirm-card">
              <div className="confirm-row">
                <span className="confirm-key">
                  {onboardingDogNames.length === 1 ? 'Dog' : 'Dogs'}
                </span>
                <span className="confirm-val">{onboardingDogSummary}</span>
              </div>
              <div className="confirm-row">
                <span className="confirm-key">Adventure styles</span>
                <span className="confirm-val">{confirmStyles}</span>
              </div>
              <div className="confirm-row">
                <span className="confirm-key">Area</span>
                <span className="confirm-val">{locationProfile.label}</span>
              </div>
              <div className="confirm-row">
                <span className="confirm-key">Spots ready</span>
                <span className="confirm-val onboarding-spots-ready">
                  {locationProfile.supported ? '200+ nearby' : 'Suggested adventures for now'}
                </span>
              </div>
              {!locationProfile.supported ? (
                <div className="confirm-note">
                  We&apos;re still building your area. You can request it, but suggested
                  adventures will show for now.
                </div>
              ) : null}
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
            <button type="button" className="btn-primary" onClick={handleComplete}>
              Start your first adventure
              {arrowIcon}
            </button>
          </div>
        </div>
      )}

      <div
        className={`modal-overlay${modalOpen ? ' open' : ''}`}
        aria-hidden={!modalOpen}
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
      </div>
    </div>
  )
}
