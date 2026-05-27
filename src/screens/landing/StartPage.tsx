import { useEffect } from 'react'
import { BrandLogoCircle } from '../../components/BrandLogoCircle'
import { navigateTo } from '../../lib/demoRoute'
import {
  BRAND_NAME,
  CTA_CONTINUE_BROWSER,
  CTA_LOGIN_SIGNUP,
} from '../../lib/brand'
import { ROUTES } from '../../lib/routes'

export function StartPage() {
  useEffect(() => {
    document.title = 'Start using PawStreak — PawStreak'
    return () => {
      document.title = 'PawStreak'
    }
  }, [])

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
          <button
            type="button"
            className="landing-nav-cta tap-target"
            onClick={() => navigateTo(ROUTES.app)}
          >
            {CTA_CONTINUE_BROWSER}
          </button>
        </nav>
      </header>

      <main className="start-page-main">
        <section className="start-page-hero">
          <h1 className="start-page-title">Start using PawStreak today</h1>
          <p className="start-page-lead">
            PawStreak works in your browser now. Add it to your home screen for the best app-like
            experience.
          </p>
        </section>

        <section className="start-page-cards" aria-label="Setup steps">
          <article className="start-card">
            <h2 className="start-card-title">Use it like an app</h2>
            <p className="start-card-copy">
              Open PawStreak in Safari or Chrome and add it to your home screen.
            </p>
          </article>

          <article className="start-card">
            <h2 className="start-card-title">iPhone</h2>
            <p className="start-card-copy start-card-copy--mono">Safari → Share → Add to Home Screen</p>
          </article>

          <article className="start-card">
            <h2 className="start-card-title">Android</h2>
            <p className="start-card-copy start-card-copy--mono">Chrome → Menu → Add to Home Screen</p>
          </article>

          <article className="start-card">
            <h2 className="start-card-title">Notifications</h2>
            <p className="start-card-copy">
              Allow notifications when prompted so PawStreak can remind you about adventures,
              memories, and streaks. Notifications are rolling out as part of early access.
            </p>
          </article>
        </section>

        <section className="start-page-actions">
          <button
            type="button"
            className="landing-btn landing-btn--primary landing-btn--full tap-target"
            onClick={() => navigateTo(ROUTES.app)}
          >
            {CTA_LOGIN_SIGNUP}
          </button>
          <button
            type="button"
            className="landing-btn landing-btn--secondary landing-btn--full tap-target"
            onClick={() => navigateTo(ROUTES.app)}
          >
            {CTA_CONTINUE_BROWSER}
          </button>
        </section>

        <p className="start-page-note">
          Native iPhone + Android apps are coming soon.{' '}
          <a href={`${ROUTES.landing}#waitlist`}>Join the waitlist</a> to get launch access.
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
