import { CardImage } from './CardImage'
import type { ResolvedChallengeNode } from '../lib/challengeEngine'

interface ChallengeStartOptions {
  durationLabel?: string
  startNow?: boolean
}

interface ChallengeNodeDetailProps {
  node: ResolvedChallengeNode | null
  onClose: () => void
  onStartAdventure: (placeId: string | undefined, options?: ChallengeStartOptions) => void
  onOpenMemory?: (entryId: string) => void
}

function getNodeDurationLabel(node: ResolvedChallengeNode): string {
  const text = `${node.title} ${node.description} ${node.planHint}`.toLowerCase()
  if (text.includes('10-minute') || text.includes('10 minute')) return '10 min'
  if (text.includes('20-minute') || text.includes('20 minute')) return '20 min'
  if (text.includes('5-minute') || text.includes('5 minute')) return '5 min'
  return 'Open end'
}

export function ChallengeNodeDetail({
  node,
  onClose,
  onStartAdventure,
  onOpenMemory,
}: ChallengeNodeDetailProps) {
  if (!node) return null

  const photos = node.journeyEntry?.photoUrls?.filter(Boolean) ?? []
  const heroImage = node.thumbnailUrl ?? node.imageUrl

  return (
    <div className={`challenge-node-detail${node ? ' challenge-node-detail--open' : ''}`}>
      <button
        type="button"
        className="challenge-node-detail-backdrop tap-target"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="challenge-node-detail-sheet detail-card-warm" role="dialog" aria-modal="true">
        <div className="challenge-node-detail-handle" aria-hidden="true" />

        <CardImage
          className="challenge-node-detail-img"
          imageUrl={heroImage}
          imageAlt={node.title}
          imageTone="coastal"
        />

        <div className="challenge-node-detail-body">
          <div className="challenge-node-detail-meta">
            <div className={`challenge-node-detail-status challenge-node-detail-status--${node.state}`}>
              {node.statusLabel}
            </div>
            {node.isGenericFallback ? (
              <span className="challenge-node-detail-tag">Activity goal</span>
            ) : null}
          </div>
          <h3 className="challenge-node-detail-title">{node.title}</h3>
          <p className="challenge-node-detail-copy">{node.description}</p>

          {node.state === 'completed' && node.journeyEntry ? (
            <>
              {(node.completionDate || node.memoryCount) ? (
                <div className="challenge-node-detail-stats">
                  {node.completionDate ? (
                    <span className="challenge-node-detail-stat">
                      <i className="ti ti-calendar" aria-hidden="true" />
                      {node.completionDate}
                    </span>
                  ) : null}
                  {node.memoryCount ? (
                    <span className="challenge-node-detail-stat">
                      <i className="ti ti-photo" aria-hidden="true" />
                      {node.memoryCount} {node.memoryCount === 1 ? 'memory' : 'memories'}
                    </span>
                  ) : null}
                </div>
              ) : null}
              <p className="challenge-node-detail-copy">
                {node.journeyEntry.magicLine ?? node.journeyEntry.emotionalLine ?? 'Memory saved.'}
              </p>
              {photos.length > 0 ? (
                <div className="challenge-node-detail-photos">
                  {photos.slice(0, 3).map((photo, index) => (
                    <img
                      key={`${node.id}-photo-${index}`}
                      src={photo}
                      alt=""
                      className="challenge-node-detail-photo"
                    />
                  ))}
                </div>
              ) : null}
              {onOpenMemory && node.journeyEntry ? (
                <button
                  type="button"
                  className="challenge-node-detail-secondary tap-target"
                  onClick={() => onOpenMemory(node.journeyEntry!.id)}
                >
                  View memory
                </button>
              ) : null}
            </>
          ) : node.state === 'current' ? (
            <p className="challenge-node-detail-copy">{node.planHint}</p>
          ) : (
            <p className="challenge-node-detail-copy">
              {node.unlockHint ?? 'Complete earlier milestones to unlock this step.'}
            </p>
          )}

          {node.state === 'current' ? (
            <button
              type="button"
              className="challenge-node-detail-cta tap-target"
              onClick={() => {
                onStartAdventure(node.placeId, {
                  durationLabel: getNodeDurationLabel(node),
                  startNow: true,
                })
                onClose()
              }}
            >
              Start this adventure
            </button>
          ) : null}

          <button
            type="button"
            className="challenge-node-detail-close tap-target"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
