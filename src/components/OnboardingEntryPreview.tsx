
/** Compact product preview for /app onboarding step 1 — no stats, pins, or phone chrome. */
export function OnboardingEntryPreview() {
  return (
    <div className="onboarding-entry-preview" aria-hidden="true">
      <p className="onboarding-entry-kicker">Today&apos;s adventure</p>

      <article className="onboarding-entry-adventure">
        <div className="product-preview-symbol"><i className="ti ti-compass" /></div>
        <h3 className="onboarding-entry-adventure-title">Today&apos;s outing</h3>
      </article>

      <article className="onboarding-entry-memory">
        <div className="product-preview-symbol product-preview-symbol--small"><i className="ti ti-camera" /></div>
        <div>
          <p className="onboarding-entry-memory-label">After your adventure</p>
          <p className="onboarding-entry-memory-title">Add your photo + note</p>
        </div>
      </article>

      <p className="product-preview-note">Your own places. Your own memories.</p>
    </div>
  )
}
