import { useEffect, useState } from 'react'
import { BrandLogoCircle } from '../../components/BrandLogoCircle'
import { LandingPhonePreview } from '../../components/LandingPhonePreview'
import { navigateTo } from '../../lib/demoRoute'
import {
  BRAND_NAME,
  BRAND_TAGLINE,
  CTA_CREATE_ACCOUNT,
  CTA_SIGN_IN,
  CTA_START_FREE,
} from '../../lib/brand'
import { isStandaloneDisplayMode } from '../../lib/pwa'
import { ROUTES, getAppSignInUrl } from '../../lib/routes'

export function StartPage() {
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    setInstalled(isStandaloneDisplayMode())
    document.title = 'Start using PawStreak — PawStreak'
    return () => {
      document.title = 'PawStreak'
    }
  }, [])

  const openApp = () => navigateTo(ROUTES.app)

  const openLogin = () => navigateTo(getAppSignInUrl())

  return (
    <div className="landing start-page">
      <header className="landing-nav">
        <a className="landing-logo tap-target" href={ROUTES.landing} aria-label={BRAND_NAME}>
          <BrandLogoCircle className="brand-logo-circle--nav" size={56} />
        </a>
        <nav className="landing-nav-links" aria-label="Site">
          <button type="button" className="landing-nav-link tap-target" onClick={openLogin}>
            {CTA_SIGN_IN}
          </button>
          <a className="landing-nav-link tap-target" href={`${ROUTES.landing}#signup`}>
            Sign up
          </a>
          <button type="button" className="landing-nav-cta tap-target" onClick={openApp}>
            {CTA_CREATE_ACCOUNT}
          </button>
        </nav>
      </header>

      <main className="start-page-main">
        <div className="start-page-glow" aria-hidden="true" />

        <section className="start-page-hero">
          <div className="start-page-hero-copy">
            <p className="start-page-kicker">{BRAND_TAGLINE}</p>
            <h1 className="start-page-title">PawStreak is live — start today</h1>
            <p className="start-page-lead">
              Create your free account and start your first PawStreak. Plan walks, save memories,
              and build your dog&apos;s journey on the web today.
            </p>
            <button
              type="button"
              className="landing-btn landing-btn--primary start-page-cta tap-target"
              onClick={openApp}
            >
              {CTA_CREATE_ACCOUNT}
            </button>
            <button
              type="button"
              className="landing-btn landing-btn--secondary start-page-cta-secondary tap-target"
              onClick={openApp}
            >
              {CTA_START_FREE}
            </button>
            <button
              type="button"
              className="landing-btn landing-btn--secondary start-page-cta-secondary tap-target"
              onClick={openLogin}
            >
              {CTA_SIGN_IN}
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
            <h2 className="start-page-install-title">
              {installed ? 'PawStreak is on your home screen' : 'Make it feel like a real app'}
            </h2>
            <p className="start-page-install-lead">
              {installed
                ? 'Open PawStreak from your home screen anytime — full-screen adventures, your pack profile, and memories saved to your account.'
                : 'Install PawStreak for one-tap access, full-screen adventures, and the warmest PawStreak experience on the web today.'}
            </p>
          </div>

          {installed ? (
            <button
              type="button"
              className="landing-btn landing-btn--primary start-page-cta tap-target"
              onClick={openApp}
            >
              Open PawStreak
            </button>
          ) : (
            <div className="start-install-steps">
              <article className="start-install-step">
                <span className="start-install-step-label">iPhone</span>
                <p className="start-install-step-copy">
                  Safari → Share → Add to Home Screen
                </p>
                <p className="start-install-step-detail">
                  Use Safari (not Chrome). Confirm the name PawStreak, then tap Add.
                </p>
              </article>
              <article className="start-install-step">
                <span className="start-install-step-label">Android</span>
                <p className="start-install-step-copy">
                  Chrome → Install app (or Menu → Add to Home screen)
                </p>
                <p className="start-install-step-detail">
                  Look for Install app in the address bar or Chrome menu, then open from
                  your home screen.
                </p>
              </article>
            </div>
          )}

          <p className="start-page-install-note">
            {installed
              ? 'Installed PawStreak opens directly to your app — sign in once and your pack stays synced.'
              : 'After installing, PawStreak opens straight to /app in full-screen mode. Sign in to sync adventures and memories.'}
          </p>
        </section>

        <p className="start-page-note">
          Native iPhone + Android apps are on the way. Use PawStreak on the web today —{' '}
          <a href={ROUTES.app}>create your free account</a> and start your first adventure.
        </p>
      </main>

      <footer className="landing-footer start-page-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-brand">
            <BrandLogoCircle className="brand-logo-circle--footer" size={48} />
          </div>
          <nav className="landing-footer-links" aria-label="Footer">
            <a href={ROUTES.landing}>Home</a>
            <a href={`${ROUTES.landing}#signup`}>Sign up</a>
            <a href="mailto:hello@pawstreakapp.com">Contact</a>
          </nav>
          <p className="landing-footer-note">&copy; {new Date().getFullYear()} PawStreak</p>
        </div>
      </footer>
    </div>
  )
}
