import type { ResolvedDogProgressionNode } from '../lib/dogProgressionEngine'
import { getJourneyEntryDisplayImageUrl } from '../lib/adventureDisplayImage'
import type { JourneyEntry } from '../data/demo'

interface JourneyStoryNodeCardProps {
  node: ResolvedDogProgressionNode
  journeyEntries: JourneyEntry[]
  onOpenMemory?: (entryId: string) => void
  onStartAdventure: () => void
  onGoToPlan?: () => void
}

export function JourneyStoryNodeCard({
  node,
  journeyEntries,
  onOpenMemory,
  onStartAdventure,
  onGoToPlan,
}: JourneyStoryNodeCardProps) {
  const heroPhoto =
    node.photoUrls[0] ??
    (node.journeyEntry
      ? getJourneyEntryDisplayImageUrl(journeyEntries, node.journeyEntry)
      : undefined)

  if (node.state === 'completed') {
    return (
      <article className="journey-story-node journey-story-node--completed">
        <div className="journey-story-node-spine" aria-hidden="true">
          <span className="journey-story-node-dot journey-story-node-dot--completed">
            <i className="ti ti-check" aria-hidden="true" />
          </span>
        </div>

        <button
          type="button"
          className="journey-story-node-card journey-story-node-card--completed tap-target"
          onClick={() => {
            if (node.journeyEntry && onOpenMemory) {
              onOpenMemory(node.journeyEntry.id)
            }
          }}
          disabled={!node.journeyEntry || !onOpenMemory}
        >
          <div className="journey-story-node-media">
            {heroPhoto ? (
              <img src={heroPhoto} alt="" className="journey-story-node-photo" />
            ) : (
              <div className="journey-story-node-photo journey-story-node-photo--empty">
                {node.emoji}
              </div>
            )}
            {node.photoUrls.length > 1 ? (
              <div className="journey-story-node-photo-stack" aria-hidden="true">
                {node.photoUrls.slice(1, 3).map((photo, index) => (
                  <img
                    key={`${node.id}-stack-${index}`}
                    src={photo}
                    alt=""
                    className="journey-story-node-photo-stack-item"
                  />
                ))}
              </div>
            ) : null}
          </div>

          <div className="journey-story-node-body">
            <div className="journey-story-node-meta">
              <span className="journey-story-node-chapter">{node.chapter}</span>
              <span className="journey-story-node-status journey-story-node-status--completed">
                {node.statusLabel}
              </span>
            </div>
            <h3 className="journey-story-node-title">{node.title}</h3>
            {node.journeyEntry ? (
              <p className="journey-story-node-memory">
                {node.journeyEntry.magicLine ?? node.journeyEntry.place}
              </p>
            ) : null}
            <div className="journey-story-node-stats">
              {node.completionDate ? (
                <span className="journey-story-node-stat">
                  <i className="ti ti-calendar" aria-hidden="true" />
                  {node.completionDate}
                </span>
              ) : null}
              {node.memoryCount > 0 ? (
                <span className="journey-story-node-stat">
                  <i className="ti ti-photo" aria-hidden="true" />
                  {node.memoryCount} {node.memoryCount === 1 ? 'memory' : 'memories'}
                </span>
              ) : null}
            </div>
          </div>
        </button>
      </article>
    )
  }

  if (node.state === 'current') {
    return (
      <article className="journey-story-node journey-story-node--current">
        <div className="journey-story-node-spine" aria-hidden="true">
          <span className="journey-story-node-dot journey-story-node-dot--current">
            {node.order}
          </span>
        </div>

        <div className="journey-story-node-card journey-story-node-card--current detail-card-warm">
          <div className="journey-story-node-body">
            <div className="journey-story-node-meta">
              <span className="journey-story-node-chapter">{node.chapter}</span>
              <span className="journey-story-node-status journey-story-node-status--current">
                {node.statusLabel}
              </span>
            </div>
            <h3 className="journey-story-node-title">
              <span className="journey-story-node-emoji" aria-hidden="true">
                {node.emoji}
              </span>
              {node.title}
            </h3>
            <p className="journey-story-node-copy">{node.description}</p>
            <p className="journey-story-node-hint">{node.planHint}</p>

            {node.journeyEntry && heroPhoto ? (
              <div className="journey-story-node-current-preview">
                <img src={heroPhoto} alt="" className="journey-story-node-current-photo" />
                <div>
                  <div className="journey-story-node-current-label">Latest memory</div>
                  <div className="journey-story-node-current-place">{node.journeyEntry.place}</div>
                </div>
              </div>
            ) : null}

            <button
              type="button"
              className="journey-story-node-cta tap-target"
              onClick={() => {
                if (onGoToPlan) {
                  onGoToPlan()
                  return
                }
                onStartAdventure()
              }}
            >
              Start Adventure
            </button>
          </div>
        </div>
      </article>
    )
  }

  return (
    <article className="journey-story-node journey-story-node--locked">
      <div className="journey-story-node-spine" aria-hidden="true">
        <span className="journey-story-node-dot journey-story-node-dot--locked">
          <i className="ti ti-lock" aria-hidden="true" />
        </span>
      </div>

      <div className="journey-story-node-card journey-story-node-card--locked">
        <div className="journey-story-node-body">
          <div className="journey-story-node-meta">
            <span className="journey-story-node-chapter">{node.chapter}</span>
            <span className="journey-story-node-status journey-story-node-status--locked">
              {node.statusLabel}
            </span>
          </div>
          <h3 className="journey-story-node-title">
            <span className="journey-story-node-emoji" aria-hidden="true">
              {node.emoji}
            </span>
            {node.title}
          </h3>
          <p className="journey-story-node-copy">{node.description}</p>
        </div>
      </div>
    </article>
  )
}
