import { useEffect, useRef, useState, type FormEvent } from 'react'
import { navigateTo } from '../../lib/demoRoute'
import { insertWaitlistSignup, isValidWaitlistEmail } from '../../lib/db/waitlist'
import { trackUserEvent } from '../../lib/db/userEvents'
import { ROUTES } from '../../lib/routes'
import { isSupabaseConfigured } from '../../lib/supabase'
import { SAMPLE_IMAGES } from '../../data/sampleImages'
import { BrandLogoCircle, BrandLogoFull } from '../../components/BrandLogoCircle'
import { LandingPhonePreview } from '../../components/LandingPhonePreview'
import { BRAND_DESCRIPTION, BRAND_NAME, BRAND_TAGLINE, CTA_ADD_TO_HOME_SCREEN, CTA_GET_STARTED, CTA_JOIN_WAITLIST } from '../../lib/brand'

const PREVIEW_FEATURES = [
  {
    icon: 'ti-map-pin',
    title: 'Adventure map',
    copy: 'See where you’ve been and what’s next on the trail.',
    image: SAMPLE_IMAGES.trail,
    tone: 'trail',
  },
  {
    icon: 'ti-timeline',
    title: 'Journey timeline',
    copy: 'Every walk, beach day, and road trip in one living story.',
    image: SAMPLE_IMAGES.beach,
    tone: 'journey',
  },
  {
    icon: 'ti-compass',
    title: 'Local adventures',
    copy: 'Dog-friendly beaches, trails, patios, and parks near you.',
    image: SAMPLE_IMAGES.trail,
    tone: 'local',
  },
  {
    icon: 'ti-camera',
    title: 'Memory capture',
    copy: 'Photos, notes, and favorite moments — saved where they belong.',
    image: SAMPLE_IMAGES.coastal,
    tone: 'memory',
  },
] as const

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Find adventures',
    copy: 'Discover dog-friendly beaches, trails, patios, parks, and road trips.',
  },
  {
    step: '02',
    title: 'Capture memories',
    copy: 'Save photos, notes, and moments from your adventures together.',
  },
  {
    step: '03',
    title: 'Build their story',
    copy: 'Create a living timeline of your dog’s life and favorite places.',
  },
] as const

export function LandingPage() {
  const landingRef = useRef<HTMLDivElement>(null)
  const waitlistRef = useRef<HTMLElement>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [dogName, setDogName] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    document.title = 'PawStreak — Adventures & memories with your dog'
    return () => {
      document.title = 'PawStreak'
    }
  }, [])

  const scrollToWaitlist = () => {
    waitlistRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)

    if (!isValidWaitlistEmail(email)) {
      setError('Please enter a valid email address.')
      return
    }

    if (!isSupabaseConfigured()) {
      setError('Waitlist is temporarily unavailable. Please try again soon.')
      return
    }

    setLoading(true)

    const result = await insertWaitlistSignup({
      name,
      email,
      dogName,
      zipCode,
      source: 'landing_page',
    })

    if (!result.ok) {
      const message =
        result.reason === 'invalid_email'
          ? 'Please enter a valid email address.'
          : 'Could not save your signup. Please try again.'
      setError(message)
      setLoading(false)
      return
    }

    await trackUserEvent('early_access_joined', { email, source: 'landing_page' })
    setSubmitted(true)
    setLoading(false)
  }

  return (
    <div className="landing" ref={landingRef}>
      <header className="landing-nav">
        <a className="landing-logo tap-target" href={ROUTES.landing} aria-label={BRAND_NAME}>
          <BrandLogoCircle className="brand-logo-circle--nav" size={56} />
        </a>
        <nav className="landing-nav-links" aria-label="Site">
          <button type="button" className="landing-nav-link tap-target" onClick={scrollToWaitlist}>
            Waitlist
          </button>
          <button
            type="button"
            className="landing-nav-cta tap-target"
            onClick={() => navigateTo(ROUTES.start)}
          >
            {CTA_GET_STARTED}
          </button>
        </nav>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-glow" aria-hidden="true" />
        <div className="landing-hero-inner">
          <div className="landing-hero-mark-wrap" aria-hidden="true">
            <BrandLogoCircle className="brand-logo-circle--hero" size={76} />
          </div>
          <p className="landing-kicker">For dogs who make life better</p>
          <h1 className="landing-headline">
            More adventures.
            <br />
            More memories.
            <br />
            More life together.
          </h1>
          <p className="landing-subhead">{BRAND_DESCRIPTION}</p>
          <div className="landing-hero-actions">
            <button type="button" className="landing-btn landing-btn--primary tap-target" onClick={scrollToWaitlist}>
              {CTA_JOIN_WAITLIST}
            </button>
            <button
              type="button"
              className="landing-btn landing-btn--secondary tap-target"
              onClick={() => navigateTo(ROUTES.start)}
            >
              {CTA_GET_STARTED}
            </button>
          </div>
        </div>
        <div className="landing-hero-visual" aria-hidden="true">
          <LandingPhonePreview />
        </div>
      </section>

      <section className="landing-section landing-preview">
        <div className="landing-section-head">
          <h2 className="landing-section-title">Built for the dogs that make life better.</h2>
          <p className="landing-section-lead">
            Plan outings, capture the good stuff, and watch your dog&apos;s story grow — one adventure
            at a time.
          </p>
        </div>
        <div className="landing-preview-grid">
          {PREVIEW_FEATURES.map((feature) => (
            <article key={feature.title} className={`landing-preview-card landing-preview-card--${feature.tone}`}>
              <div
                className="landing-preview-image"
                style={{ backgroundImage: `url(${feature.image})` }}
                role="img"
                aria-label={feature.title}
              />
              <div className="landing-preview-body">
                <i className={`ti ${feature.icon} landing-preview-icon`} aria-hidden="true" />
                <h3>{feature.title}</h3>
                <p>{feature.copy}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section landing-how">
        <div className="landing-section-head">
          <h2 className="landing-section-title">How it works</h2>
        </div>
        <div className="landing-how-grid">
          {HOW_IT_WORKS.map((item) => (
            <article key={item.step} className="landing-how-card">
              <span className="landing-how-step">{item.step}</span>
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section landing-founder">
        <div className="landing-founder-inner">
          <div className="landing-founder-copy">
            <h2 className="landing-section-title">Built with Bailey &amp; Meiomi in San Diego.</h2>
            <p>
              PawStreak started on ordinary mornings — leash up, coffee in hand, another trail we
              swore we&apos;d remember forever. Most of those moments ended up buried in the camera
              roll, mixed in with screenshots and grocery lists.
            </p>
            <p>
              We wanted a place for the adventures, the routines, and the little in-between moments
              that make life with a dog feel so full. Something warm and personal — not another app
              that treats your pup like a patient file.
            </p>
            <p className="landing-founder-sign">— Stephen, Bailey &amp; Meiomi</p>
          </div>
          <div className="landing-founder-visual" aria-hidden="true">
            <div className="landing-founder-brand">
              <BrandLogoFull className="brand-logo-full--founder" />
              <p className="landing-founder-tagline">{BRAND_TAGLINE}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section landing-waitlist" ref={waitlistRef} id="waitlist">
        <div className="landing-waitlist-inner">
          <div className="landing-waitlist-copy">
            <h2 className="landing-section-title">Be first on the trail.</h2>
            <p className="landing-section-lead">
              {CTA_JOIN_WAITLIST} — early access to PawStreak starts in San Diego and expands from
              there.
            </p>
          </div>

          {submitted ? (
            <div className="landing-waitlist-success" role="status">
              <i className="ti ti-circle-check landing-waitlist-success-icon" aria-hidden="true" />
              <p>You&apos;re on the PawStreak waitlist.</p>
              <p className="landing-waitlist-success-note">{CTA_ADD_TO_HOME_SCREEN}</p>
            </div>
          ) : (
            <form className="landing-waitlist-form" onSubmit={handleSubmit} noValidate>
              <label className="landing-field">
                <span>Your name</span>
                <input
                  type="text"
                  name="name"
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="First name"
                />
              </label>
              <label className="landing-field">
                <span>Email</span>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@email.com"
                />
              </label>
              <label className="landing-field">
                <span>Dog&apos;s name</span>
                <input
                  type="text"
                  name="dogName"
                  value={dogName}
                  onChange={(event) => setDogName(event.target.value)}
                  placeholder="e.g. Bailey"
                />
              </label>
              <label className="landing-field">
                <span>ZIP code</span>
                <input
                  type="text"
                  name="zipCode"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  value={zipCode}
                  onChange={(event) => setZipCode(event.target.value)}
                  placeholder="92123"
                />
              </label>
              {error ? (
                <p className="landing-waitlist-error" role="alert">
                  {error}
                </p>
              ) : null}
              <button
                type="submit"
                className="landing-btn landing-btn--primary landing-btn--full tap-target"
                disabled={loading}
              >
                {loading ? 'Joining…' : CTA_JOIN_WAITLIST}
              </button>
            </form>
          )}
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-brand">
            <BrandLogoCircle className="brand-logo-circle--footer" size={48} />
          </div>
          <nav className="landing-footer-links" aria-label="Footer">
            <a href="https://instagram.com/pawstreakapp" target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
            <a href="https://tiktok.com/@pawstreakapp" target="_blank" rel="noopener noreferrer">
              TikTok
            </a>
            <button type="button" className="landing-footer-link-btn tap-target" onClick={() => navigateTo(ROUTES.start)}>
              {CTA_GET_STARTED}
            </button>
            <a href="mailto:hello@pawstreakapp.com">Contact</a>
          </nav>
          <p className="landing-footer-note">&copy; {new Date().getFullYear()} PawStreak</p>
        </div>
      </footer>
    </div>
  )
}
