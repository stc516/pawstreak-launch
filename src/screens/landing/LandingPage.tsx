import { useEffect, useRef } from 'react'
import { navigateTo } from '../../lib/demoRoute'
import { ROUTES, getAppSignInUrl } from '../../lib/routes'
import { SAMPLE_IMAGES } from '../../data/sampleImages'
import { BrandLogoCircle } from '../../components/BrandLogoCircle'
import { LandingPhonePreview } from '../../components/LandingPhonePreview'
import {
  BRAND_DESCRIPTION,
  BRAND_NAME,
  CTA_SIGN_IN,
  SIGNUP_SECTION_LEAD,
  SIGNUP_SECTION_TITLE,
  CTA_START_FIRST_ADVENTURE,
} from '../../lib/brand'

const KEY_FEATURES = [
  {
    icon: 'ti-compass',
    title: 'Adventure planner',
    copy: 'Pick dog-friendly beaches, trails, patios, and parks — then go.',
    image: SAMPLE_IMAGES.trail,
    tone: 'planner',
  },
  {
    icon: 'ti-book-2',
    title: 'Memory journal + map',
    copy: 'Save photos, notes, favorite spots, and the little moments that become their story.',
    image: SAMPLE_IMAGES.coastal,
    tone: 'journal',
  },
  {
    icon: 'ti-users',
    title: 'Pack sharing',
    copy: 'Let partners, family, roommates, and walkers help without sharing a password.',
    image: SAMPLE_IMAGES.park,
    tone: 'family',
  },
] as const

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Pick an adventure',
    copy: 'Choose a beach, trail, patio, or road trip worth doing together.',
  },
  {
    step: '02',
    title: 'Capture a memory',
    copy: 'Add a photo, a note, or the moment that made you both grin.',
  },
  {
    step: '03',
    title: 'Watch their story grow',
    copy: 'Your map, timeline, and milestones fill in — one adventure at a time.',
  },
] as const

export function LandingPage() {
  const landingRef = useRef<HTMLDivElement>(null)
  const signupRef = useRef<HTMLElement>(null)

  useEffect(() => {
    document.title = 'PawStreak — Adventures & memories with your dog'
    return () => {
      document.title = 'PawStreak'
    }
  }, [])

  const openSignup = () => navigateTo(ROUTES.app)

  const openLogin = () => navigateTo(getAppSignInUrl())

  return (
    <div className="landing" ref={landingRef}>
      <header className="landing-nav">
        <a className="landing-logo tap-target" href={ROUTES.landing} aria-label={BRAND_NAME}>
          <BrandLogoCircle className="brand-logo-circle--nav" size={56} />
        </a>
        <nav className="landing-nav-links" aria-label="Site">
          <button type="button" className="landing-nav-link tap-target" onClick={openLogin}>
            {CTA_SIGN_IN}
          </button>
        </nav>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-glow" aria-hidden="true" />
        <div className="landing-hero-inner">
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
            <button type="button" className="landing-btn landing-btn--primary tap-target" onClick={openSignup}>
              {CTA_START_FIRST_ADVENTURE}
            </button>
          </div>
        </div>
        <div className="landing-hero-visual" aria-hidden="true">
          <LandingPhonePreview />
        </div>
      </section>

      <section className="landing-section landing-features" aria-labelledby="landing-features-title">
        <div className="landing-section-head">
          <p className="landing-intro-kicker">What is PawStreak?</p>
          <h2 id="landing-features-title" className="landing-section-title">
            The app for the life you&apos;re already building with your dog.
          </h2>
          <p className="landing-section-lead">
            Plan outings, save memories, share care with your pack, and watch your dog&apos;s story
            grow over time.
          </p>
        </div>
        <div className="landing-features-grid">
          {KEY_FEATURES.map((feature) => (
            <article
              key={feature.title}
              className={`landing-feature-card landing-feature-card--${feature.tone}`}
            >
              <div
                className="landing-feature-image"
                style={{ backgroundImage: `url(${feature.image})` }}
                role="img"
                aria-label={feature.title}
              />
              <div className="landing-feature-body">
                <i className={`ti ${feature.icon} landing-feature-icon`} aria-hidden="true" />
                <h3>{feature.title}</h3>
                <p>{feature.copy}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section landing-story" aria-labelledby="landing-story-title">
        <div className="landing-story-inner">
          <div className="landing-story-copy">
            <p className="landing-story-kicker">Why dog parents care</p>
            <h2 id="landing-story-title" className="landing-section-title landing-story-title">
              Your camera roll wasn&apos;t built for this.
            </h2>
            <p className="landing-story-lead">
              Most dog photos disappear into the camera roll. PawStreak turns the life you&apos;re
              building with your dog into a living story.
            </p>
            <p className="landing-story-body">
              The beach mornings. The trail you keep coming back to. The road trip where they
              finally learned to love the car. These aren&apos;t just photos — they&apos;re the
              chapters of a life you&apos;re sharing. PawStreak keeps them close, organized, and
              worth revisiting.
            </p>
          </div>
          <div className="landing-story-visual" aria-hidden="true">
            <div className="landing-story-photo-stack">
              <div
                className="landing-story-photo landing-story-photo--back"
                style={{ backgroundImage: `url(${SAMPLE_IMAGES.trail})` }}
              />
              <div
                className="landing-story-photo landing-story-photo--mid"
                style={{ backgroundImage: `url(${SAMPLE_IMAGES.beach})` }}
              />
              <div
                className="landing-story-photo landing-story-photo--front"
                style={{ backgroundImage: `url(${SAMPLE_IMAGES.park})` }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section landing-how" aria-labelledby="landing-how-title">
        <div className="landing-section-head">
          <h2 id="landing-how-title" className="landing-section-title">
            How it works
          </h2>
          <p className="landing-section-lead">Three steps. One story that keeps growing.</p>
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
              that make life with a dog feel so full. Something warm and personal, made for the
              real joy of getting out together.
            </p>
            <p className="landing-founder-sign">— Stephen, Bailey &amp; Meiomi</p>
          </div>
        </div>
      </section>

      <section className="landing-section landing-signup" ref={signupRef} id="signup">
        <div className="landing-signup-inner">
          <div className="landing-signup-copy">
            <h2 className="landing-section-title">{SIGNUP_SECTION_TITLE}</h2>
            <p className="landing-section-lead">{SIGNUP_SECTION_LEAD}</p>
          </div>

          <div className="landing-signup-actions">
            <button type="button" className="landing-btn landing-btn--primary landing-btn--full tap-target" onClick={openSignup}>
              {CTA_START_FIRST_ADVENTURE}
            </button>
            <button type="button" className="landing-btn landing-btn--secondary landing-btn--full tap-target" onClick={openLogin}>
              {CTA_SIGN_IN}
            </button>
            <p className="landing-signup-note">
              Free to start. Early access beta — San Diego first, expanding soon.
            </p>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-brand">
            <BrandLogoCircle className="brand-logo-circle--footer" size={48} />
          </div>
          <nav className="landing-footer-links" aria-label="Footer">
            <button type="button" className="landing-footer-link-btn tap-target" onClick={openLogin}>
              {CTA_SIGN_IN}
            </button>
            <button type="button" className="landing-footer-link-btn tap-target" onClick={openSignup}>
              Start
            </button>
            <a href="mailto:hello@pawstreakapp.com">Contact</a>
          </nav>
          <p className="landing-footer-note">&copy; {new Date().getFullYear()} PawStreak</p>
        </div>
      </footer>
    </div>
  )
}
