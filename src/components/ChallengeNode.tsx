import type { ResolvedChallengeNode } from '../lib/challengePathProgress'

interface ChallengeNodeProps {
  node: ResolvedChallengeNode
  onSelect: (node: ResolvedChallengeNode) => void
}

export function ChallengeNode({ node, onSelect }: ChallengeNodeProps) {
  const showPhoto = node.state === 'completed' && Boolean(node.thumbnailUrl)
  const stateIcon =
    node.state === 'completed'
      ? 'ti-check'
      : node.state === 'current'
        ? 'ti-arrow-right'
        : 'ti-lock'

  return (
    <div className="challenge-node-row">
      <button
        type="button"
        className={`challenge-node challenge-node--${node.state}${showPhoto ? ' challenge-node--has-photo' : ''} tap-target`}
        onClick={() => onSelect(node)}
        aria-label={`${node.name} — ${node.statusLabel}`}
      >
        <span className="challenge-node-circle">
          {node.state === 'completed' ? (
            showPhoto ? (
              <img src={node.thumbnailUrl} alt="" className="challenge-node-photo" />
            ) : (
              <i className="ti ti-check challenge-node-check" aria-hidden="true" />
            )
          ) : (
            <i className={`ti ${stateIcon}`} aria-hidden="true" />
          )}
          {node.state === 'completed' && showPhoto ? (
            <span className="challenge-node-photo-badge" aria-hidden="true">
              <i className="ti ti-check challenge-node-check" />
            </span>
          ) : null}
        </span>
        <span className="challenge-node-copy">
          <span className="challenge-node-step">Goal {node.order} · {node.statusLabel}</span>
          <span className="challenge-node-label">{node.name}</span>
        </span>
      </button>
    </div>
  )
}
