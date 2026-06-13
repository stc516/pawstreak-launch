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

export function CommunityScreen() {
  return (
    <>
      <div className="aheader community-header">
        <div className="alogo">Community Beta</div>
        <p className="community-beta-lead">
          See what other dog people are trying, saving, and planning.
        </p>
      </div>

      <section className="community-beta detail-card-warm">
        <div className="community-beta-kicker">Beta surface</div>
        <h2 className="st-headline-md">Start simple</h2>
        <p className="community-beta-copy">
          No fake users, no inflated activity counts. These prompts help beta testers share
          real adventures, local wins, and recommendation requests.
        </p>

        <div className="community-beta-actions">
          {COMMUNITY_BETA_ACTIONS.map((action) => (
            <button key={action.title} type="button" className="community-beta-action tap-target">
              <span className="community-beta-action-icon" aria-hidden="true">
                <i className={action.icon} />
              </span>
              <span className="community-beta-action-copy">
                <strong>{action.title}</strong>
                <small>{action.copy}</small>
              </span>
            </button>
          ))}
        </div>
      </section>
    </>
  )
}
