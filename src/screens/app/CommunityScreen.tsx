export function CommunityScreen() {
  return (
    <>
      <div className="aheader community-header">
        <div className="alogo">Community</div>
      </div>

      <section className="community-coming-soon detail-card-warm">
        <div className="community-coming-soon-icon" aria-hidden="true">
          <i className="ti ti-users" />
        </div>
        <h2 className="st-headline-md">Coming soon</h2>
        <p className="community-coming-soon-copy">
          Shared memories, pack activity, and local dog-friendly moments will live here.
        </p>
        <p className="community-coming-soon-copy community-coming-soon-copy--muted">
          For now, your adventures stay in Journey — no fake posts or activity counts.
        </p>
      </section>
    </>
  )
}
