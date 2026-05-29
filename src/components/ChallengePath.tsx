import type { ChallengePathDefinition } from '../data/challengePaths'
import type { ResolvedChallengeNode } from '../lib/challengePathProgress'
import { getChallengePathProgressSummary } from '../lib/challengePathProgress'
import { ChallengeNode } from './ChallengeNode'

interface ChallengePathProps {
  path: ChallengePathDefinition
  nodes: ResolvedChallengeNode[]
  onNodeSelect: (node: ResolvedChallengeNode) => void
}

export function ChallengePath({ path, nodes, onNodeSelect }: ChallengePathProps) {
  const progress = getChallengePathProgressSummary(nodes)

  return (
    <section className={`challenge-path challenge-path--${path.accent} detail-card-warm`}>
      <div className="challenge-path-header">
        <div>
          <div className="challenge-path-kicker">Challenge path</div>
          <h2 className="challenge-path-title">{path.title}</h2>
          <p className="challenge-path-sub">{path.subtitle}</p>
        </div>
        <div className="challenge-path-count">
          {progress.completed}/{progress.total}
        </div>
      </div>

      <div className="challenge-path-bar">
        <div
          className="challenge-path-bar-fill"
          style={{ width: progress.fillWidth }}
        />
      </div>

      <div className="challenge-path-track">
        <div className="challenge-path-line" aria-hidden="true" />
        {nodes.map((node, index) => (
          <ChallengeNode
            key={node.id}
            node={node}
            index={index}
            onSelect={onNodeSelect}
          />
        ))}
      </div>
    </section>
  )
}
