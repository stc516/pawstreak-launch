import { BrandLogoCircle } from './BrandLogoCircle'
import { BRAND_NAME } from '../lib/brand'

export function LandingPhonePreview() {
  return (
    <div className="landing-phone">
      <div className="landing-phone-notch" />
      <div className="landing-phone-screen landing-phone-screen--hero landing-phone-screen--preview">
        <div className="landing-phone-preview">
          <div className="landing-phone-preview-header">
            <BrandLogoCircle className="brand-logo-circle--phone" size={30} />
            <span className="landing-phone-preview-title">{BRAND_NAME}</span>
          </div>
          <div className="landing-phone-preview-content">
            <p className="landing-phone-preview-kicker">Today&apos;s adventure</p>

            <article className="landing-phone-adventure-card">
              <div className="product-preview-symbol" aria-hidden="true"><i className="ti ti-compass" /></div>
              <div className="landing-phone-adventure-body">
                <h3 className="landing-phone-adventure-title">Today&apos;s outing</h3>
                <p className="landing-phone-adventure-meta">Walk · memory · progress</p>
              </div>
            </article>

            <article className="landing-phone-memory-card">
              <div className="product-preview-symbol product-preview-symbol--small" aria-hidden="true"><i className="ti ti-camera" /></div>
              <div className="landing-phone-memory-copy">
                <p className="landing-phone-memory-label">After your adventure</p>
                <p className="landing-phone-memory-title">Add your photo + note</p>
              </div>
            </article>

            <p className="product-preview-note">Discover → go → remember</p>

            <span className="landing-phone-preview-cta">Start adventure</span>
          </div>
        </div>
      </div>
    </div>
  )
}
