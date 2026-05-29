import { CardImage } from './CardImage'
import type { ResolvedChallengeNode } from '../lib/challengeEngine'

interface ChallengeNodeDetailProps {
  node: ResolvedChallengeNode | null
  onClose: () => void
  onStartAdventure: (placeId: string) => void
  onGoToPlan?: () => void
  onOpenMemory?: (entryId: string) => void
}

export function ChallengeNodeDetail({
  node,
  onClose,
  onStartAdventure,
  onGoToPlan,
  onOpenMemory,
}: ChallengeNodeDetailProps) {
  if (!node) return null

  const photos = node.journeyEntry?.photoUrls?.filter(Boolean) ?? []

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
          imageUrl={node.imageUrl}
          imageAlt={node.title}
          imageTone="coastal"
        />

        <div className="challenge-node-detail-body">
          <div className={`challenge-node-detail-status challenge-node-detail-status--${node.state}`}>
            {node.statusLabel}
          </div>
          <h3 className="challenge-node-detail-title">{node.title}</h3>
          <p className="challenge-node-detail-copy">{node.description}</p>

          {node.state === 'completed' && node.journeyEntry ? (
            <>
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
              Complete earlier milestones to unlock this step.
            </p>
          )}

          {node.state === 'current' ? (
            <button
              type="button"
              className="challenge-node-detail-cta tap-target"
              onClick={() => {
                if (onGoToPlan) {
                  onGoToPlan()
                  onClose()
                  return
                }
                onStartAdventure('')
              }}
            >
              {onGoToPlan ? 'Go to Plan' : 'Start an adventure'}
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
