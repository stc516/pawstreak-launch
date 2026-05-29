import type { ResolvedChallengeNode } from '../lib/challengePathProgress'

interface ChallengeNodeProps {
  node: ResolvedChallengeNode
  index: number
  onSelect: (node: ResolvedChallengeNode) => void
}

export function ChallengeNode({ node, index, onSelect }: ChallengeNodeProps) {
  const side = index % 2 === 0 ? 'left' : 'right'

  return (
    <div className={`challenge-node-row challenge-node-row--${side}`}>
      <button
        type="button"
        className={`challenge-node challenge-node--${node.state} tap-target`}
        onClick={() => onSelect(node)}
        aria-label={`${node.name} — ${node.statusLabel}`}
      >
        <span className="challenge-node-circle">
          {node.state === 'completed' ? (
            <i className="ti ti-check challenge-node-check" aria-hidden="true" />
          ) : (
            <span className="challenge-node-number">{node.order}</span>
          )}
        </span>
        <span className="challenge-node-label">{node.name}</span>
      </button>
    </div>
  )
}
