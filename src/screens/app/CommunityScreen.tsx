const COMMUNITY_BETA_ACTIONS = [
  {
    title: "Post today's adventure",
    copy: 'Share the outing you actually completed or are about to start.',
    icon: 'ti ti-map-pin',
  },
  {
    title: 'Share a dog-friendly win',
    copy: 'Patio success, calm greeting, good trail manners, or a tiny brave moment.',
    icon: 'ti ti-sparkles',
  },
  {
    title: 'Ask for a local recommendation',
    copy: 'Get ideas from other dog people without pretending there is a full network yet.',
    icon: 'ti ti-message-circle',
  },
  {
    title: 'Show your favorite walk',
    copy: 'Turn a real route or saved memory into something useful for the beta community.',
    icon: 'ti ti-route',
  },
]

const COMMUNITY_BETA_STEPS = [
  {
    label: 'Save real memories',
    detail: 'Completed walks and trips become the source for future posts.',
    icon: 'ti ti-camera-heart',
  },
  {
    label: 'Invite your pack',
    detail: 'Family, walkers, and sitters can stay close to the same dog story.',
    icon: 'ti ti-users-plus',
  },
  {
    label: 'Share when ready',
    detail: 'Community opens with real local activity, not placeholder feeds.',
    icon: 'ti ti-message-heart',
  },
]

export function CommunityScreen() {
  return (
    <>
      <div className="aheader community-header">
        <div className="alogo">Community Beta</div>
        <p className="community-beta-lead">
          Built around real outings, local recommendations, and people your dog actually knows.
        </p>
      </div>

      <section className="community-beta detail-card-warm">
        <div className="community-beta-kicker">Beta surface</div>
        <h2 className="st-headline-md">Community is opening carefully</h2>
        <p className="community-beta-copy">
          No fake users, no inflated activity counts. We&apos;ll start with real beta
          posts once enough local dog people are using PawStreak.
        </p>
        <div className="community-beta-steps">
          {COMMUNITY_BETA_STEPS.map((step) => (
            <article key={step.label} className="community-beta-step">
              <i className={step.icon} aria-hidden="true" />
              <strong>{step.label}</strong>
              <small>{step.detail}</small>
            </article>
          ))}
        </div>
        <p className="community-beta-note">
          Coming soon: share completed adventures, local wins, and recommendation
          requests from real PawStreak activity.
        </p>

        <div className="community-beta-actions">
          {COMMUNITY_BETA_ACTIONS.map((action) => (
            <article key={action.title} className="community-beta-action">
              <span className="community-beta-action-icon" aria-hidden="true">
                <i className={action.icon} />
              </span>
              <span className="community-beta-action-copy">
                <strong>{action.title}</strong>
                <small>{action.copy}</small>
              </span>
              <span className="community-beta-action-status">Coming soon</span>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
