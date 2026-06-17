import { BrandLogoCircle } from './BrandLogoCircle'
import { SAMPLE_IMAGES } from '../data/sampleImages'
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
              <div
                className="landing-phone-adventure-image"
                style={{ backgroundImage: `url(${SAMPLE_IMAGES.beach})` }}
              />
              <div className="landing-phone-adventure-body">
                <h3 className="landing-phone-adventure-title">Today&apos;s outing</h3>
                <p className="landing-phone-adventure-meta">Walk · memory · progress</p>
              </div>
            </article>

            <article className="landing-phone-memory-card">
              <div
                className="landing-phone-memory-thumb"
                style={{ backgroundImage: `url(${SAMPLE_IMAGES.coastal})` }}
              />
              <div className="landing-phone-memory-copy">
                <p className="landing-phone-memory-label">Latest memory</p>
                <p className="landing-phone-memory-title">Your saved moment</p>
              </div>
            </article>

            <div className="landing-phone-mini-map" aria-hidden="true">
              <span className="landing-phone-mini-map-label">Your places</span>
              <div className="landing-phone-mini-map-terrain">
                <span className="landing-phone-mini-map-pin" style={{ top: '58%', left: '32%' }} />
                <span className="landing-phone-mini-map-pin" style={{ top: '44%', left: '68%' }} />
              </div>
            </div>

            <span className="landing-phone-preview-cta">Start adventure</span>
          </div>
        </div>
      </div>
    </div>
  )
}
