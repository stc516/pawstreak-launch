import type { Challenge } from '../data/challenges'
import type { ResolvedChallengeNode } from '../lib/challengeEngine'
import { getChallengeProgressSummary } from '../lib/challengeEngine'
import { ChallengeNode } from './ChallengeNode'

interface ChallengePathProps {
  challenge: Challenge & { progress?: { metricValue: number; metricTarget: number } }
  nodes: ResolvedChallengeNode[]
  onNodeSelect: (node: ResolvedChallengeNode) => void
}

export function ChallengePath({ challenge, nodes, onNodeSelect }: ChallengePathProps) {
  const progress = getChallengeProgressSummary(nodes)

  return (
    <section className={`challenge-path challenge-path--${challenge.accent} detail-card-warm`}>
      <div className="challenge-path-header">
        <div>
          <div className="challenge-path-kicker">Goal list</div>
          <h2 className="challenge-path-title">Adventure goals</h2>
          <p className="challenge-path-sub">{challenge.subtitle}</p>
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
        {nodes.map((node) => (
          <ChallengeNode
            key={node.id}
            node={node}
            onSelect={onNodeSelect}
          />
        ))}
      </div>
    </section>
  )
}
