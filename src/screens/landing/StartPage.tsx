import { useEffect } from 'react'
import { BrandLogoCircle } from '../../components/BrandLogoCircle'
import { LandingPhonePreview } from '../../components/LandingPhonePreview'
import { navigateTo } from '../../lib/demoRoute'
import { BRAND_NAME, BRAND_TAGLINE, CTA_LOGIN_SIGNUP } from '../../lib/brand'
import { ROUTES } from '../../lib/routes'

export function StartPage() {
  useEffect(() => {
    document.title = 'Start using PawStreak — PawStreak'
    return () => {
      document.title = 'PawStreak'
    }
  }, [])

  const openApp = () => navigateTo(ROUTES.app)

  return (
    <div className="landing start-page">
      <header className="landing-nav">
        <a className="landing-logo tap-target" href={ROUTES.landing} aria-label={BRAND_NAME}>
          <BrandLogoCircle className="brand-logo-circle--nav" size={56} />
        </a>
        <nav className="landing-nav-links" aria-label="Site">
          <a className="landing-nav-link tap-target" href={`${ROUTES.landing}#waitlist`}>
            Waitlist
          </a>
          <button type="button" className="landing-nav-cta tap-target" onClick={openApp}>
            {CTA_LOGIN_SIGNUP}
          </button>
        </nav>
      </header>

      <main className="start-page-main">
        <div className="start-page-glow" aria-hidden="true" />

        <section className="start-page-hero">
          <div className="start-page-hero-copy">
            <p className="start-page-kicker">{BRAND_TAGLINE}</p>
            <h1 className="start-page-title">Start using PawStreak today</h1>
            <p className="start-page-lead">
              Plan adventures, save memories, and build your dog&apos;s story — PawStreak is ready
              to use now on your phone.
            </p>
            <button
              type="button"
              className="landing-btn landing-btn--primary start-page-cta tap-target"
              onClick={openApp}
            >
              {CTA_LOGIN_SIGNUP}
            </button>
            <p className="start-page-emotion">
              Every walk, beach day, and road trip becomes part of their story — not another photo
              lost in your camera roll.
            </p>
          </div>

          <div className="start-page-hero-visual" aria-hidden="true">
            <LandingPhonePreview />
          </div>
        </section>

        <section className="start-page-install" aria-label="Install PawStreak">
          <div className="start-page-install-head">
            <h2 className="start-page-install-title">Make it feel like a real app</h2>
            <p className="start-page-install-lead">
              Add PawStreak to your home screen for one-tap access, full-screen adventures, and the
              warmest PawStreak experience on the web today.
            </p>
          </div>

          <div className="start-install-steps">
            <article className="start-install-step">
              <span className="start-install-step-label">iPhone</span>
              <p className="start-install-step-copy">Safari → Share → Add to Home Screen</p>
            </article>
            <article className="start-install-step">
              <span className="start-install-step-label">Android</span>
              <p className="start-install-step-copy">Chrome → Menu → Add to Home Screen</p>
            </article>
          </div>

          <p className="start-page-install-note">
            Allow notifications when prompted — reminders for adventures, memories, and streaks are
            rolling out as part of early access.
          </p>
        </section>

        <p className="start-page-note">
          Native iPhone + Android apps are on the way.{' '}
          <a href={`${ROUTES.landing}#waitlist`}>Join the waitlist</a> for launch access while you
          use PawStreak on the web.
        </p>
      </main>

      <footer className="landing-footer start-page-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-brand">
            <BrandLogoCircle className="brand-logo-circle--footer" size={48} />
          </div>
          <nav className="landing-footer-links" aria-label="Footer">
            <a href={ROUTES.landing}>Home</a>
            <a href={`${ROUTES.landing}#waitlist`}>Waitlist</a>
            <a href="mailto:hello@pawstreakapp.com">Contact</a>
          </nav>
          <p className="landing-footer-note">&copy; {new Date().getFullYear()} PawStreak</p>
        </div>
      </footer>
    </div>
  )
}
