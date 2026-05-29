import { navigateTo } from '../lib/demoRoute'
import {
  CTA_CREATE_ACCOUNT,
  CTA_START_FIRST_ADVENTURE,
  CTA_START_FREE,
  SIGNUP_SECTION_LEAD,
  SIGNUP_SECTION_TITLE,
} from '../lib/brand'
import { ROUTES } from '../lib/routes'

export function EarlyAccessScreen() {
  const openSignup = () => navigateTo(ROUTES.app)

  return (
    <div className="content-studio early-access-page">
      <header className="cs-header detail-tint detail-tint--warm">
        <div className="cs-kicker">PawStreak</div>
        <h1 className="cs-title">PawStreak is live</h1>
        <p className="cs-subtitle">
          {SIGNUP_SECTION_LEAD}
        </p>
      </header>

      <div className="cs-filters early-access-form-wrap">
        <div className="cs-empty early-access-success">
          <h2 className="early-access-live-title">{SIGNUP_SECTION_TITLE}</h2>
          <p className="early-access-live-copy">
            Plan walks, save memories, and build your dog&apos;s journey — free to start, live in
            early access beta today.
          </p>
          <div className="early-access-live-actions">
            <button type="button" className="demo-feedback-btn tap-target" onClick={openSignup}>
              {CTA_START_FREE}
            </button>
            <button type="button" className="demo-feedback-btn demo-feedback-btn--secondary tap-target" onClick={openSignup}>
              {CTA_CREATE_ACCOUNT}
            </button>
            <button type="button" className="cs-copy tap-target" onClick={openSignup}>
              {CTA_START_FIRST_ADVENTURE}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
