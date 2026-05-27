import { SAMPLE_IMAGES } from '../data/sampleImages'

/** Compact product preview for /app onboarding step 1 — no stats, pins, or phone chrome. */
export function OnboardingEntryPreview() {
  return (
    <div className="onboarding-entry-preview" aria-hidden="true">
      <p className="onboarding-entry-kicker">Today&apos;s adventure</p>

      <article className="onboarding-entry-adventure">
        <div
          className="onboarding-entry-adventure-image"
          style={{ backgroundImage: `url(${SAMPLE_IMAGES.beach})` }}
        />
        <h3 className="onboarding-entry-adventure-title">Dog Beach morning</h3>
      </article>

      <article className="onboarding-entry-memory">
        <div
          className="onboarding-entry-memory-thumb"
          style={{ backgroundImage: `url(${SAMPLE_IMAGES.coastal})` }}
        />
        <div>
          <p className="onboarding-entry-memory-label">Latest memory</p>
          <p className="onboarding-entry-memory-title">Sunny morning run</p>
        </div>
      </article>

      <div className="onboarding-entry-places">
        <span className="onboarding-entry-places-label">Your places</span>
        <div className="onboarding-entry-places-panel" />
      </div>
    </div>
  )
}
